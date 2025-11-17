const express = require('express');
const router = express.Router();

const {
       addExpense,
       deleteExpenseRecord,
       addMonthlyBudget,
       addIncome,
       getMonthlySummary,
       getExpenseDashboardSummary,
       getExpenseDetailsOfMonth,
       getMonthlyBudget,
       allocateBudgetByCategory,
       getBudgetBreakdown,
       getCategoryList,
       updateAllocatedCategory,
} = require('../controller/expenseController');

const auth = require('../middleware/auth');

router.post('/', auth, addExpense);
router.delete('/:id', auth, deleteExpenseRecord);
router.get("/details", auth, getExpenseDetailsOfMonth)
router.post('/add-income', auth, addIncome);

// Budget Section
router.post('/monthly-budget', auth, addMonthlyBudget)
router.get('/monthly-budget', auth, getMonthlyBudget)
router.post('/budget-allocate', auth, allocateBudgetByCategory)
router.get('/budget-allocate', auth, getBudgetBreakdown)
router.patch('/budget-allocate', auth, updateAllocatedCategory)

// Summary Section
router.get('/dashboard-summary', auth, getExpenseDashboardSummary)
router.get('/getsummary/monthly/:month/:year', auth, getMonthlySummary);

router.get('/category', auth, getCategoryList)

module.exports = router;