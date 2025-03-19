const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    date: {
        type: Number,
        required: true,
    },
    month: {
        type: Number,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const incomeSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    source: {
        type: String,
        required: true,
    },
    date: {
        type: Number,
        required: true,
    },
    month: {
        type: Number,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Expense = mongoose.model('Expense', expenseSchema);
const Income = mongoose.model('Income', incomeSchema);

module.exports = { Expense, Income };