const expenseService = require('../services/expenseServices');
const { getMonthBoundaries } = require('../utils/utils-function');


// ── Expense ──────────────────────────────────────────────

/**
 * @desc    Add a new expense record
 * @route   POST /api/v1/expenses
 * @access  Private
 */
const addExpenseHandler = async (req, res) => {
    try {
        const { amount, categoryId, note, date } = req.body;
        if (!amount || !categoryId) {
            return res.status(400).json({ msg: 'Please fill in all fields' });
        }
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ msg: 'Amount must be greater than 0' });
        }

        // Validate date if provided (must not be in the future)
        let expenseDate;
        if (date) {
            expenseDate = new Date(date);
            if (isNaN(expenseDate)) {
                return res.status(400).json({ msg: 'Invalid date format' });
            }
            if (expenseDate > new Date()) {
                return res.status(400).json({ msg: 'Date cannot be in the future' });
            }
        }

        const result = await expenseService.addExpense(req.user.id, amount, categoryId, note, expenseDate);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
};

/**
 * @desc    Update an expense record (amount, note, categoryId, date)
 * @route   PATCH /api/v1/expenses/:id
 * @access  Private
 */
const updateExpenseHandler = async (req, res) => {
    try {
        const { amount, note, categoryId, date } = req.body;
        if (amount === undefined && note === undefined && categoryId === undefined && date === undefined) {
            return res.status(400).json({ msg: 'Nothing to update' });
        }
        if (amount !== undefined && (isNaN(amount) || amount <= 0)) {
            return res.status(400).json({ msg: 'Amount must be greater than 0' });
        }

        let expenseDate;
        if (date !== undefined) {
            expenseDate = new Date(date);
            if (isNaN(expenseDate)) {
                return res.status(400).json({ msg: 'Invalid date format' });
            }
            if (expenseDate > new Date()) {
                return res.status(400).json({ msg: 'Date cannot be in the future' });
            }
        }

        const result = await expenseService.updateExpense(req.user.id, req.params.id, {
            amount, note, categoryId, date: expenseDate
        });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.message.includes('not found') ? 404 : 400).json({ msg: error.message });
    }
};

/**
 * @desc    Delete an expense record
 * @route   DELETE /api/v1/expenses/:id
 * @access  Private
 */
const deleteExpenseHandler = async (req, res) => {
    try {
        const result = await expenseService.deleteExpense(req.user.id, req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.message.includes('not found') ? 404 : 400).json({ msg: error.message });
    }
};


// ── Income ───────────────────────────────────────────────

/**
 * @desc    Add a new income record
 * @route   POST /api/v1/expenses/add-income
 * @access  Private
 */
const addIncomeHandler = async (req, res) => {
    try {
        const { amount, source, note } = req.body;
        if (!amount || !source) {
            return res.status(400).json({ msg: 'Please fill in all fields' });
        }
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ msg: 'Amount must be greater than 0' });
        }

        const result = await expenseService.addIncome(req.user.id, amount, source, note);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};


/**
 * @desc    Update an income record (amount, source, note)
 * @route   PATCH /api/v1/expenses/income/:id
 * @access  Private
 */
const updateIncomeHandler = async (req, res) => {
    try {
        const { amount, source, note } = req.body;
        const result = await expenseService.updateIncome(req.user.id, req.params.id, { amount, source, note });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.message.includes('not found') ? 404 : 400).json({ msg: error.message });
    }
};

/**
 * @desc    Delete an income record
 * @route   DELETE /api/v1/expenses/income/:id
 * @access  Private
 */
const deleteIncomeHandler = async (req, res) => {
    try {
        const result = await expenseService.deleteIncome(req.user.id, req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.message.includes('not found') ? 404 : 500).json({ msg: error.message });
    }
};


// ── Budget ───────────────────────────────────────────────

/**
 * @desc    Add monthly budget
 * @route   POST /api/v1/expenses/monthly-budget
 * @access  Private
 */
const addMonthlyBudgetHandler = async (req, res) => {
    try {
        const { amount, alertThreshold } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ msg: "Amount must be greater than 0" });
        }

        const result = await expenseService.addMonthlyBudget(req.user.id, amount, alertThreshold);
        return res.status(201).json(result);
    } catch (error) {
        if (error.code === 11000 || error.message.includes('already exists')) {
            return res.status(409).json({ msg: "Budget already exists for this month" });
        }
        return res.status(500).json({ msg: error.message });
    }
};

/**
 * @desc    Update monthly budget amount or alert threshold
 * @route   PATCH /api/v1/expenses/monthly-budget
 * @access  Private
 */
const updateMonthlyBudgetHandler = async (req, res) => {
    try {
        const { budgetId, amount, alertThreshold } = req.body;
        if (!budgetId) {
            return res.status(400).json({ msg: "Budget ID is required" });
        }
        if (amount !== undefined && amount <= 0) {
            return res.status(400).json({ msg: "Amount must be greater than 0" });
        }

        const result = await expenseService.updateMonthlyBudget(req.user.id, budgetId, amount, alertThreshold);
        return res.status(200).json(result);
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ msg: error.message });
        }
        return res.status(500).json({ msg: error.message });
    }
};

/**
 * @desc    Get monthly budget
 * @route   GET /api/v1/expenses/monthly-budget
 * @access  Private
 */
const getMonthlyBudgetHandler = async (req, res) => {
    try {
        const { month, year } = req.query;
        const budget = await expenseService.getMonthlyBudget(req.user.id, month, year);

        if (!budget) return res.status(404).json({});
        return res.status(200).json({ budget });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};


// ── Budget Allocation ────────────────────────────────────

/**
 * @desc    Allocate budget to a category
 * @route   POST /api/v1/expenses/budget-allocate
 * @access  Private
 */
const allocateBudgetHandler = async (req, res) => {
    try {
        const { budgetId, categoryId, allocatedAmount } = req.body;
        if (!allocatedAmount || allocatedAmount <= 0) {
            return res.status(400).json({ msg: "Amount must be greater than 0" });
        }

        const result = await expenseService.allocateBudget(req.user.id, budgetId, categoryId, allocatedAmount);
        return res.status(201).json(result);
    } catch (error) {
        if (error.message.includes('already exists')) {
            return res.status(409).json({ msg: error.message });
        }
        return res.status(500).json({ msg: error.message });
    }
};

/**
 * @desc    Get budget breakdown with allocations and spending
 * @route   GET /api/v1/expenses/budget-allocate
 * @access  Private
 */
const getBudgetBreakdownHandler = async (req, res) => {
    try {
        const { budgetId } = req.query;
        if (!budgetId) {
            return res.status(400).json({ msg: "Budget ID is required" });
        }

        const content = await expenseService.getBudgetBreakdown(req.user.id, budgetId);
        return res.status(200).json(content);
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ msg: error.message });
        }
        return res.status(500).json({ msg: error.message });
    }
};

/**
 * @desc    Update allocated category amount
 * @route   PATCH /api/v1/expenses/budget-allocate
 * @access  Private
 */
const updateAllocatedCategoryHandler = async (req, res) => {
    try {
        const { budgetId, categoryId, amount } = req.body;
        if (!budgetId || !categoryId || !amount) {
            return res.status(400).json({ msg: "Missing required fields" });
        }
        if (amount <= 0) {
            return res.status(400).json({ msg: "Amount must be greater than 0" });
        }

        const result = await expenseService.updateAllocatedCategory(req.user.id, budgetId, categoryId, amount);
        return res.status(200).json(result);
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ msg: error.message });
        }
        return res.status(500).json({ msg: error.message });
    }
};


// ── Aggregated Views ─────────────────────────────────────

/**
 * @desc    Get expense details for a specific month
 * @route   GET /api/v1/expenses/details
 * @access  Private
 */
const getExpenseDetailsHandler = async (req, res) => {
    try {
        const { date } = req.query;
        const selectedDate = new Date(date);
        if (isNaN(selectedDate)) {
            return res.status(400).json({ msg: "Invalid date format" });
        }

        const { startOfMonth, endOfMonth } = getMonthBoundaries(selectedDate);
        const content = await expenseService.getExpenseDetailsOfMonth(req.user.id, startOfMonth, endOfMonth);
        return res.status(200).json(content);
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
};

/**
 * @desc    Get expense dashboard summary for current month
 * @route   GET /api/v1/expenses/dashboard-summary
 * @access  Private
 */
const getDashboardSummaryHandler = async (req, res) => {
    try {
        const { startOfMonth, endOfMonth } = getMonthBoundaries(new Date());
        const data = await expenseService.getDashboardSummary(req.user.id, startOfMonth, endOfMonth);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};


/**
 * @desc    Analytics for the insights sheet (totals, category breakdown,
 *          time series, and ranked insights) for a named range
 * @route   GET /api/v1/expenses/analytics?range=this-month|last-month|3-months|6-months
 * @access  Private
 */
const getAnalyticsHandler = async (req, res) => {
    try {
        const data = await expenseService.getAnalytics(req.user.id, req.query.range);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};


// ── Recurring Rules ──────────────────────────────────────

/**
 * @desc    Create a recurring rule
 * @route   POST /api/v1/expenses/recurring
 * @access  Private
 */
const createRecurringRuleHandler = async (req, res) => {
    try {
        const { kind, amount, categoryId, source, note, frequency, anchorDate, daysOfWeek } = req.body;
        const result = await expenseService.createRecurringRule(req.user.id, {
            kind, amount, categoryId, source, note, frequency, anchorDate, daysOfWeek
        });
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
};

/**
 * @desc    List recurring rules (+ derived monthly expense total)
 * @route   GET /api/v1/expenses/recurring
 * @access  Private
 */
const getRecurringRulesHandler = async (req, res) => {
    try {
        const result = await expenseService.getRecurringRules(req.user.id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

/**
 * @desc    Update a recurring rule (amount, note, anchorDay, isActive — pause/resume)
 * @route   PATCH /api/v1/expenses/recurring/:id
 * @access  Private
 */
const updateRecurringRuleHandler = async (req, res) => {
    try {
        const { amount, note, isActive, anchorDay } = req.body;
        const result = await expenseService.updateRecurringRule(req.user.id, req.params.id, {
            amount, note, isActive, anchorDay
        });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.message.includes('not found') ? 404 : 400).json({ msg: error.message });
    }
};

/**
 * @desc    Delete a recurring rule (already-materialized records are untouched)
 * @route   DELETE /api/v1/expenses/recurring/:id
 * @access  Private
 */
const deleteRecurringRuleHandler = async (req, res) => {
    try {
        const result = await expenseService.deleteRecurringRule(req.user.id, req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.message.includes('not found') ? 404 : 500).json({ msg: error.message });
    }
};


// ── Category ─────────────────────────────────────────────

/**
 * @desc    Get category list
 * @route   GET /api/v1/expenses/category
 * @access  Private
 */
const getCategoryListHandler = async (req, res) => {
    try {
        const categories = await expenseService.getCategoryList();
        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};


module.exports = {
    addExpenseHandler,
    updateExpenseHandler,
    deleteExpenseHandler,
    addIncomeHandler,
    updateIncomeHandler,
    deleteIncomeHandler,
    addMonthlyBudgetHandler,
    updateMonthlyBudgetHandler,
    getMonthlyBudgetHandler,
    allocateBudgetHandler,
    getBudgetBreakdownHandler,
    updateAllocatedCategoryHandler,
    getExpenseDetailsHandler,
    getDashboardSummaryHandler,
    getAnalyticsHandler,
    getCategoryListHandler,
    createRecurringRuleHandler,
    getRecurringRulesHandler,
    updateRecurringRuleHandler,
    deleteRecurringRuleHandler,
};
