const { Expense, Income, MonthlyBudget } = require('../Schemas/expenseSchema');
const expenseRepository = require('../db/expense');
const { getMonthName, getYear, getMonthBoundaries } = require('../utils/utils-function');


// ── Internal Helpers (not exported) ──────────────────────

const calculateMonthlyTotal = async (Model, userId, startOfMonth, endOfMonth, dateField = 'date') => {
    const [result] = await Model.aggregate([
        { $match: { userId, [dateField]: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, amount: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);
    return result ? { amount: result.amount, count: result.count } : { amount: 0, count: 0 };
};

const getMonthlyTotalExpense = (userId, start, end) => calculateMonthlyTotal(Expense, userId, start, end, 'date');
const getMonthlyTotalIncome = (userId, start, end) => calculateMonthlyTotal(Income, userId, start, end, 'createdAt');

const getTopCategories = async (userId, startOfMonth, endOfMonth) => {
    return Expense.aggregate([
        { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "category" } },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        { $group: { _id: "$category._id", categoryName: { $first: "$category.name" }, totalAmount: { $sum: "$amount" } } },
        { $sort: { totalAmount: -1 } },
        { $limit: 3 },
        { $project: { _id: 0, categoryId: "$_id", name: "$categoryName", amount: "$totalAmount" } }
    ]);
};

const getCurrentMonthBudget = async (userId, startOfMonth) => {
    const month = getMonthName(startOfMonth);
    const year = getYear(startOfMonth);

    const [result] = await MonthlyBudget.aggregate([
        { $match: { userId, month, year } },
        { $lookup: { from: 'budgetallocations', localField: '_id', foreignField: 'budgetId', as: 'allocations' } },
        { $project: { _id: 1, amount: 1, alertThreshold: 1, allocationCount: { $size: '$allocations' } } }
    ]);
    return result || {};
};

const getExpenseRecords = async (userId, startOfMonth, endOfMonth) => {
    return Expense.aggregate([
        { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $lookup: { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category' } },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $project: { _id: 1, userId: 1, amount: 1, note: 1, date: 1, createdAt: 1, recurringRuleId: 1, 'category._id': 1, 'category.name': 1 } },
        { $sort: { date: -1 } }
    ]);
};

const getSpendingByCategory = async (userId, startOfMonth, endOfMonth) => {
    return Expense.aggregate([
        { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: "$categoryId", totalSpent: { $sum: "$amount" } } },
        { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, categoryId: "$_id", name: "$category.name", totalSpent: 1 } }
    ]);
};

// A budget stores its period as month name + year strings ("June", "2026").
// Reconstruct the UTC date range from those, since expense dates are stored
// and queried in UTC. Day 15 keeps the date inside the month in any timezone.
const getBudgetMonthBoundaries = (budget) => {
    const monthIndex = new Date(`${budget.month} 1, 2000`).getMonth();
    return getMonthBoundaries(new Date(Date.UTC(Number(budget.year), monthIndex, 15)));
};


// ── Recurring rules ──────────────────────────────────────

// Next occurrence strictly after `fromDate`. Monthly anchors 29-31 clamp to
// the last day of shorter months, but the anchor itself never mutates —
// rent on the 31st runs Feb 28, then back to the 31st in March. Weekdays
// (Mon-Fri) skips Sat/Sun — built for things like a daily office commute.
// Records are stamped at 12:00 UTC so the calendar day is stable across
// timezones.
const DAY_MS = 24 * 60 * 60 * 1000;

const nextOccurrence = (frequency, anchorDay, fromDate, daysOfWeek) => {
    if (frequency === 'daily') {
        // daysOfWeek narrows which weekdays run; empty/missing = every day.
        // Cap at 8 steps so a malformed set can't loop forever.
        const days = Array.isArray(daysOfWeek) && daysOfWeek.length > 0 ? daysOfWeek : null;
        let next = new Date(fromDate.getTime() + DAY_MS);
        if (days) {
            let guard = 0;
            while (!days.includes(next.getUTCDay()) && guard < 8) {
                next = new Date(next.getTime() + DAY_MS);
                guard += 1;
            }
        }
        return next;
    }
    if (frequency === 'weekdays') {
        // legacy value — equivalent to daily with Mon-Fri
        let next = new Date(fromDate.getTime() + DAY_MS);
        while (next.getUTCDay() === 0 || next.getUTCDay() === 6) {
            next = new Date(next.getTime() + DAY_MS);
        }
        return next;
    }
    if (frequency === 'weekly') {
        return new Date(fromDate.getTime() + 7 * DAY_MS);
    }
    const y = fromDate.getUTCFullYear();
    const m = fromDate.getUTCMonth() + 1;
    const daysInTarget = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    return new Date(Date.UTC(y, m, Math.min(anchorDay, daysInTarget), 12, 0, 0));
};

// Generous cap: fully materializes normal gaps (weekly/biweekly app opens of
// a daily rule) so totals aren't chronically understated. It only truncates
// pathological absences, and the dropped count is surfaced to the client.
const BACKFILL_CAP = 60;

/**
 * Materialize due recurring records. Runs lazily on every month/dashboard
 * read — no scheduler needed. Per-rule failures are swallowed so one bad
 * rule can't block the fetch. Deleting a materialized record never
 * regenerates it: the rule's nextRunDate pointer is independent of records.
 */
const materializeDueRecurring = async (userId) => {
    const now = new Date();
    let materialized = 0;
    let skipped = 0;

    const dueRules = await expenseRepository.findDueRecurringRules(userId, now);
    for (const rule of dueRules) {
        try {
            const occurrences = [];
            let next = rule.nextRunDate;
            let guard = 0;
            while (next <= now && guard < 120) {
                occurrences.push(next);
                next = nextOccurrence(rule.frequency, rule.anchorDay, next, rule.daysOfWeek);
                guard += 1;
            }
            if (occurrences.length === 0) continue;

            // Claim the whole catch-up atomically; a parallel request that
            // already advanced the pointer makes this a no-op.
            const claimed = await expenseRepository.claimRecurringRun(rule._id, rule.nextRunDate, next);
            if (!claimed) continue;

            const toInsert = occurrences.slice(-BACKFILL_CAP);
            skipped += occurrences.length - toInsert.length;

            for (const when of toInsert) {
                if (rule.kind === 'expense') {
                    await expenseRepository.insertExpense(
                        rule.userId, rule.amount, rule.categoryId, rule.note, when, rule._id
                    );
                } else {
                    await expenseRepository.insertIncome(
                        rule.userId, rule.amount, rule.source, rule.note,
                        { createdAt: when, recurringRuleId: rule._id }
                    );
                }
                materialized += 1;
            }
        } catch (error) {
            console.error(`Recurring materialization failed for rule ${rule._id}:`, error.message);
        }
    }

    return { materialized, skipped };
};

const createRecurringRule = async (userId, { kind, amount, categoryId, source, note, frequency, anchorDate, daysOfWeek }) => {
    if (!['expense', 'income'].includes(kind)) throw new Error('Invalid kind');
    if (!amount || amount <= 0) throw new Error('Amount must be greater than 0');
    if (!['daily', 'weekdays', 'weekly', 'monthly'].includes(frequency)) throw new Error('Invalid frequency');

    // Day picker only applies to daily rules; all 7 days = no restriction
    let ruleDays;
    if (frequency === 'daily' && Array.isArray(daysOfWeek)) {
        const cleaned = [...new Set(daysOfWeek)].filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
        if (cleaned.length === 0) throw new Error('Select at least one day');
        if (cleaned.length < 7) ruleDays = cleaned;
    }

    if (kind === 'expense') {
        const category = await expenseRepository.findCategoryById(categoryId);
        if (!category) throw new Error('Category not found');
    } else if (!source) {
        throw new Error('Source is required for recurring income');
    }

    const anchor = anchorDate ? new Date(anchorDate) : new Date();
    if (isNaN(anchor)) throw new Error('Invalid anchor date');

    const anchorDay =
        frequency === 'monthly' ? anchor.getUTCDate()
        : frequency === 'weekly' ? anchor.getUTCDay()
        : 0; // daily/weekdays don't anchor to a specific day
    // The triggering record is logged separately — the rule starts next period
    const nextRunDate = nextOccurrence(frequency, anchorDay, anchor, ruleDays);

    const rule = await expenseRepository.insertRecurringRule({
        userId, kind, amount, note, frequency, anchorDay, nextRunDate,
        ...(ruleDays ? { daysOfWeek: ruleDays } : {}),
        ...(kind === 'expense' ? { categoryId } : { source }),
    });
    return { rule };
};

// Rough runs-per-month, for the "৳X/mo" summary line
const runsPerMonth = (rule) => {
    if (rule.frequency === 'monthly') return 1;
    if (rule.frequency === 'weekly') return 4;
    if (rule.frequency === 'weekdays') return 22;
    // daily: scale by how many weekdays are enabled (all 7 ≈ 30/month)
    const dayCount = rule.daysOfWeek?.length || 7;
    return Math.round((30 * dayCount) / 7);
};

const getRecurringRules = async (userId) => {
    const rules = await expenseRepository.findRecurringRulesByUser(userId);
    const monthlyExpenseTotal = rules
        .filter((r) => r.kind === 'expense' && r.isActive)
        .reduce((sum, r) => sum + r.amount * runsPerMonth(r), 0);
    return { rules, monthlyExpenseTotal };
};

const updateRecurringRule = async (userId, ruleId, { amount, note, isActive, anchorDay }) => {
    const rule = await expenseRepository.findRecurringRuleById(userId, ruleId);
    if (!rule) throw new Error('Recurring rule not found');

    const updateData = {};
    if (amount !== undefined) {
        if (isNaN(amount) || amount <= 0) throw new Error('Amount must be greater than 0');
        updateData.amount = amount;
    }
    if (note !== undefined) updateData.note = note;
    if (anchorDay !== undefined) updateData.anchorDay = anchorDay;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (Object.keys(updateData).length === 0) throw new Error('Nothing to update');

    // Resuming a paused rule (or moving its anchor) must not backfill the
    // paused stretch — restart the pointer from now.
    const resuming = isActive === true && !rule.isActive;
    if (resuming || anchorDay !== undefined) {
        const effectiveAnchor = anchorDay !== undefined ? anchorDay : rule.anchorDay;
        updateData.nextRunDate = nextOccurrence(rule.frequency, effectiveAnchor, new Date(), rule.daysOfWeek);
    }

    const updated = await expenseRepository.updateRecurringRuleById(userId, ruleId, updateData);
    return { rule: updated };
};

const deleteRecurringRule = async (userId, ruleId) => {
    const deleted = await expenseRepository.deleteRecurringRuleById(userId, ruleId);
    if (!deleted) throw new Error('Recurring rule not found');
    return { message: 'Deleted successfully' };
};

// "Make it automatic?" detection: a similar expense (same category, amount
// ±10%) existed last month and no active rule already covers it.
const detectRecurringCandidate = async (userId, categoryId, amount) => {
    const min = amount * 0.9;
    const max = amount * 1.1;

    const existingRule = await expenseRepository.findActiveRecurringRuleMatch(userId, categoryId, min, max);
    if (existingRule) return false;

    const now = new Date();
    const lastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 15));
    const { startOfMonth, endOfMonth } = getMonthBoundaries(lastMonth);
    const match = await expenseRepository.findSimilarExpenseInRange(userId, categoryId, min, max, startOfMonth, endOfMonth);
    return Boolean(match);
};


// ── Expense CRUD ─────────────────────────────────────────

const addExpense = async (userId, amount, categoryId, note, date) => {
    const category = await expenseRepository.findCategoryById(categoryId);
    if (!category) throw new Error('Category not found');

    const expense = await expenseRepository.insertExpense(userId, amount, categoryId, note, date);

    // Suggest "make it automatic?" only for current-dated logs; a failed
    // check must never fail the save itself.
    let recurringSuggestion = false;
    if (!date) {
        try {
            recurringSuggestion = await detectRecurringCandidate(userId, categoryId, amount);
        } catch (error) {
            console.error('Recurring detection failed:', error.message);
        }
    }

    return {
        _id: expense._id,
        amount: expense.amount,
        note: expense.note,
        date: expense.date,
        category: { _id: category._id, name: category.name },
        createdAt: expense.createdAt,
        recurringSuggestion
    };
};

const deleteExpense = async (userId, expenseId) => {
    const expense = await expenseRepository.deleteExpenseById(userId, expenseId);
    if (!expense) throw new Error('Expense not found');
    return { message: "Deleted successfully" };
};

const updateExpense = async (userId, expenseId, { amount, note, categoryId, date }) => {
    const updateData = {};
    if (amount !== undefined) updateData.amount = amount;
    if (note !== undefined) updateData.note = note;
    if (date !== undefined) updateData.date = date;
    if (categoryId !== undefined) {
        const category = await expenseRepository.findCategoryById(categoryId);
        if (!category) throw new Error('Category not found');
        updateData.categoryId = categoryId;
    }

    const updated = await expenseRepository.updateExpenseById(userId, expenseId, updateData);
    if (!updated) throw new Error('Expense not found');
    return updated;
};


// ── Income CRUD ──────────────────────────────────────────

const addIncome = async (userId, amount, source, note) => {
    return expenseRepository.insertIncome(userId, amount, source, note);
};

const updateIncome = async (userId, incomeId, { amount, source, note }) => {
    const updateData = {};
    if (amount !== undefined) {
        if (isNaN(amount) || amount <= 0) throw new Error('Amount must be greater than 0');
        updateData.amount = amount;
    }
    if (source !== undefined) {
        if (!String(source).trim()) throw new Error('Source cannot be empty');
        updateData.source = source;
    }
    if (note !== undefined) updateData.note = note;
    if (Object.keys(updateData).length === 0) throw new Error('Nothing to update');

    const updated = await expenseRepository.updateIncomeById(userId, incomeId, updateData);
    if (!updated) throw new Error('Income record not found');
    return updated;
};

const deleteIncome = async (userId, incomeId) => {
    const deleted = await expenseRepository.deleteIncomeById(userId, incomeId);
    if (!deleted) throw new Error('Income record not found');
    return { message: 'Deleted successfully' };
};


// ── Budget ───────────────────────────────────────────────

const addMonthlyBudget = async (userId, amount, alertThreshold) => {
    const now = new Date();
    const month = getMonthName(now);
    const year = getYear(now);

    const existing = await expenseRepository.findMonthlyBudget(userId, month, year);
    if (existing) throw new Error("Budget already exists for this month. Please update instead.");

    const budgetData = { userId, amount, month, year };
    if (alertThreshold !== undefined) budgetData.alertThreshold = alertThreshold;

    const newBudget = await expenseRepository.insertMonthlyBudget(budgetData);
    return { newBudget };
};

const getMonthlyBudget = async (userId, month, year) => {
    const queryMonth = month || getMonthName(new Date());
    const queryYear = year || getYear(new Date());
    return expenseRepository.findMonthlyBudget(userId, queryMonth, queryYear);
};

const updateMonthlyBudget = async (userId, budgetId, amount, alertThreshold) => {
    const updateData = {};
    if (amount !== undefined) updateData.amount = amount;
    if (alertThreshold !== undefined) updateData.alertThreshold = alertThreshold;

    const updated = await expenseRepository.updateMonthlyBudget(userId, budgetId, updateData);
    if (!updated) throw new Error("Budget not found");
    return { budget: updated };
};


// ── Budget Allocation ────────────────────────────────────

const getBudgetBreakdown = async (userId, budgetId) => {
    const budget = await expenseRepository.findBudgetById(budgetId);
    if (!budget || budget.userId !== userId) throw new Error("Budget not found");

    // Spending window always follows the budget's own month, not "now".
    const { startOfMonth, endOfMonth } = getBudgetMonthBoundaries(budget);

    const [allocations, spendingByCategory] = await Promise.all([
        expenseRepository.findBudgetAllocationsByBudgetId(budgetId),
        getSpendingByCategory(userId, startOfMonth, endOfMonth)
    ]);

    const spending = spendingByCategory.reduce((map, item) => {
        map[item.categoryId.toString()] = item;
        return map;
    }, {});

    const categories = allocations.map(a => {
        const spent = spending[a.categoryId._id.toString()]?.totalSpent || 0;
        return {
            _id: a._id,
            budgetId: a.budgetId,
            categoryId: a.categoryId._id,
            categoryName: a.categoryId.name,
            allocatedAmount: a.allocatedAmount,
            spent,
            remaining: a.allocatedAmount - spent,
            createdAt: a.createdAt
        };
    });

    // Virtual rows: categories with spending this month but no saved
    // allocation. Computed at read time, never persisted — they become real
    // rows only when the user assigns an amount (upsert on update).
    const allocatedIds = new Set(allocations.map(a => a.categoryId._id.toString()));
    for (const item of spendingByCategory) {
        if (allocatedIds.has(item.categoryId.toString())) continue;
        categories.push({
            _id: `virtual-${item.categoryId}`,
            budgetId: budget._id,
            categoryId: item.categoryId,
            categoryName: item.name,
            allocatedAmount: 0,
            spent: item.totalSpent,
            remaining: -item.totalSpent,
            isVirtual: true
        });
    }

    return {
        budgetId: budget._id,
        amount: budget.amount,
        month: budget.month,
        year: budget.year,
        categories
    };
};

const allocateBudget = async (userId, budgetId, categoryId, allocatedAmount) => {
    const budget = await expenseRepository.findBudgetById(budgetId);
    if (!budget || budget.userId !== userId) throw new Error("No record found to attach");

    const existing = await expenseRepository.findBudgetAllocation(userId, budgetId, categoryId);
    if (existing) throw new Error("A budget allocation for this category already exists. Please update the existing allocation or select a different category.");

    const newAllocation = await expenseRepository.insertBudgetAllocation({
        userId, budgetId, categoryId, allocatedAmount
    });
    return { newAllocation };
};

const updateAllocatedCategory = async (userId, budgetId, categoryId, amount) => {
    const [budget, allocation] = await Promise.all([
        expenseRepository.findBudgetById(budgetId),
        expenseRepository.findBudgetAllocation(userId, budgetId, categoryId)
    ]);

    if (!budget || budget.userId !== userId) throw new Error("No record found to update");

    // Upsert: editing a virtual (unbudgeted) row creates the real allocation.
    if (!allocation) {
        const newAllocation = await expenseRepository.insertBudgetAllocation({
            userId, budgetId, categoryId, allocatedAmount: amount
        });
        return { updatedAllocation: newAllocation };
    }

    const updatedAllocation = await expenseRepository.updateBudgetAllocation(userId, budgetId, categoryId, amount);
    return { updatedAllocation };
};


// ── Aggregated Views ─────────────────────────────────────

const getExpenseDetailsOfMonth = async (userId, startOfMonth, endOfMonth) => {
    // Lazy materialization: due recurring records spring into existence on read
    const recurring = await materializeDueRecurring(userId);

    const [totalSpend, totalIncome, topCategory, expenseRecords, incomeRecords, monthlyBudget] = await Promise.all([
        getMonthlyTotalExpense(userId, startOfMonth, endOfMonth),
        getMonthlyTotalIncome(userId, startOfMonth, endOfMonth),
        getTopCategories(userId, startOfMonth, endOfMonth),
        getExpenseRecords(userId, startOfMonth, endOfMonth),
        expenseRepository.findIncomeRecordsInRange(userId, startOfMonth, endOfMonth),
        getCurrentMonthBudget(userId, startOfMonth)
    ]);

    return { totalSpend, totalIncome, topCategory, expenseRecords, incomeRecords, monthlyBudget, recurring };
};

const getDashboardSummary = async (userId, startOfMonth, endOfMonth) => {
    await materializeDueRecurring(userId);

    const [totalSpend, totalIncome, topCategory, budget] = await Promise.all([
        getMonthlyTotalExpense(userId, startOfMonth, endOfMonth),
        getMonthlyTotalIncome(userId, startOfMonth, endOfMonth),
        getTopCategories(userId, startOfMonth, endOfMonth),
        getCurrentMonthBudget(userId, startOfMonth)
    ]);

    return { totalSpend, totalIncome, topCategory, budget };
};


// ── Analytics ────────────────────────────────────────────

// Monetary amounts inside insight text use the ¤ token; the client swaps it
// for the user's currency symbol. Keeps text composition portable while the
// symbol stays correct per user.
const CUR = '¤';
const money = (n) => `${CUR}${Math.round(n).toLocaleString('en-US')}`;
const pctChange = (cur, prev) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null);

const monthStartUTC = (y, m) => new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
const monthEndUTC = (y, m) => new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));

// Resolve a named range to current + previous-equal-length windows.
// Date.UTC handles negative month indices (rolls the year back) for us.
const resolveRange = (rangeKey) => {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth();

    switch (rangeKey) {
        case 'last-month':
            return {
                key: 'last-month', label: 'Last month', lower: 'last month',
                granularity: 'day', monthsBack: 1,
                start: monthStartUTC(y, m - 1), end: monthEndUTC(y, m - 1),
                prevStart: monthStartUTC(y, m - 2), prevEnd: monthEndUTC(y, m - 2),
            };
        case '3-months':
            return {
                key: '3-months', label: 'Last 3 months', lower: 'over the last 3 months',
                granularity: 'month', monthsBack: 3,
                start: monthStartUTC(y, m - 2), end: monthEndUTC(y, m),
                prevStart: monthStartUTC(y, m - 5), prevEnd: monthEndUTC(y, m - 3),
            };
        case '6-months':
            return {
                key: '6-months', label: 'Last 6 months', lower: 'over the last 6 months',
                granularity: 'month', monthsBack: 6,
                start: monthStartUTC(y, m - 5), end: monthEndUTC(y, m),
                prevStart: monthStartUTC(y, m - 11), prevEnd: monthEndUTC(y, m - 6),
            };
        case 'this-month':
        default:
            return {
                key: 'this-month', label: 'This month', lower: 'this month',
                granularity: 'day', monthsBack: 1,
                start: monthStartUTC(y, m), end: monthEndUTC(y, m),
                prevStart: monthStartUTC(y, m - 1), prevEnd: monthEndUTC(y, m - 1),
            };
    }
};

const sumInRange = async (Model, field, userId, start, end) => {
    const [r] = await Model.aggregate([
        { $match: { userId, [field]: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return r ? r.total : 0;
};

const dailyTotals = async (Model, field, userId, start, end) => {
    const rows = await Model.aggregate([
        { $match: { userId, [field]: { $gte: start, $lte: end } } },
        { $group: { _id: { $dayOfMonth: { date: `$${field}`, timezone: 'UTC' } }, total: { $sum: '$amount' } } }
    ]);
    const map = {};
    rows.forEach((r) => { map[r._id] = r.total; });
    return map;
};

const monthlyTotals = async (Model, field, userId, start, end) => {
    const rows = await Model.aggregate([
        { $match: { userId, [field]: { $gte: start, $lte: end } } },
        { $group: { _id: { y: { $year: { date: `$${field}`, timezone: 'UTC' } }, m: { $month: { date: `$${field}`, timezone: 'UTC' } } }, total: { $sum: '$amount' } } }
    ]);
    const map = {};
    rows.forEach((r) => { map[`${r._id.y}-${r._id.m}`] = r.total; });
    return map;
};

const buildDailySeries = (spendMap, incomeMap, start, end) => {
    const days = end.getUTCDate();
    const monthShort = start.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    const pts = [];
    for (let d = 1; d <= days; d++) {
        pts.push({ label: String(d), fullLabel: `${monthShort} ${d}`, spend: spendMap[d] || 0, income: incomeMap[d] || 0 });
    }
    return pts;
};

const buildMonthlySeries = (spendMap, incomeMap, end, monthsBack) => {
    const y = end.getUTCFullYear();
    const mo = end.getUTCMonth();
    const pts = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
        const d = new Date(Date.UTC(y, mo - i, 1));
        const yy = d.getUTCFullYear();
        const mm = d.getUTCMonth() + 1;
        pts.push({
            label: d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
            fullLabel: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
            spend: spendMap[`${yy}-${mm}`] || 0,
            income: incomeMap[`${yy}-${mm}`] || 0,
        });
    }
    return pts;
};

// Sum of upcoming recurring EXPENSE occurrences from each rule's next run
// through the end of the month. Due records are materialized before this
// runs, so nextRunDate is already in the future.
const recurringDueThroughEndOfMonth = (rules, end) => {
    let total = 0;
    for (const rule of rules) {
        let cursor = rule.nextRunDate;
        let guard = 0;
        while (cursor <= end && guard < 62) {
            total += rule.amount;
            cursor = nextOccurrence(rule.frequency, rule.anchorDay, cursor, rule.daysOfWeek);
            guard += 1;
        }
    }
    return total;
};

// Aggregation-dressed-as-intelligence. Returns ranked insight objects
// (id, tone, icon, text, optional action) — ranked by salience, top 5.
// Money amounts use the ¤ token the client swaps for the currency symbol.
const buildInsights = (ctx) => {
    const {
        range, totals, prevTotals, categories, prevCategoryMap, series, budget,
        allocations, recurringSoFar, recurringStillDue, recurringMonthly,
        daysInMonth, today, daysLeft,
    } = ctx;
    const out = [];
    const isThisMonth = range.key === 'this-month';

    // 1. Recurring-aware forecast + safe-to-spend (this month, budget set).
    // projected = spent so far + recurring still due + projected discretionary.
    // This avoids the lumpiness that breaks a naive spend/day × days estimate.
    if (isThisMonth && budget > 0 && totals.spend > 0 && today >= 3) {
        const discretionarySoFar = Math.max(totals.spend - recurringSoFar, 0);
        const dailyDiscretionary = discretionarySoFar / today;
        const projected = totals.spend + recurringStillDue + dailyDiscretionary * daysLeft;
        const diff = projected - budget;
        const remaining = budget - totals.spend - recurringStillDue;
        const safePerDay = daysLeft > 0 ? remaining / daysLeft : remaining;

        if (diff > 0) {
            let text = `Careful, you're on track to spend about ${money(projected)} this month, ${money(diff)} over budget.`;
            text += safePerDay > 0
                ? ` Try to keep the rest under ${money(safePerDay)} a day.`
                : ` Your upcoming bills already use up what's left, so go easy on extras.`;
            out.push({ id: 'forecast', tone: 'warn', icon: 'gauge', score: 100, text });
        } else {
            let text = `Nice pace. You're on track for about ${money(projected)} this month, ${money(-diff)} under budget.`;
            if (safePerDay > 0 && daysLeft > 0) text += ` That's about ${money(safePerDay)} a day left to spend.`;
            out.push({ id: 'forecast', tone: 'good', icon: 'gauge', score: 70, text });
        }
    }

    // 2. Per-category budget burn — the worst category at/over its allocation
    if (isThisMonth && allocations.length) {
        let worst = null;
        for (const a of allocations) {
            if (a.allocated <= 0) continue;
            const usedPct = Math.round((a.spent / a.allocated) * 100);
            if (usedPct >= 80 && (!worst || usedPct > worst.usedPct)) worst = { ...a, usedPct };
        }
        if (worst) {
            out.push(worst.usedPct >= 100
                ? { id: 'cat-burn', tone: 'warn', icon: 'target', score: 95, action: 'budget', text: `You've gone over on ${worst.name}, ${money(worst.spent)} spent against your ${money(worst.allocated)} budget.` }
                : { id: 'cat-burn', tone: 'warn', icon: 'target', score: 80, action: 'budget', text: `You're at ${worst.usedPct}% of your ${worst.name} budget${daysLeft > 0 ? ` with ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} to go` : ''} (${money(worst.spent)} of ${money(worst.allocated)}).` });
        }
    }

    // 3. No budget yet — nudge to set one (unlocks the forecast)
    if (isThisMonth && budget === 0 && totals.spend > 0) {
        out.push({ id: 'set-budget', tone: 'neutral', icon: 'target', score: 60, action: 'budget', text: `Set a monthly budget to see if you're on track and get a daily safe-to-spend number.` });
    }

    // 4. Net saved / overspent
    if (totals.income > 0) {
        const net = totals.income - totals.spend;
        out.push(net >= 0
            ? { id: 'net', tone: 'good', icon: 'piggy', score: 40, text: `You came out ahead by ${money(net)} ${range.lower}. Nice work.` }
            : { id: 'net', tone: 'warn', icon: 'alert', score: 55, text: `Heads up, you spent ${money(-net)} more than you earned ${range.lower}.` });
    }

    // 5. Recurring commitment vs income
    if (isThisMonth && recurringMonthly > 0 && totals.income > 0) {
        const ratio = Math.round((recurringMonthly / totals.income) * 100);
        if (ratio >= 25) {
            out.push({ id: 'commitment', tone: ratio >= 50 ? 'warn' : 'neutral', icon: 'repeat', score: 50, text: `Your recurring bills run about ${money(recurringMonthly)} a month, ${ratio}% of what you earn.` });
        }
    }

    // 6. Biggest category jump vs the previous period
    let jump = null;
    for (const c of categories) {
        const prev = prevCategoryMap[c.categoryId] || 0;
        if (prev > 0 && c.total > prev) {
            const change = pctChange(c.total, prev);
            if (change !== null && change >= 20) {
                const delta = c.total - prev;
                if (!jump || delta > jump.delta) jump = { name: c.name, change, prev, cur: c.total, delta };
            }
        }
    }
    if (jump) {
        out.push({ id: 'cat-jump', tone: 'warn', icon: 'trend-up', score: 45, text: `You're spending more on ${jump.name} lately, up ${jump.change}% from ${money(jump.prev)} to ${money(jump.cur)}.` });
    }

    // 7. Overall spend trend vs the previous period
    if (prevTotals.spend > 0) {
        const change = pctChange(totals.spend, prevTotals.spend);
        if (change !== null && Math.abs(change) >= 10) {
            out.push(change > 0
                ? { id: 'spend-trend', tone: 'warn', icon: 'trend-up', score: 35, text: `You're spending ${change}% more than the period before. Worth keeping an eye on.` }
                : { id: 'spend-trend', tone: 'good', icon: 'trend-down', score: 35, text: `Your spending is down ${-change}% from the period before. Keep it up.` });
        }
    }

    // 8. Top category share
    if (categories.length && totals.spend > 0) {
        const top = categories[0];
        out.push({ id: 'top-cat', tone: 'neutral', icon: 'pie', score: 20, text: `Most of your money went to ${top.name} this time, ${top.pct}% of it (${money(top.total)}).` });
    }

    // 9. Biggest single day (daily ranges only)
    if (range.granularity === 'day') {
        let peak = null;
        for (const p of series) if (!peak || p.spend > peak.spend) peak = p;
        if (peak && peak.spend > 0) {
            out.push({ id: 'big-day', tone: 'neutral', icon: 'calendar', score: 15, text: `${peak.fullLabel} was your biggest spending day at ${money(peak.spend)}.` });
        }
    }

    return out
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(({ score, ...rest }) => rest);
};

const getAnalytics = async (userId, rangeKey) => {
    const range = resolveRange(rangeKey);

    // Materialize due recurring records first so every total below counts them
    await materializeDueRecurring(userId);

    const [spend, income, prevSpend, prevIncome, catRows, prevCatRows] = await Promise.all([
        sumInRange(Expense, 'date', userId, range.start, range.end),
        sumInRange(Income, 'createdAt', userId, range.start, range.end),
        sumInRange(Expense, 'date', userId, range.prevStart, range.prevEnd),
        sumInRange(Income, 'createdAt', userId, range.prevStart, range.prevEnd),
        getSpendingByCategory(userId, range.start, range.end),
        getSpendingByCategory(userId, range.prevStart, range.prevEnd),
    ]);

    const totals = { spend, income, balance: income - spend };

    const categories = catRows
        .filter((c) => c.totalSpent > 0)
        .map((c) => ({ categoryId: String(c.categoryId), name: c.name || 'Uncategorized', total: c.totalSpent }))
        .sort((a, b) => b.total - a.total)
        .map((c) => ({ ...c, pct: spend > 0 ? Math.round((c.total / spend) * 100) : 0 }));

    const prevCategoryMap = {};
    prevCatRows.forEach((c) => { prevCategoryMap[String(c.categoryId)] = c.totalSpent; });

    let series;
    if (range.granularity === 'day') {
        const [sMap, iMap] = await Promise.all([
            dailyTotals(Expense, 'date', userId, range.start, range.end),
            dailyTotals(Income, 'createdAt', userId, range.start, range.end),
        ]);
        series = buildDailySeries(sMap, iMap, range.start, range.end);
    } else {
        const [sMap, iMap] = await Promise.all([
            monthlyTotals(Expense, 'date', userId, range.start, range.end),
            monthlyTotals(Income, 'createdAt', userId, range.start, range.end),
        ]);
        series = buildMonthlySeries(sMap, iMap, range.end, range.monthsBack);
    }

    // Budget- and recurring-aware extras only make sense for the live month
    let budget = 0;
    let allocations = [];
    let recurringSoFar = 0;
    let recurringStillDue = 0;
    let recurringMonthly = 0;
    if (range.key === 'this-month') {
        const b = await getCurrentMonthBudget(userId, range.start);
        budget = b.amount || 0;

        const spentByCat = {};
        catRows.forEach((c) => { spentByCat[String(c.categoryId)] = c.totalSpent; });

        const [rules, recRows, allocs] = await Promise.all([
            expenseRepository.findRecurringRulesByUser(userId),
            Expense.aggregate([
                { $match: { userId, date: { $gte: range.start, $lte: range.end }, recurringRuleId: { $exists: true, $ne: null } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            b._id ? expenseRepository.findBudgetAllocationsByBudgetId(b._id) : Promise.resolve([]),
        ]);

        recurringSoFar = recRows[0]?.total || 0;
        const activeExpenseRules = rules.filter((r) => r.kind === 'expense' && r.isActive);
        recurringStillDue = recurringDueThroughEndOfMonth(activeExpenseRules, range.end);
        recurringMonthly = activeExpenseRules.reduce((s, r) => s + r.amount * runsPerMonth(r), 0);
        allocations = allocs.map((a) => ({
            categoryId: String(a.categoryId._id),
            name: a.categoryId.name,
            allocated: a.allocatedAmount,
            spent: spentByCat[String(a.categoryId._id)] || 0,
        }));
    }

    const now = new Date();
    const daysInMonth = range.end.getUTCDate();
    const today = Math.min(now.getUTCDate(), daysInMonth);
    const daysLeft = Math.max(daysInMonth - today, 0);

    const insights = buildInsights({
        range, totals, prevTotals: { spend: prevSpend, income: prevIncome },
        categories, prevCategoryMap, series, budget,
        allocations, recurringSoFar, recurringStillDue, recurringMonthly,
        daysInMonth, today, daysLeft,
    });

    return {
        range: { key: range.key, label: range.label, granularity: range.granularity },
        totals,
        budget,
        categories,
        series,
        insights,
    };
};


// ── Category ─────────────────────────────────────────────

const getCategoryList = async () => {
    return expenseRepository.findDefaultCategories();
};


module.exports = {
    addExpense,
    deleteExpense,
    updateExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    addMonthlyBudget,
    getMonthlyBudget,
    updateMonthlyBudget,
    getBudgetBreakdown,
    allocateBudget,
    updateAllocatedCategory,
    getExpenseDetailsOfMonth,
    getDashboardSummary,
    getAnalytics,
    getCategoryList,
    createRecurringRule,
    getRecurringRules,
    updateRecurringRule,
    deleteRecurringRule,
};
