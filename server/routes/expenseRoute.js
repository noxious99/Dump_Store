const express = require('express');
const router = express.Router();
const {addExpense, deleteExpenseRecord, addMonthlyBudget,
       addIncome, getMonthlySummary, getExpenseDashboardSummary,
       getExpenseDetailsOfMonth} = require('../controller/expenseController');
const auth = require('../middleware/auth');

router.post('/', auth, addExpense);
router.delete('/', auth, deleteExpenseRecord);
router.get("/details", auth, getExpenseDetailsOfMonth)


router.post('/add-income', auth, addIncome);

router.post('/add-budget', auth, addMonthlyBudget)

router.get('/dashboard-summary', auth, getExpenseDashboardSummary)
router.get('/getsummary/monthly/:month/:year', auth, getMonthlySummary);

module.exports = router;