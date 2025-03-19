const express = require('express');
const router = express.Router();
const {addExpense, deleteExpenseRecord,
       getMonthlyExpenses, getDailyExpenses, addIncome, getMonthlySummary} = require('../controller/expenseController');
const auth = require('../middleware/auth');

router.post('/addexpense', auth, addExpense);
router.delete('/deleteexpense/:id', auth, deleteExpenseRecord);
router.get('/getexpense/monthly/:month/:year', auth, getMonthlyExpenses);
router.get('/getexpense/daily/:date/:month/:year', auth, getDailyExpenses);

router.post('/addincome', auth, addIncome);

router.get('/getsummary/monthly/:month/:year', auth, getMonthlySummary);

module.exports = router;