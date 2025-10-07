const { Expense, Income, Budget } = require('../Schemas/expenseSchema');

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
            $group: {
                _id: "$category",
                totalAmount: { $sum: "$amount" }
            }
        },
        {
            $sort: { totalAmount: -1 }
        },
        {
            $limit: 3
        }
    ])
    return result.length > 0 ? result.map(r => ({
        category: r._id,
        amount: r.totalAmount
    })) : [];
}


const getCurrentMonthBudget = async (userId) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const result = await Budget.aggregate([
        {
            $match: {
                userId,
                startDate: {
                    $gte: startOfMonth
                },
                endDate: {
                    $lte: endOfMonth
                },
                period: "monthly",
                isActive: true
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                amount: 1,
                alertThreshold: 1,
                isActive: 1,
            }
        }
    ]);
    return result.length > 0 ? result[0] : {};
};


const getUserExpenseRecordsListOfMonth = async (userId, startOfMonth, endOfMonth) => {
    console.log(startOfMonth, endOfMonth)
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
            $sort: {
                createdAt: -1
            }
        }
    ])
    console.log("recordList: ", recordList)
    return recordList ? recordList : []
}

module.exports = {
    getMonthlyTotalExpense,
    getMonthlyTotalIncome,
    getMostSpendCategoryOfMonth,
    getCurrentMonthBudget,
    getUserExpenseRecordsListOfMonth
};