const { Expense, Income, MonthlyBudget } = require('../Schemas/expenseSchema');
const expenseRepository = require('../db/expense');
const { getMonthName, getYear } = require('../utils/utils-function');


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
        { $project: { _id: 1, userId: 1, amount: 1, note: 1, date: 1, createdAt: 1, 'category._id': 1, 'category.name': 1 } },
        { $sort: { date: -1 } }
    ]);
};

const getCategorySpending = async (userId, categoryIds, startOfMonth, endOfMonth) => {
    const results = await Expense.aggregate([
        { $match: { userId, categoryId: { $in: categoryIds }, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: "$categoryId", totalSpent: { $sum: "$amount" } } }
    ]);
    return results.reduce((map, item) => {
        map[item._id.toString()] = item.totalSpent;
        return map;
    }, {});
};


// ── Expense CRUD ─────────────────────────────────────────

const addExpense = async (userId, amount, categoryId, note, date) => {
    const category = await expenseRepository.findCategoryById(categoryId);
    if (!category) throw new Error('Category not found');

    const expense = await expenseRepository.insertExpense(userId, amount, categoryId, note, date);

    return {
        _id: expense._id,
        amount: expense.amount,
        note: expense.note,
        date: expense.date,
        category: { _id: category._id, name: category.name },
        createdAt: expense.createdAt
    };
};

const deleteExpense = async (userId, expenseId) => {
    const expense = await expenseRepository.deleteExpenseById(userId, expenseId);
    if (!expense) throw new Error('Expense not found');
    return { message: "Deleted successfully" };
};


// ── Income CRUD ──────────────────────────────────────────

const addIncome = async (userId, amount, source, note) => {
    return expenseRepository.insertIncome(userId, amount, source, note);
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

const getBudgetBreakdown = async (userId, budgetId, startOfMonth, endOfMonth) => {
    const budget = await expenseRepository.findBudgetById(budgetId);
    if (!budget) throw new Error("Budget not found");

    const allocations = await expenseRepository.findBudgetAllocationsByBudgetId(budgetId);

    const categoryIds = allocations.map(a => a.categoryId._id);
    const spending = categoryIds.length > 0
        ? await getCategorySpending(userId, categoryIds, startOfMonth, endOfMonth)
        : {};

    const categories = allocations.map(a => {
        const spent = spending[a.categoryId._id.toString()] || 0;
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
    if (!budget) throw new Error("No record found to attach");

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

    if (!budget || !allocation) throw new Error("No record found to update");

    const updatedAllocation = await expenseRepository.updateBudgetAllocation(userId, budgetId, categoryId, amount);
    return { updatedAllocation };
};


// ── Aggregated Views ─────────────────────────────────────

const getExpenseDetailsOfMonth = async (userId, startOfMonth, endOfMonth) => {
    const [totalSpend, totalIncome, topCategory, expenseRecords, monthlyBudget] = await Promise.all([
        getMonthlyTotalExpense(userId, startOfMonth, endOfMonth),
        getMonthlyTotalIncome(userId, startOfMonth, endOfMonth),
        getTopCategories(userId, startOfMonth, endOfMonth),
        getExpenseRecords(userId, startOfMonth, endOfMonth),
        getCurrentMonthBudget(userId, startOfMonth)
    ]);

    return { totalSpend, totalIncome, topCategory, expenseRecords, monthlyBudget };
};

const getDashboardSummary = async (userId, startOfMonth, endOfMonth) => {
    const [totalSpend, totalIncome, topCategory, budget] = await Promise.all([
        getMonthlyTotalExpense(userId, startOfMonth, endOfMonth),
        getMonthlyTotalIncome(userId, startOfMonth, endOfMonth),
        getTopCategories(userId, startOfMonth, endOfMonth),
        getCurrentMonthBudget(userId, startOfMonth)
    ]);

    return { totalSpend, totalIncome, topCategory, budget };
};


// ── Category ─────────────────────────────────────────────

const getCategoryList = async () => {
    return expenseRepository.findDefaultCategories();
};


module.exports = {
    addExpense,
    deleteExpense,
    addIncome,
    addMonthlyBudget,
    getMonthlyBudget,
    updateMonthlyBudget,
    getBudgetBreakdown,
    allocateBudget,
    updateAllocatedCategory,
    getExpenseDetailsOfMonth,
    getDashboardSummary,
    getCategoryList,
};
