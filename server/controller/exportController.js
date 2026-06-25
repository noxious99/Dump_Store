const ExportJob = require('../Schemas/exportJobSchema');

// At most one in-flight export per user — exports are cheap but we don't want a
// user queuing dozens and hammering the worker.
const MAX_INFLIGHT = 1;

/**
 * @desc    Queue a data export (CSV/PDF) for a date range
 * @route   POST /api/v1/exports   body: { format, from, to, currency, symbol, label }
 * @access  Private
 */
const createExport = async (req, res) => {
  try {
    const { format, from, to, currency, symbol, label } = req.body;

    if (!['csv', 'pdf'].includes(format)) {
      return res.status(400).json({ msg: 'Invalid export format' });
    }
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    if (!fromDate || !toDate || isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ msg: 'Invalid date range' });
    }
    if (fromDate > toDate) {
      return res.status(400).json({ msg: 'Range start must be before end' });
    }

    const inflight = await ExportJob.countDocuments({
      userId: req.user.id,
      status: { $in: ['queued', 'processing'] },
    });
    if (inflight >= MAX_INFLIGHT) {
      return res.status(429).json({ msg: 'An export is already in progress — hang tight.' });
    }

    const job = await ExportJob.create({
      userId: req.user.id,
      format,
      range: { from: fromDate, to: toDate, label: label || '' },
      currency: currency || '',
      symbol: symbol || '',
    });

    return res.status(201).json({ jobId: job._id, status: job.status });
  } catch (err) {
    console.error('createExport error:', err.message);
    return res.status(500).json({ msg: 'Could not start export' });
  }
};

/**
 * @desc    Poll an export job's status (never returns the file bytes)
 * @route   GET /api/v1/exports/:id
 * @access  Private
 */
const getExportStatus = async (req, res) => {
  try {
    const job = await ExportJob.findOne({ _id: req.params.id, userId: req.user.id }).select('-file');
    if (!job) return res.status(404).json({ msg: 'Export not found' });
    return res.json({
      jobId: job._id,
      status: job.status,
      format: job.format,
      filename: job.filename,
      mimeType: job.mimeType,
      size: job.size,
      error: job.error,
    });
  } catch (err) {
    return res.status(404).json({ msg: 'Export not found' });
  }
};

/**
 * @desc    Download a ready export's file (ownership-checked, no caching)
 * @route   GET /api/v1/exports/:id/download
 * @access  Private
 */
const downloadExport = async (req, res) => {
  try {
    const job = await ExportJob.findOne({ _id: req.params.id, userId: req.user.id });
    if (!job) return res.status(404).json({ msg: 'Export not found' });
    if (job.status !== 'ready' || !job.file) {
      return res.status(409).json({ msg: 'Export is not ready yet' });
    }
    res.setHeader('Content-Type', job.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${job.filename || 'tracero-export'}"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.send(job.file);
  } catch (err) {
    return res.status(404).json({ msg: 'Export not found' });
  }
};

module.exports = { createExport, getExportStatus, downloadExport };
