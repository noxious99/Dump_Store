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
},
    { timestamps: true }
);

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
},
    { timestamps: true }
);

const budgetSchema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    budgetType: {
        type: String,
        enum: ['overall', 'category'],
        required: true,
        default: 'category'
    },
    category: {
        type: String,
        required: function() {
            return this.budgetType === 'category';
        }
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    period: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
        required: true,
        default: 'monthly'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    alertThreshold: {
        type: Number,
        default: 80,
        min: 0,
        max: 100
    },
    description: {
        type: String,
        trim: true
    },
}, {
    timestamps: true
});

const Expense = mongoose.model('Expense', expenseSchema);
const Income = mongoose.model('Income', incomeSchema);
const Budget = mongoose.model('Budget', budgetSchema);

module.exports = { Expense, Income, Budget };