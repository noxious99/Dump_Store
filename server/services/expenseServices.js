const { Expense, Income, Budget, MonthlyBudget } = require('../Schemas/expenseSchema');

const getMonthlyTotal = async (Model, userId, startOfMonth, endOfMonth) => {
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
}


const getMonthlyTotalExpense = async (userId, startOfMonth, endOfMonth) => {
    return getMonthlyTotal(Expense, userId, startOfMonth, endOfMonth);
}


const getMonthlyTotalIncome = async (userId, startOfMonth, endOfMonth) => {
    return getMonthlyTotal(Income, userId, startOfMonth, endOfMonth);
}


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


const getCurrentMonthBudget = async (userId) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
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


const getSpendOfCategorysOfMonth = async (categoryIds, startOfMonth, endOfMonth) => {
    const result = await Expense.aggregate([
        {
            $match: {
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


module.exports = {
    getMonthlyTotalExpense,
    getMonthlyTotalIncome,
    getMostSpendCategoryOfMonth,
    getCurrentMonthBudget,
    getUserExpenseRecordsListOfMonth,
    getSpendOfCategorysOfMonth
};