const { Expense, Income, MonthlyBudget, BudgetAllocation, Category, RecurringRule } = require('../Schemas/expenseSchema');


// ── Expense ──────────────────────────────────────────────

const insertExpense = async (userId, amount, categoryId, note, date, recurringRuleId) => {
    const data = { userId, amount, categoryId, note };
    if (date) data.date = date;
    if (recurringRuleId) data.recurringRuleId = recurringRuleId;
    return Expense.create(data);
};

const deleteExpenseById = async (userId, expenseId) => {
    return Expense.findOneAndDelete({ userId, _id: expenseId });
};

const updateExpenseById = async (userId, expenseId, updateData) => {
    return Expense.findOneAndUpdate(
        { userId, _id: expenseId },
        { $set: updateData },
        { new: true, runValidators: true }
    );
};


// ── Income ───────────────────────────────────────────────

const insertIncome = async (userId, amount, source, note, extra = {}) => {
    // extra may carry createdAt + recurringRuleId for materialized records —
    // income has no date field, so month totals key off createdAt
    return Income.create({ userId, amount, source, note, ...extra });
};


// ── Recurring Rules ──────────────────────────────────────

const insertRecurringRule = async (ruleData) => {
    return RecurringRule.create(ruleData);
};

const findRecurringRulesByUser = async (userId) => {
    return RecurringRule.find({ userId }).populate('categoryId', 'name').sort({ createdAt: -1 });
};

const findRecurringRuleById = async (userId, ruleId) => {
    return RecurringRule.findOne({ _id: ruleId, userId });
};

const findDueRecurringRules = async (userId, now) => {
    return RecurringRule.find({ userId, isActive: true, nextRunDate: { $lte: now } });
};

// Atomically advance nextRunDate — only succeeds if no parallel request
// already claimed this run, so concurrent reads can't double-materialize.
const claimRecurringRun = async (ruleId, expectedNextRunDate, newNextRunDate) => {
    return RecurringRule.findOneAndUpdate(
        { _id: ruleId, nextRunDate: expectedNextRunDate },
        { $set: { nextRunDate: newNextRunDate } },
        { new: false }
    );
};

const updateRecurringRuleById = async (userId, ruleId, updateData) => {
    return RecurringRule.findOneAndUpdate(
        { _id: ruleId, userId },
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate('categoryId', 'name');
};

const deleteRecurringRuleById = async (userId, ruleId) => {
    return RecurringRule.findOneAndDelete({ _id: ruleId, userId });
};

const findActiveRecurringRuleMatch = async (userId, categoryId, minAmount, maxAmount) => {
    return RecurringRule.findOne({
        userId,
        kind: 'expense',
        isActive: true,
        categoryId,
        amount: { $gte: minAmount, $lte: maxAmount },
    });
};

// Used by the "make it automatic?" detection: was there a similar expense
// in the given (previous-month) window?
const findSimilarExpenseInRange = async (userId, categoryId, minAmount, maxAmount, start, end) => {
    return Expense.findOne({
        userId,
        categoryId,
        amount: { $gte: minAmount, $lte: maxAmount },
        date: { $gte: start, $lte: end },
    });
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
    updateExpenseById,
    insertIncome,
    insertRecurringRule,
    findRecurringRulesByUser,
    findRecurringRuleById,
    findDueRecurringRules,
    claimRecurringRun,
    updateRecurringRuleById,
    deleteRecurringRuleById,
    findActiveRecurringRuleMatch,
    findSimilarExpenseInRange,
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
