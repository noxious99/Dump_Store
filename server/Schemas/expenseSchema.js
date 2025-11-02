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
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    note: {
        type: String
    }
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
    note: {
        type: String
    }
},
    { timestamps: true }
);

const monthlyBudgetSchema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    alertThreshold: {
        type: Number,
        default: 80,
        min: 0,
        max: 100
    },
}, {
    timestamps: true
});
monthlyBudgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

const budgetAllocationSchema = new Schema({
    budgetId: {
        type: Schema.Types.ObjectId,
        ref: 'MonthlyBudget',
        required: true,
        index: true
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    allocatedAmount: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
}, { timestamps: true });


const Expense = mongoose.model('Expense', expenseSchema);
const Income = mongoose.model('Income', incomeSchema);
const MonthlyBudget = mongoose.model('MonthlyBudget', monthlyBudgetSchema);
const BudgetAllocation = mongoose.model('BudgetAllocation', budgetAllocationSchema);
const Category = mongoose.model('Category', categorySchema);

module.exports = { Expense, Income, MonthlyBudget, BudgetAllocation, Category };