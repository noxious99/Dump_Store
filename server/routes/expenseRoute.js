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

// Budget
router.post('/monthly-budget', auth, expenseController.addMonthlyBudgetHandler);
router.patch('/monthly-budget', auth, expenseController.updateMonthlyBudgetHandler);
router.get('/monthly-budget', auth, expenseController.getMonthlyBudgetHandler);

// Budget allocation
router.post('/budget-allocate', auth, expenseController.allocateBudgetHandler);
router.get('/budget-allocate', auth, expenseController.getBudgetBreakdownHandler);
router.patch('/budget-allocate', auth, expenseController.updateAllocatedCategoryHandler);

// Summary & category
router.get('/dashboard-summary', auth, expenseController.getDashboardSummaryHandler);
router.get('/category', auth, expenseController.getCategoryListHandler);

module.exports = router;
