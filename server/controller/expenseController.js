const { Expense, Income } = require('../Schemas/expenseSchema');

const addExpense = async (req, res) => {
    const userId = req.user.id;
    const { amount, category, date, month, year } = req.body;
    try {
        if(!amount || !category || !date || !month || !year) {
            return res.status(400).json({ err: 'Please fill in all fields' });
        }
        if(userId === null) {
            return res.status(400).json({ err: 'User not found' });
        }
        const newExpense = new Expense({ userId, amount, category, date, month, year });
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (err) {
        res.status(500).json({ err: err });
    }
} 

const deleteExpenseRecord = async (req, res) => {
    const userId = req.user.id;
    const expenseId = req.params.id;
    try {
        const expense = await Expense.findOne({ userId, _id: expenseId });
        if(!expense) {
            return res.status(404).json({ err: 'Expense not found' });
        }
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
}

const getMonthlyExpenses = async (req, res) => {
    const userId = req.user.id;
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);
    try {
        const expenses = await Expense.find({ userId, month, year }).sort({ createdAt: -1 });
        return res.status(200).json(expenses);
    } catch (err) {
        res.status(500).json({ err: err.message || "Internal Server Error" });
    }
};

const getDailyExpenses = async (req, res) => {
    const userId = req.user.id;
    const date = parseInt(req.params.date);
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);
    try {
        const expenses = await Expense.find({ userId, date, month, year })
                                      .sort({ createdAt: -1 });
        if (expenses.length === 0) {
            return res.status(404).json({ err: "You haven't listed anything yet" });
        }
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};

const addIncome = async (req, res) => {
    const userId = req.user.id;
    const { amount, source, date, month, year } = req.body;
    try {
        if(!amount || !source || !date || !month || !year) {
            return res.status(400).json({ err: 'Please fill in all fields' });
        }
        if(userId === null) {
            return res.status(400).json({ err: 'User not found' });
        }
        const newIncome = new Income({ userId, amount, source, date, month, year });
        await newIncome.save();
        res.status(201).json(newIncome);
    } catch (err) {
        res.status(500).json({ err: err });
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
        if(expenses.length === 0 && incomes.length === 0) {
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
module.exports = { addExpense, getMonthlyExpenses, getDailyExpenses, addIncome, getMonthlySummary, deleteExpenseRecord };