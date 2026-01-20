const { Expense, Income, MonthlyBudget } = require('../Schemas/expenseSchema');
const expenseRepository = require('../db/expense');


/**
 * Generic helper to calculate monthly totals for a model
 * @private
 */
const calculateMonthlyTotal = async (Model, userId, startOfMonth, endOfMonth) => {
    const result = await Model.aggregate([
        {
            $match: {
                userId,
                createdAt: {
                    $gte: startOfMonth,
                    $lte: endOfMonth,
                }
            }
        },
        {
            $group: {
                _id: null,
                amount: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        }
    ]);

    return result.length > 0
        ? { amount: result[0].amount, count: result[0].count }
        : { amount: 0, count: 0 };
};


/**
 * Get monthly total expense for a user
 */
const getMonthlyTotalExpense = async (userId, startOfMonth, endOfMonth) => {
    return calculateMonthlyTotal(Expense, userId, startOfMonth, endOfMonth);
};


/**
 * Get monthly total income for a user
 */
const getMonthlyTotalIncome = async (userId, startOfMonth, endOfMonth) => {
    return calculateMonthlyTotal(Income, userId, startOfMonth, endOfMonth);
};


/**
 * Get top spending categories for the month
 */
const getMostSpendCategoryOfMonth = async (userId, startOfMonth, endOfMonth) => {
    const result = await Expense.aggregate([
        {
            $match: {
                userId,
                createdAt: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            }
        },
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: "$category._id",
                categoryName: { $first: "$category.name" },
                totalAmount: { $sum: "$amount" }
            }
        },
        {
            $sort: { totalAmount: -1 }
        },
        {
            $limit: 3
        },
        {
            $project: {
                _id: 0,
                categoryId: "$_id",
                name: "$categoryName",
                amount: "$totalAmount"
            }
        }
    ]);
    
    return result;
}


/**
 * Get current month's budget with allocation count
 */
const getCurrentMonthBudget = async (userId, startOfMonth, endOfMonth) => {
    const monthName = startOfMonth.toLocaleDateString('en-US', { month: 'long' });
    const year = startOfMonth.getFullYear().toString();

    const result = await MonthlyBudget.aggregate([
        {
            $match: {
                userId,
                month: monthName,
                year: year
            }
        },
        {
            $lookup: {
                from: 'budgetallocations',
                localField: '_id',
                foreignField: 'budgetId',
                as: 'allocations'
            }
        },
        {
            $project: {
                _id: 1,
                amount: 1,
                alertThreshold: 1,
                allocationCount: { $size: '$allocations' }
            }
        }
    ]);

    return result.length > 0 ? result[0] : {};
};


/**
 * Get user's expense records for a specific month with populated category
 */
const getUserExpenseRecordsListOfMonth = async (userId, startOfMonth, endOfMonth) => {
    const recordList = await Expense.aggregate([
        {
            $match: {
                userId,
                createdAt: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            }
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category'
            }
        },
        {
            $unwind: {
                path: '$category',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                userId: 1,
                amount: 1,
                note: 1,
                createdAt: 1,
                'category._id': 1,
                'category.name': 1
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);
    return recordList;
}


/**
 * Get spending breakdown by categories for a specific month
 */
const getSpendOfCategorysOfMonth = async (userId, categoryIds, startOfMonth, endOfMonth) => {
    const result = await Expense.aggregate([
        {
            $match: {
                userId,
                categoryId: { $in: categoryIds },
                createdAt: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            }
        },
        {
            $group: {
                _id: "$categoryId",
                totalSpent: { $sum: "$amount" }
            }
        }
    ]);

    const spendMap = result.reduce((acc, item) => {
        acc[item._id.toString()] = item.totalSpent;
        return acc;
    }, {});
    return spendMap;
};


/**
 * Add a new expense record
 */
const addExpense = async (userId, amount, categoryId, note) => {
    const category = await expenseRepository.findCategoryById(categoryId);
    if (!category) {
        throw new Error('Category not found');
    }

    const newExpense = await expenseRepository.insertExpense(userId, amount, categoryId, note);

    return {
        _id: newExpense._id,
        amount: newExpense.amount,
        note: newExpense.note,
        category: {
            _id: category._id,
            name: category.name
        },
        createdAt: newExpense.createdAt
    };
};


/**
 * Delete an expense record
 */
const deleteExpense = async (userId, expenseId) => {
    const expense = await expenseRepository.deleteExpenseById(userId, expenseId);
    if (!expense) {
        throw new Error('Expense not found');
    }
    return { message: "Deleted successfully" };
};


/**
 * Add a new income record
 */
const addIncome = async (userId, amount, source, note) => {
    const newIncome = await expenseRepository.insertIncome(userId, amount, source, note);
    return newIncome;
};


/**
 * Add monthly budget for the current month
 */
const addMonthlyBudget = async (userId, amount, alertThreshold) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthName = startOfMonth.toLocaleDateString('en-US', { month: 'long' });
    const year = startOfMonth.getFullYear().toString();

    const existingBudget = await expenseRepository.findMonthlyBudget(userId, monthName, year);
    if (existingBudget) {
        throw new Error("Budget already exists for this month. Please update instead.");
    }

    const budgetData = {
        userId,
        amount,
        month: monthName,
        year: year
    };

    if (alertThreshold !== undefined) {
        budgetData.alertThreshold = alertThreshold;
    }

    const newBudget = await expenseRepository.insertMonthlyBudget(budgetData);
    return { newBudget };
};


/**
 * Get monthly budget by month and year
 */
const getMonthlyBudget = async (userId, month, year) => {
    let queryMonth = month;
    let queryYear = year;

    if (!queryMonth || !queryYear) {
        const now = new Date();
        queryMonth = now.toLocaleDateString('en-US', { month: 'long' });
        queryYear = now.getFullYear().toString();
    }

    const budget = await expenseRepository.findMonthlyBudget(userId, queryMonth, queryYear);
    return budget;
};


/**
 * Get budget breakdown with allocations and spending
 */
const getBudgetBreakdown = async (userId, budgetId, startOfMonth, endOfMonth) => {
    const budget = await expenseRepository.findBudgetById(budgetId);
    if (!budget) {
        throw new Error("Budget not found");
    }

    const allocatedCategory = await expenseRepository.findBudgetAllocationsByBudgetId(budgetId);
    const allocatedCategoryIds = [];

    const formattedAllocatedCategory = allocatedCategory.map((category) => {
        const { _id, budgetId, categoryId, allocatedAmount, createdAt } = category;
        allocatedCategoryIds.push(categoryId._id);
        return {
            _id,
            budgetId,
            categoryId: categoryId._id,
            categoryName: categoryId.name,
            allocatedAmount,
            createdAt
        };
    });

    const spendOfCategory = await getSpendOfCategorysOfMonth(userId, allocatedCategoryIds, startOfMonth, endOfMonth);

    const categoriesWithSpend = formattedAllocatedCategory.map(category => ({
        ...category,
        spent: spendOfCategory[category.categoryId.toString()] || 0,
        remaining: category.allocatedAmount - (spendOfCategory[category.categoryId.toString()] || 0)
    }));

    return {
        budgetId: budget._id,
        amount: budget.amount,
        month: budget.month,
        year: budget.year,
        categories: categoriesWithSpend
    };
};


/**
 * Allocate budget to a category
 */
const allocateBudget = async (userId, budgetId, categoryId, allocatedAmount) => {
    const budgetExists = await expenseRepository.findBudgetById(budgetId);
    if (!budgetExists) {
        throw new Error("No record found to attach");
    }

    const existingAllocation = await expenseRepository.findBudgetAllocation(userId, budgetId, categoryId);
    if (existingAllocation) {
        throw new Error("A budget allocation for this category already exists. Please update the existing allocation or select a different category.");
    }

    const allocationData = {
        userId,
        budgetId,
        categoryId,
        allocatedAmount
    };

    const newAllocation = await expenseRepository.insertBudgetAllocation(allocationData);
    return { newAllocation };
};


/**
 * Update allocated category amount
 */
const updateAllocatedCategory = async (userId, budgetId, categoryId, amount) => {
    const budget = await expenseRepository.findBudgetById(budgetId);
    const allocation = await expenseRepository.findBudgetAllocation(userId, budgetId, categoryId);

    if (!budget || !allocation) {
        throw new Error("No record found to update");
    }

    const updatedAllocation = await expenseRepository.updateBudgetAllocation(userId, budgetId, categoryId, amount);
    return { updatedAllocation };
};


/**
 * Get expense details for a specific month
 */
const getExpenseDetailsOfMonth = async (userId, startOfMonth, endOfMonth) => {
    const totalSpend = await getMonthlyTotalExpense(userId, startOfMonth, endOfMonth);
    const totalIncome = await getMonthlyTotalIncome(userId, startOfMonth, endOfMonth);
    const topCategory = await getMostSpendCategoryOfMonth(userId, startOfMonth, endOfMonth);
    const expenseRecords = await getUserExpenseRecordsListOfMonth(userId, startOfMonth, endOfMonth);
    const monthlyBudget = await getCurrentMonthBudget(userId, startOfMonth, endOfMonth);

    return {
        totalSpend,
        totalIncome,
        topCategory,
        expenseRecords,
        monthlyBudget
    };
};


/**
 * Get monthly summary (legacy)
 */
const getMonthlySummary = async (userId, month, year) => {
    const expenses = await expenseRepository.findExpensesByMonth(userId, month, year);
    const incomes = await expenseRepository.findIncomesByMonth(userId, month, year);

    if (expenses.length === 0 && incomes.length === 0) {
        return { balance: 0 };
    }

    let totalExpense = 0;
    let totalIncome = 0;

    expenses.forEach(expense => {
        totalExpense += expense.amount;
    });

    incomes.forEach(income => {
        totalIncome += income.amount;
    });

    const balance = totalIncome - totalExpense;
    return { totalExpense, totalIncome, balance };
};


/**
 * Get dashboard summary for current month
 */
const getDashboardSummary = async (userId, startOfMonth, endOfMonth) => {
    const totalSpend = await getMonthlyTotalExpense(userId, startOfMonth, endOfMonth);
    const totalIncome = await getMonthlyTotalIncome(userId, startOfMonth, endOfMonth);
    const topCategory = await getMostSpendCategoryOfMonth(userId, startOfMonth, endOfMonth);
    const monthBudget = await getCurrentMonthBudget(userId, startOfMonth, endOfMonth);

    return {
        totalSpend,
        totalIncome,
        topCategory,
        budget: monthBudget
    };
};


/**
 * Get category list
 */
const getCategoryList = async () => {
    const categories = await expenseRepository.findDefaultCategories();
    return categories;
};


module.exports = {
    getMonthlyTotalExpense,
    getMonthlyTotalIncome,
    getMostSpendCategoryOfMonth,
    getCurrentMonthBudget,
    getUserExpenseRecordsListOfMonth,
    getSpendOfCategorysOfMonth,
    addExpense,
    deleteExpense,
    addIncome,
    addMonthlyBudget,
    getMonthlyBudget,
    getBudgetBreakdown,
    allocateBudget,
    updateAllocatedCategory,
    getExpenseDetailsOfMonth,
    getMonthlySummary,
    getDashboardSummary,
    getCategoryList
};