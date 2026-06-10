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
        { $project: { _id: 1, userId: 1, amount: 1, note: 1, date: 1, createdAt: 1, 'category._id': 1, 'category.name': 1 } },
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
    updateExpense,
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
