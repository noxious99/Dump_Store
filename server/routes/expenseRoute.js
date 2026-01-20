const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const expenseController = require('../controller/expenseController');

// Expense routes
router.post('/', auth, expenseController.addExpenseHandler);
router.delete('/:id', auth, expenseController.deleteExpenseHandler);
router.get("/details", auth, expenseController.getExpenseDetailsHandler);

// Income routes
router.post('/add-income', auth, expenseController.addIncomeHandler);

// Budget routes
router.post('/monthly-budget', auth, expenseController.addMonthlyBudgetHandler);
router.get('/monthly-budget', auth, expenseController.getMonthlyBudgetHandler);

// Budget allocation routes
router.post('/budget-allocate', auth, expenseController.allocateBudgetHandler);
router.get('/budget-allocate', auth, expenseController.getBudgetBreakdownHandler);
router.patch('/budget-allocate', auth, expenseController.updateAllocatedCategoryHandler);

// Summary routes
router.get('/dashboard-summary', auth, expenseController.getDashboardSummaryHandler);
router.get('/getsummary/monthly/:month/:year', auth, expenseController.getMonthlySummaryHandler);

// Category routes
router.get('/category', auth, expenseController.getCategoryListHandler);

module.exports = router;