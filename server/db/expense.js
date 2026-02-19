const { Expense, Income, MonthlyBudget, BudgetAllocation, Category } = require('../Schemas/expenseSchema');


// ── Expense ──────────────────────────────────────────────

const insertExpense = async (userId, amount, categoryId, note, date) => {
    const data = { userId, amount, categoryId, note };
    if (date) data.date = date;
    return Expense.create(data);
};

const deleteExpenseById = async (userId, expenseId) => {
    return Expense.findOneAndDelete({ userId, _id: expenseId });
};


// ── Income ───────────────────────────────────────────────

const insertIncome = async (userId, amount, source, note) => {
    return Income.create({ userId, amount, source, note });
};


// ── Monthly Budget ───────────────────────────────────────

const insertMonthlyBudget = async (budgetData) => {
    return MonthlyBudget.create(budgetData);
};

const findMonthlyBudget = async (userId, month, year) => {
    return MonthlyBudget.findOne({ userId, month, year });
};

const findBudgetById = async (budgetId) => {
    return MonthlyBudget.findById(budgetId);
};

const updateMonthlyBudget = async (userId, budgetId, updateData) => {
    return MonthlyBudget.findOneAndUpdate(
        { _id: budgetId, userId },
        updateData,
        { new: true, runValidators: true }
    );
};


// ── Budget Allocation ────────────────────────────────────

const insertBudgetAllocation = async (allocationData) => {
    const allocation = await BudgetAllocation.create(allocationData);
    return BudgetAllocation.findById(allocation._id).populate('categoryId', 'name');
};

const findBudgetAllocation = async (userId, budgetId, categoryId) => {
    return BudgetAllocation.findOne({ userId, budgetId, categoryId });
};

const findBudgetAllocationsByBudgetId = async (budgetId) => {
    return BudgetAllocation.find({ budgetId }).populate('categoryId', 'name');
};

const updateBudgetAllocation = async (userId, budgetId, categoryId, allocatedAmount) => {
    return BudgetAllocation.findOneAndUpdate(
        { userId, budgetId, categoryId },
        { allocatedAmount },
        { new: true, runValidators: true }
    ).populate('categoryId', 'name');
};


// ── Category ─────────────────────────────────────────────

const findCategoryById = async (categoryId) => {
    return Category.findById(categoryId).select('name');
};

const findDefaultCategories = async () => {
    return Category.find({ isDefault: true }).select('_id name');
};


module.exports = {
    insertExpense,
    deleteExpenseById,
    insertIncome,
    insertMonthlyBudget,
    findMonthlyBudget,
    findBudgetById,
    updateMonthlyBudget,
    insertBudgetAllocation,
    findBudgetAllocation,
    findBudgetAllocationsByBudgetId,
    updateBudgetAllocation,
    findCategoryById,
    findDefaultCategories,
};
