const { Expense, Income, MonthlyBudget, BudgetAllocation, Category } = require('../Schemas/expenseSchema');
const {
    getMonthlyTotalExpense,
    getMonthlyTotalIncome,
    getMostSpendCategoryOfMonth,
    getCurrentMonthBudget,
    getUserExpenseRecordsListOfMonth,
    getSpendOfCategorysOfMonth,
} = require('../services/expenseServices');
const { getMonthBoundaries } = require('../utils/utils-function');


const addExpense = async (req, res) => {
    const userId = req.user.id;
    const { amount, categoryId, note } = req.body;
    try {
        if (userId === null) {
            return res.status(400).json({ msg: 'User not found' });
        }
        if (!amount || !categoryId) {
            return res.status(400).json({ msg: 'Please fill in all fields' });
        }

        const category = await Category.findById(categoryId).select('name');
        if (!category) {
            return res.status(404).json({ msg: 'Category not found' });
        }

        const newExpense = await Expense.create({ userId, amount, categoryId, note });

        res.status(201).json({
            _id: newExpense._id,
            amount: newExpense.amount,
            note: newExpense.note,
            category: {
                _id: category._id,
                name: category.name
            },
            createdAt: newExpense.createdAt
        });
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
        const { startOfMonth, endOfMonth } = getMonthBoundaries(now)
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
    let { amount, alertThreshold } = req.body;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthName = startOfMonth.toLocaleDateString('en-US', { month: 'long' });
    const year = startOfMonth.getFullYear().toString();

    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ msg: "User not found!" });
        }
        if (!amount || amount <= 0) {
            return res.status(400).json({ msg: "Amount must be greater than 0" });
        }

        const existingBudget = await MonthlyBudget.findOne({
            userId,
            month: monthName,
            year: year
        });
        if (existingBudget) {
            return res.status(400).json({
                msg: "Budget already exists for this month. Please update instead."
            });
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
        const newBudget = new MonthlyBudget(budgetData);
        await newBudget.save();

        return res.status(201).json({ newBudget });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                msg: "Budget already exists for this month"
            });
        }
        return res.status(500).json({ msg: error.message });
    }
};


const getMonthlyBudget = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({ msg: "User not found!" });
        }
        let { month, year } = req.query;
        if (!month || !year) {
            const now = new Date();
            month = now.toLocaleDateString('en-US', { month: 'long' });
            year = now.getFullYear().toString();
        }

        const budget = await MonthlyBudget.findOne({ userId, month, year });
        if (!budget) {
            return res.status(404).json({});
        }

        return res.status(200).json({ budget });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};


const getBudgetBreakdown = async (req, res) => {
    try {
        const { budgetId } = req.query
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({ msg: "User not found!" });
        }
        const budget = await MonthlyBudget.findById(budgetId)

        const allocatedCategory = await BudgetAllocation.find({ budgetId }).populate('categoryId', 'name');
        const allocatedCategoryIds = []
        const formattedAllocatedCategory = allocatedCategory.map((category) => {
            const { _id, budgetId, categoryId, allocatedAmount, createdAt } = category;
            allocatedCategoryIds.push(categoryId._id)
            return {
                _id,
                budgetId,
                categoryId: categoryId._id,
                categoryName: categoryId.name,
                allocatedAmount,
                createdAt
            }
        });
        const date = new Date(`${budget.month} 28, ${budget.year}`)
        const { startOfMonth, endOfMonth } = getMonthBoundaries(date)
        const spendOfCategory = await getSpendOfCategorysOfMonth(userId, allocatedCategoryIds, startOfMonth, endOfMonth)
        const categoriesWithSpend = formattedAllocatedCategory.map(category => ({
            ...category,
            spent: spendOfCategory[category.categoryId.toString()] || 0,
            remaining: category.allocatedAmount - (spendOfCategory[category.categoryId.toString()] || 0)
        }));

        const content = {
            budgetId: budget._id,
            amount: budget.amount,
            month: budget.month,
            year: budget.year,
            categories: categoriesWithSpend
        };

        return res.status(200).json(content);

    } catch (error) {
        return res.status(500).json({ msg: error.message })
    }
}


const allocateBudgetByCategory = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({ msg: "User not found!" });
        }

        const { budgetId, categoryId, allocatedAmount } = req.body
        if (allocatedAmount <= 0) {
            return res.status(400).json({ msg: "Amount must be greater than 0" });
        }
        const budget = await MonthlyBudget.findOne({ _id: budgetId, userId });
        if (!budget) {
            return res.status(400).json({ msg: "No record found to attach" });
        }

        const allocationData = {
            budgetId: budgetId,
            categoryId: categoryId,
            allocatedAmount: allocatedAmount
        }

        const newBudgetAllocation = new BudgetAllocation(allocationData);
        await newBudgetAllocation.save();

        const populatedAllocation = await BudgetAllocation.findById(newBudgetAllocation._id)
            .populate('categoryId', 'name'); // only fetch name

        return res.status(201).json({ newAllocation: populatedAllocation });

    }
    catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}


const updateAllocatedCategory = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({ msg: "User not found!" });
        }
        const { budgetId, categoryId, amount, categoryName } = req.body
        if (!budgetId || !categoryId || !amount) {
            return res.status(400).json({ msg: "Missing required fields" });
        }

        if (amount <= 0) {
            return res.status(400).json({ msg: "Amount must be greater than 0" });
        }

        const budget = await MonthlyBudget.findOne({ _id: budgetId, userId });
        const allocation = await BudgetAllocation.findOne({ _id: categoryId, userId });

        if (!budget || !allocation) {
            return res.status(404).json({ msg: "No record found to update" });
        }

        const updateData = { allocatedAmount: amount };
        if (categoryName) updateData.category = categoryName;

        const updatedAllocation = await BudgetAllocation.findByIdAndUpdate(
            categoryId,
            updateData,
            { new: true }
        );

        return res.status(200).json({
            updatedAllocation,
        });
    }
    catch (error) {
        return res.status(500).json({ msg: error.message });
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
        if (isNaN(selectedDate)) {
            return res.status(400).json({ msg: "Invalid date format" });
        }

        const { startOfMonth, endOfMonth } = getMonthBoundaries(selectedDate)

        const totalSpend = await getMonthlyTotalExpense(userId, startOfMonth, endOfMonth)
        const totalIncome = await getMonthlyTotalIncome(userId, startOfMonth, endOfMonth)
        const topCategory = await getMostSpendCategoryOfMonth(userId, startOfMonth, endOfMonth)
        const expenseRecords = await getUserExpenseRecordsListOfMonth(userId, startOfMonth, endOfMonth)
        const monthlyBudget = await getCurrentMonthBudget(userId)

        const content = {
            totalSpend,
            totalIncome,
            topCategory,
            expenseRecords,
            monthlyBudget
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


const getCategoryList = async (req, res) => {
    try {
        const categoryList = await Category.find({ isDefault: true }).select("_id, name")
        return res.status(200).json(categoryList)
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}


module.exports = {
    addExpense, addIncome, addMonthlyBudget,
    getMonthlySummary, deleteExpenseRecord, getExpenseDashboardSummary,
    getExpenseDetailsOfMonth, getMonthlyBudget, allocateBudgetByCategory,
    getBudgetBreakdown, getCategoryList
};