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

        const result = await expenseService.addIncome(req.user.id, amount, source, note);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
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
        const { startOfMonth, endOfMonth } = getMonthBoundaries(new Date());

        const content = await expenseService.getBudgetBreakdown(req.user.id, budgetId, startOfMonth, endOfMonth);
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
    deleteExpenseHandler,
    addIncomeHandler,
    addMonthlyBudgetHandler,
    updateMonthlyBudgetHandler,
    getMonthlyBudgetHandler,
    allocateBudgetHandler,
    getBudgetBreakdownHandler,
    updateAllocatedCategoryHandler,
    getExpenseDetailsHandler,
    getDashboardSummaryHandler,
    getCategoryListHandler,
};
