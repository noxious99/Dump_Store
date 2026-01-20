const { Expense, Income, MonthlyBudget, BudgetAllocation, Category } = require('../Schemas/expenseSchema');


/**
 * Insert a new expense record
 * @param {String} userId - User ID
 * @param {Number} amount - Expense amount
 * @param {String} categoryId - Category ID
 * @param {String} note - Optional note
 * @returns {Promise<Object>} Created expense document
 */
const insertExpense = async (userId, amount, categoryId, note) => {
    const newExpense = await Expense.create({ userId, amount, categoryId, note });
    return newExpense;
};


/**
 * Delete an expense record by ID and user ID
 * @param {String} userId - User ID
 * @param {String} expenseId - Expense ID
 * @returns {Promise<Object|null>} Deleted expense document or null
 */
const deleteExpenseById = async (userId, expenseId) => {
    const expense = await Expense.findOneAndDelete({ userId, _id: expenseId });
    return expense;
};


/**
 * Insert a new income record
 * @param {String} userId - User ID
 * @param {Number} amount - Income amount
 * @param {String} source - Income source
 * @param {String} note - Optional note
 * @returns {Promise<Object>} Created income document
 */
const insertIncome = async (userId, amount, source, note) => {
    const newIncome = new Income({ userId, amount, source, note });
    await newIncome.save();
    return newIncome;
};


/**
 * Insert a new monthly budget
 * @param {Object} budgetData - Budget data object
 * @returns {Promise<Object>} Created budget document
 */
const insertMonthlyBudget = async (budgetData) => {
    const newBudget = new MonthlyBudget(budgetData);
    await newBudget.save();
    return newBudget;
};


/**
 * Find monthly budget by user, month, and year
 * @param {String} userId - User ID
 * @param {String} month - Month name
 * @param {String} year - Year
 * @returns {Promise<Object|null>} Budget document or null
 */
const findMonthlyBudget = async (userId, month, year) => {
    const budget = await MonthlyBudget.findOne({ userId, month, year });
    return budget;
};


/**
 * Find budget by ID
 * @param {String} budgetId - Budget ID
 * @returns {Promise<Object|null>} Budget document or null
 */
const findBudgetById = async (budgetId) => {
    const budget = await MonthlyBudget.findById(budgetId);
    return budget;
};


/**
 * Insert a new budget allocation
 * @param {Object} allocationData - Allocation data object
 * @returns {Promise<Object>} Created allocation document with populated category
 */
const insertBudgetAllocation = async (allocationData) => {
    const newAllocation = new BudgetAllocation(allocationData);
    await newAllocation.save();

    const populatedAllocation = await BudgetAllocation.findById(newAllocation._id)
        .populate('categoryId', 'name');
    return populatedAllocation;
};


/**
 * Find existing budget allocation
 * @param {String} userId - User ID
 * @param {String} budgetId - Budget ID
 * @param {String} categoryId - Category ID
 * @returns {Promise<Object|null>} Allocation document or null
 */
const findBudgetAllocation = async (userId, budgetId, categoryId) => {
    const allocation = await BudgetAllocation.findOne({ userId, budgetId, categoryId });
    return allocation;
};


/**
 * Find all budget allocations for a budget
 * @param {String} budgetId - Budget ID
 * @returns {Promise<Array>} Array of allocation documents
 */
const findBudgetAllocationsByBudgetId = async (budgetId) => {
    const allocations = await BudgetAllocation.find({ budgetId })
        .populate('categoryId', 'name');
    return allocations;
};


/**
 * Update budget allocation amount
 * @param {String} userId - User ID
 * @param {String} budgetId - Budget ID
 * @param {String} categoryId - Category ID
 * @param {Number} allocatedAmount - New allocation amount
 * @returns {Promise<Object|null>} Updated allocation document or null
 */
const updateBudgetAllocation = async (userId, budgetId, categoryId, allocatedAmount) => {
    const updatedAllocation = await BudgetAllocation.findOneAndUpdate(
        { userId, budgetId, categoryId },
        { allocatedAmount },
        { new: true, runValidators: true }
    ).populate('categoryId', 'name');
    return updatedAllocation;
};


/**
 * Find category by ID
 * @param {String} categoryId - Category ID
 * @returns {Promise<Object|null>} Category document or null
 */
const findCategoryById = async (categoryId) => {
    const category = await Category.findById(categoryId).select('name');
    return category;
};


/**
 * Find all default categories
 * @returns {Promise<Array>} Array of default category documents
 */
const findDefaultCategories = async () => {
    const categories = await Category.find({ isDefault: true }).select('_id name');
    return categories;
};


/**
 * Find expenses by user ID and date range
 * @param {String} userId - User ID
 * @param {Number} month - Month number
 * @param {Number} year - Year number
 * @returns {Promise<Array>} Array of expense documents
 */
const findExpensesByMonth = async (userId, month, year) => {
    const expenses = await Expense.find({ userId, month, year });
    return expenses;
};


/**
 * Find incomes by user ID and date range
 * @param {String} userId - User ID
 * @param {Number} month - Month number
 * @param {Number} year - Year number
 * @returns {Promise<Array>} Array of income documents
 */
const findIncomesByMonth = async (userId, month, year) => {
    const incomes = await Income.find({ userId, month, year });
    return incomes;
};


module.exports = {
    insertExpense,
    deleteExpenseById,
    insertIncome,
    insertMonthlyBudget,
    findMonthlyBudget,
    findBudgetById,
    insertBudgetAllocation,
    findBudgetAllocation,
    findBudgetAllocationsByBudgetId,
    updateBudgetAllocation,
    findCategoryById,
    findDefaultCategories,
    findExpensesByMonth,
    findIncomesByMonth
};
