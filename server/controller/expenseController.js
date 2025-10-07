const { Expense, Income, Budget } = require('../Schemas/expenseSchema');
const {
    getMonthlyTotalExpense,
    getMonthlyTotalIncome,
    getMostSpendCategoryOfMonth,
    getCurrentMonthBudget,
    getUserExpenseRecordsListOfMonth,
} = require('../services/expenseServices')


const addExpense = async (req, res) => {
    const userId = req.user.id;
    const { amount, category, note } = req.body;
    try {
        if (userId === null) {
            return res.status(400).json({ msg: 'User not found' });
        }
        if (!amount || !category) {
            return res.status(400).json({ msg: 'Please fill in all fields' });
        }
        const newExpense = new Expense({ userId, amount, category, note });
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
}


const deleteExpenseRecord = async (req, res) => {
    const userId = req.user.id;
    const expenseId = req.params.id;
    try {
        const expense = await Expense.findOne({ userId, _id: expenseId });
        if (!expense) {
            return res.status(404).json({ msg: 'Expense not found' });
        }
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
}


const addIncome = async (req, res) => {
    const userId = req.user.id;
    const { amount, source, note } = req.body;
    try {
        if (!amount || !source) {
            return res.status(400).json({ msg: 'Please fill in all fields' });
        }
        if (userId === null) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const newIncome = new Income({ userId, amount, source, note });
        await newIncome.save();
        res.status(201).json(newIncome);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}


const getExpenseDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.id
        console.log(userId)
        if (!userId) {
            return res.status(400).json({ msg: "User not found!" })
        }
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 99)
        const totalSpend = await getMonthlyTotalExpense(userId, startOfMonth, endOfMonth)
        const totalIncome = await getMonthlyTotalIncome(userId, startOfMonth, endOfMonth)
        const topCategory = await getMostSpendCategoryOfMonth(userId, startOfMonth, endOfMonth)
        const monthBudget = await getCurrentMonthBudget(userId)
        const data = {
            totalSpend: totalSpend,
            totalIncome: totalIncome,
            topCategory: topCategory,
            budget: monthBudget
        }
        return res.send(data)
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
}


const addMonthlyBudget = async (req, res) => {
    let { name, budgetType, category, amount, period, startDate, endDate } = req.body
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthName = startOfMonth.toLocaleDateString('default', { month: 'long' });
    try {
        const userId = req.user.id
        if (period === "monthly") {
            startDate = startOfMonth
            endDate = endOfMonth
            budgetType = "overall"
            name = `${monthName} Budget`
        }
        const newBudget = new Budget({
            userId, name, budgetType, category, amount, period, startDate, endDate
        })
        await newBudget.save()
        return res.status(201).json(newBudget);
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
}


const getExpenseDetailsOfMonth = async (req, res) => {
    let { date } = req.query
    try {
        const userId = req.user.id
        if (!userId) {
            return res.status(400).json({ msg: "User Not Found" })
        }
        const selectedDate = new Date(date);
        console.log("sl: ", selectedDate)
        if (isNaN(selectedDate)) {
            return res.status(400).json({ msg: "Invalid date format" });
        }
        const startOfMonth = new Date(Date.UTC(
            selectedDate.getUTCFullYear(),
            selectedDate.getUTCMonth(),
            1,
            0, 0, 0, 0
        ));
        console.log("st: ", startOfMonth)

        const endOfMonth = new Date(Date.UTC(
            selectedDate.getUTCFullYear(),
            selectedDate.getUTCMonth() + 1,
            0,
            23, 59, 59, 999
        ));
        console.log("en: ", endOfMonth)
        const totalSpend = await getMonthlyTotalExpense(userId, startOfMonth, endOfMonth)
        const totalIncome = await getMonthlyTotalIncome(userId, startOfMonth, endOfMonth)
        const topCategory = await getMostSpendCategoryOfMonth(userId, startOfMonth, endOfMonth)
        const expenseRecords = await getUserExpenseRecordsListOfMonth(userId, startOfMonth, endOfMonth)

        const content = {
            totalSpend,
            totalIncome,
            topCategory,
            expenseRecords
        }
        return res.status(200).json(content)
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
}


const getMonthlySummary = async (req, res) => {
    const userId = req.user.id;
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);
    try {
        const balance = 0
        const expenses = await Expense.find({ userId, month: month, year: year });
        const incomes = await Income.find({ userId, month: month, year: year });
        if (expenses.length === 0 && incomes.length === 0) {
            return res.status(200).json({ balance });
        } else {
            let totalExpense = 0;
            let totalIncome = 0;
            expenses.forEach(expense => {
                totalExpense += expense.amount;
            });
            incomes.forEach(income => {
                totalIncome += income.amount;
            });
            const balance = totalIncome - totalExpense;
            res.json({ totalExpense, totalIncome, balance });
        }
    } catch (err) {
        res.status(500).json({ err: err });
    }
}


module.exports = {
    addExpense, addIncome, addMonthlyBudget,
    getMonthlySummary, deleteExpenseRecord, getExpenseDashboardSummary,
    getExpenseDetailsOfMonth,
};