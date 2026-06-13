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
        min: 0,
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    note: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    // Set when this record was materialized from a recurring rule
    recurringRuleId: {
        type: Schema.Types.ObjectId,
        ref: 'RecurringRule',
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
        min: 0,
    },
    source: {
        type: String,
        required: true,
    },
    note: {
        type: String
    },
    recurringRuleId: {
        type: Schema.Types.ObjectId,
        ref: 'RecurringRule',
    }
},
    { timestamps: true }
);

const recurringRuleSchema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    kind: {
        type: String,
        enum: ['expense', 'income'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    source: {
        type: String
    },
    note: {
        type: String
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekdays', 'weekly', 'monthly'],
        required: true
    },
    // monthly: day-of-month 1-31 (clamped to shorter months at run time,
    // the anchor itself never mutates); weekly: weekday 0-6 (Sunday = 0);
    // daily/weekdays: unused (0)
    anchorDay: {
        type: Number,
        required: true
    },
    // daily only: which weekdays run (0=Sun..6=Sat); empty/missing = all 7
    daysOfWeek: {
        type: [Number],
        default: undefined
    },
    nextRunDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });
recurringRuleSchema.index({ userId: 1, isActive: 1, nextRunDate: 1 });

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
    userId: {
        type: String,
        required: true
    },
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
budgetAllocationSchema.index({ budgetId: 1, categoryId: 1 }, { unique: true });

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
const RecurringRule = mongoose.model('RecurringRule', recurringRuleSchema);

module.exports = { Expense, Income, MonthlyBudget, BudgetAllocation, Category, RecurringRule };