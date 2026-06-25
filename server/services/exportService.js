const PDFDocument = require('pdfkit');
const { Expense, Income } = require('../Schemas/expenseSchema');

// ── Data gathering ───────────────────────────────────────
// Pull every expense + income in [from, to] and flatten into one unified row
// list. Amount is SIGNED — expenses negative, income positive — which both
// sums correctly in a spreadsheet and matches the dominant import convention
// (Monarch / Beyond Budget). Sorted chronologically (statement order).
const gatherTransactions = async (userId, from, to) => {
  const [expenses, incomes] = await Promise.all([
    Expense.find({ userId, date: { $gte: from, $lte: to } })
      .populate('categoryId', 'name')
      .select('amount categoryId note date recurringRuleId')
      .lean(),
    Income.find({ userId, createdAt: { $gte: from, $lte: to } })
      .select('amount source note createdAt recurringRuleId')
      .lean(),
  ]);

  const rows = [
    ...expenses.map((e) => ({
      date: e.date,
      type: 'Expense',
      category: e.categoryId?.name || 'Uncategorized',
      note: e.note || '',
      amount: -Math.abs(e.amount), // expense → negative
      recurring: Boolean(e.recurringRuleId),
    })),
    ...incomes.map((i) => ({
      date: i.createdAt, // income has no `date`; createdAt is its timestamp
      type: 'Income',
      category: i.source || 'Income',
      note: i.note || '',
      amount: Math.abs(i.amount), // income → positive
      recurring: Boolean(i.recurringRuleId),
    })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  return rows;
};

// Totals + category breakdown — used by the PDF statement (Phase 2).
const summarize = (rows) => {
  let income = 0;
  let spend = 0;
  const byCategory = new Map();
  for (const r of rows) {
    if (r.type === 'Income') {
      income += r.amount;
    } else {
      spend += -r.amount; // back to positive magnitude
      byCategory.set(r.category, (byCategory.get(r.category) || 0) + -r.amount);
    }
  }
  const categories = [...byCategory.entries()]
    .map(([name, total]) => ({ name, total, pct: spend > 0 ? Math.round((total / spend) * 100) : 0 }))
    .sort((a, b) => b.total - a.total);
  return { income, spend, net: income - spend, categories };
};

// ── Helpers ──────────────────────────────────────────────
const isoDay = (d) => new Date(d).toISOString().slice(0, 10);
const filenameFor = (job, ext) =>
  `tracero-${isoDay(job.range.from)}_to_${isoDay(job.range.to)}.${ext}`;

// Quote + neutralize spreadsheet formula injection for free-text cells. A note
// like "=SUM(A1:A9)" must not execute when opened in Excel/Sheets.
const csvText = (val) => {
  let s = String(val ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
};

// ── CSV ──────────────────────────────────────────────────
const CSV_HEADERS = ['Date', 'Type', 'Category', 'Note', 'Amount', 'Currency', 'Recurring'];

const buildCsv = (rows, job) => {
  const lines = [CSV_HEADERS.join(',')];
  for (const r of rows) {
    lines.push(
      [
        isoDay(r.date),
        r.type,
        csvText(r.category),
        csvText(r.note),
        r.amount.toFixed(2), // numeric — never run through the injection guard
        csvText(job.currency || ''),
        r.recurring ? 'Yes' : '',
      ].join(',')
    );
  }
  // BOM so Excel reads UTF-8 correctly; CRLF line endings for Excel friendliness.
  const csv = '﻿' + lines.join('\r\n');
  return {
    buffer: Buffer.from(csv, 'utf8'),
    filename: filenameFor(job, 'csv'),
    mimeType: 'text/csv; charset=utf-8',
  };
};

// ── PDF statement ────────────────────────────────────────
const COLORS = {
  primary: '#6366F1',
  fg: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  green: '#16A34A',
  red: '#DC2626',
};

const moneyRounded = (n, symbol) =>
  `${n < 0 ? '-' : ''}${symbol}${Math.round(Math.abs(n)).toLocaleString('en-US')}`;
const moneyExact = (n, symbol) =>
  `${n < 0 ? '-' : ''}${symbol}${Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// A clean one-statement PDF: header, summary band, category breakdown, and a
// paginated transactions ledger. Resolves with the assembled Buffer.
const buildPdf = (rows, job) =>
  new Promise((resolve, reject) => {
    try {
      const symbol = job.symbol || '';
      const { income, spend, net, categories } = summarize(rows);

      const doc = new PDFDocument({ size: 'A4', margin: 48, bufferPages: true });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () =>
        resolve({
          buffer: Buffer.concat(chunks),
          filename: filenameFor(job, 'pdf'),
          mimeType: 'application/pdf',
        })
      );
      doc.on('error', reject);

      const left = doc.page.margins.left;
      const right = doc.page.width - doc.page.margins.right;
      const contentW = right - left;
      const bottom = doc.page.height - doc.page.margins.bottom;

      // Header
      doc.fillColor(COLORS.primary).font('Helvetica-Bold').fontSize(20).text('Tracero', left, left);
      doc.fillColor(COLORS.fg).font('Helvetica-Bold').fontSize(13).text('Transactions statement');
      doc.fillColor(COLORS.muted).font('Helvetica').fontSize(9);
      doc.text(
        `${isoDay(job.range.from)}  →  ${isoDay(job.range.to)}${job.range.label ? `   ·   ${job.range.label}` : ''}`
      );
      doc.text(`Generated ${isoDay(new Date())}  ·  ${rows.length} ${rows.length === 1 ? 'transaction' : 'transactions'}`);
      doc.moveDown(1);

      // Summary band — Income / Spent / Net across three columns
      const summaryY = doc.y;
      const colW = contentW / 3;
      const stat = (label, value, color, i) => {
        const x = left + i * colW;
        doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(8).text(label.toUpperCase(), x, summaryY, { width: colW - 8 });
        doc.fillColor(color).font('Helvetica-Bold').fontSize(15).text(value, x, summaryY + 12, { width: colW - 8 });
      };
      stat('Income', moneyRounded(income, symbol), COLORS.green, 0);
      stat('Spent', moneyRounded(spend, symbol), COLORS.red, 1);
      stat('Net', moneyRounded(net, symbol), net >= 0 ? COLORS.green : COLORS.red, 2);
      doc.y = summaryY + 42;
      doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor(COLORS.border).lineWidth(1).stroke();
      doc.moveDown(0.8);

      // Category breakdown
      if (categories.length) {
        doc.fillColor(COLORS.fg).font('Helvetica-Bold').fontSize(11).text('By category', left, doc.y);
        doc.moveDown(0.4);
        categories.slice(0, 12).forEach((c) => {
          const y = doc.y;
          doc.fillColor(COLORS.fg).font('Helvetica').fontSize(9).text(c.name, left, y, { width: contentW * 0.5, ellipsis: true, lineBreak: false });
          doc.fillColor(COLORS.muted).text(`${c.pct}%`, left + contentW * 0.5, y, { width: contentW * 0.2, align: 'right' });
          doc.fillColor(COLORS.fg).font('Helvetica-Bold').text(moneyRounded(c.total, symbol), left + contentW * 0.7, y, { width: contentW * 0.3, align: 'right' });
          doc.y = y + 14;
        });
        doc.moveDown(0.8);
      }

      // Transactions ledger (paginated)
      const cols = [
        { label: 'Date', x: left, w: 60, align: 'left' },
        { label: 'Type', x: left + 62, w: 48, align: 'left' },
        { label: 'Category', x: left + 112, w: 100, align: 'left' },
        { label: 'Note', x: left + 214, w: 150, align: 'left' },
        { label: 'Amount', x: left + 366, w: contentW - 366, align: 'right' },
      ];
      const rowH = 16;
      const drawTableHeader = () => {
        const y = doc.y;
        doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(8);
        cols.forEach((c) => doc.text(c.label.toUpperCase(), c.x, y, { width: c.w, align: c.align, lineBreak: false }));
        doc.y = y + 14;
        doc.moveTo(left, doc.y - 2).lineTo(right, doc.y - 2).strokeColor(COLORS.border).lineWidth(0.5).stroke();
      };

      doc.fillColor(COLORS.fg).font('Helvetica-Bold').fontSize(11).text('Transactions', left, doc.y);
      doc.moveDown(0.4);
      drawTableHeader();

      rows.forEach((r) => {
        if (doc.y + rowH > bottom) {
          doc.addPage();
          drawTableHeader();
        }
        const y = doc.y;
        doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.fg);
        doc.text(isoDay(r.date), cols[0].x, y, { width: cols[0].w, lineBreak: false });
        doc.text(r.type, cols[1].x, y, { width: cols[1].w, lineBreak: false });
        doc.text(r.category, cols[2].x, y, { width: cols[2].w, ellipsis: true, lineBreak: false });
        doc.fillColor(COLORS.muted).text(r.note || '—', cols[3].x, y, { width: cols[3].w, ellipsis: true, lineBreak: false });
        doc.font('Helvetica-Bold').fillColor(r.amount < 0 ? COLORS.red : COLORS.green)
          .text(moneyExact(r.amount, symbol), cols[4].x, y, { width: cols[4].w, align: 'right', lineBreak: false });
        doc.y = y + rowH;
      });

      if (!rows.length) {
        doc.fillColor(COLORS.muted).font('Helvetica').fontSize(10).text('No transactions in this range.', left, doc.y + 4);
      }

      // Footer page numbers
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(pages.start + i);
        doc.fillColor(COLORS.muted).font('Helvetica').fontSize(8);
        doc.text('Generated by Tracero · tracero.me', left, bottom + 14, { width: contentW / 2, align: 'left', lineBreak: false });
        doc.text(`Page ${i + 1} of ${pages.count}`, left + contentW / 2, bottom + 14, { width: contentW / 2, align: 'right', lineBreak: false });
      }

      doc.end();
    } catch (e) {
      reject(e);
    }
  });

// ── Entry point used by the worker ───────────────────────
const generate = async (job) => {
  const { from, to } = job.range;
  const rows = await gatherTransactions(job.userId, from, to);
  if (job.format === 'csv') return buildCsv(rows, job);
  if (job.format === 'pdf') return buildPdf(rows, job);
  throw new Error(`Unsupported export format: ${job.format}`);
};

module.exports = {
  generate,
  gatherTransactions,
  summarize,
  buildCsv,
  buildPdf,
  filenameFor,
};
