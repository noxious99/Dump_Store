const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const expenseController = require('../controller/expenseController');

// Expense
router.post('/', auth, expenseController.addExpenseHandler);
router.delete('/:id', auth, expenseController.deleteExpenseHandler);
router.get('/details', auth, expenseController.getExpenseDetailsHandler);

// Income
router.post('/add-income', auth, expenseController.addIncomeHandler);
router.patch('/income/:id', auth, expenseController.updateIncomeHandler);
router.delete('/income/:id', auth, expenseController.deleteIncomeHandler);

// Budget
router.post('/monthly-budget', auth, expenseController.addMonthlyBudgetHandler);
router.patch('/monthly-budget', auth, expenseController.updateMonthlyBudgetHandler);
router.get('/monthly-budget', auth, expenseController.getMonthlyBudgetHandler);

// Budget allocation
router.post('/budget-allocate', auth, expenseController.allocateBudgetHandler);
router.get('/budget-allocate', auth, expenseController.getBudgetBreakdownHandler);
router.patch('/budget-allocate', auth, expenseController.updateAllocatedCategoryHandler);

// Recurring rules
router.post('/recurring', auth, expenseController.createRecurringRuleHandler);
router.get('/recurring', auth, expenseController.getRecurringRulesHandler);
router.patch('/recurring/:id', auth, expenseController.updateRecurringRuleHandler);
router.delete('/recurring/:id', auth, expenseController.deleteRecurringRuleHandler);

// Summary & category
router.get('/dashboard-summary', auth, expenseController.getDashboardSummaryHandler);
router.get('/analytics', auth, expenseController.getAnalyticsHandler);
router.get('/category', auth, expenseController.getCategoryListHandler);

// Expense update — registered last so '/:id' can't shadow the
// fixed-path PATCH routes above (monthly-budget, budget-allocate)
router.patch('/:id', auth, expenseController.updateExpenseHandler);

module.exports = router;
