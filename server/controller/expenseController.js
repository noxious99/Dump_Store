const expenseService = require('../services/expenseServices');
const { getMonthBoundaries } = require('../utils/utils-function');


// @desc    Add a new expense record
// @route   POST /api/expenses
// @access  Private
const addExpenseHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, categoryId, note } = req.body;

        if (!amount || !categoryId) {
            return res.status(400).json({ msg: 'Please fill in all fields' });
        }

        const result = await expenseService.addExpense(userId, amount, categoryId, note);
        return res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};


// @desc    Delete an expense record
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpenseHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        const expenseId = req.params.id;

        const result = await expenseService.deleteExpense(userId, expenseId);
        return res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};


// @desc    Add a new income record
// @route   POST /api/expenses/add-income
// @access  Private
const addIncomeHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, source, note } = req.body;

        if (!amount || !source) {
            return res.status(400).json({ msg: 'Please fill in all fields' });
        }

        const newIncome = await expenseService.addIncome(userId, amount, source, note);
        return res.status(201).json(newIncome);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


// @desc    Get expense dashboard summary for current month
// @route   GET /api/expenses/dashboard-summary
// @access  Private
const getDashboardSummaryHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const { startOfMonth, endOfMonth } = getMonthBoundaries(now);

        const data = await expenseService.getDashboardSummary(userId, startOfMonth, endOfMonth);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
};


// @desc    Add monthly budget
// @route   POST /api/expenses/monthly-budget
// @access  Private
const addMonthlyBudgetHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        let { amount, alertThreshold } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ msg: "Amount must be greater than 0" });
        }

        const result = await expenseService.addMonthlyBudget(userId, amount, alertThreshold);
        return res.status(201).json(result);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                msg: "Budget already exists for this month"
            });
        }
        return res.status(500).json({ msg: error.message });
    }
};


// @desc    Get monthly budget
// @route   GET /api/expenses/monthly-budget
// @access  Private
const getMonthlyBudgetHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        let { month, year } = req.query;

        const budget = await expenseService.getMonthlyBudget(userId, month, year);
        if (!budget) {
            return res.status(404).json({});
        }

        return res.status(200).json({ budget });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};


// @desc    Get budget breakdown with allocations
// @route   GET /api/expenses/budget-allocate
// @access  Private
const getBudgetBreakdownHandler = async (req, res) => {
    try {
        const { budgetId } = req.query;
        const userId = req.user?.id;

        const budget = await expenseService.getMonthlyBudget(userId, null, null);
        const date = new Date();
        const { startOfMonth, endOfMonth } = getMonthBoundaries(date);

        const content = await expenseService.getBudgetBreakdown(userId, budgetId, startOfMonth, endOfMonth);
        return res.status(200).json(content);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};


// @desc    Allocate budget by category
// @route   POST /api/expenses/budget-allocate
// @access  Private
const allocateBudgetHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { budgetId, categoryId, allocatedAmount } = req.body;

        if (allocatedAmount <= 0) {
            return res.status(400).json({ msg: "Amount must be greater than 0" });
        }

        const result = await expenseService.allocateBudget(userId, budgetId, categoryId, allocatedAmount);
        return res.status(201).json(result);
    } catch (error) {
        if (error.message.includes("already exists")) {
            return res.status(409).json({ msg: error.message });
        }
        return res.status(500).json({ msg: error.message });
    }
};


// @desc    Update allocated category amount
// @route   PATCH /api/expenses/budget-allocate
// @access  Private
const updateAllocatedCategoryHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { budgetId, categoryId, amount } = req.body;

        if (!budgetId || !categoryId || !amount) {
            return res.status(400).json({ msg: "Missing required fields" });
        }

        if (amount <= 0) {
            return res.status(400).json({ msg: "Amount must be greater than 0" });
        }

        const result = await expenseService.updateAllocatedCategory(userId, budgetId, categoryId, amount);
        return res.status(200).json(result);
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ msg: error.message });
        }
        return res.status(500).json({ msg: error.message });
    }
};


// @desc    Get expense details for a specific month
// @route   GET /api/expenses/details
// @access  Private
const getExpenseDetailsHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        let { date } = req.query;

        const selectedDate = new Date(date);
        if (isNaN(selectedDate)) {
            return res.status(400).json({ msg: "Invalid date format" });
        }

        const { startOfMonth, endOfMonth } = getMonthBoundaries(selectedDate);
        const content = await expenseService.getExpenseDetailsOfMonth(userId, startOfMonth, endOfMonth);

        return res.status(200).json(content);
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
};


// @desc    Get monthly summary (legacy endpoint)
// @route   GET /api/expenses/getsummary/monthly/:month/:year
// @access  Private
const getMonthlySummaryHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        const month = parseInt(req.params.month);
        const year = parseInt(req.params.year);

        const result = await expenseService.getMonthlySummary(userId, month, year);
        return res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


// @desc    Get category list
// @route   GET /api/expenses/category
// @access  Private
const getCategoryListHandler = async (req, res) => {
    try {
        const categoryList = await expenseService.getCategoryList();
        return res.status(200).json(categoryList);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


module.exports = {
    addExpenseHandler,
    deleteExpenseHandler,
    addIncomeHandler,
    getDashboardSummaryHandler,
    addMonthlyBudgetHandler,
    getMonthlyBudgetHandler,
    getBudgetBreakdownHandler,
    allocateBudgetHandler,
    updateAllocatedCategoryHandler,
    getExpenseDetailsHandler,
    getMonthlySummaryHandler,
    getCategoryListHandler
};
