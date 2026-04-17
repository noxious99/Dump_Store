const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IOU_STATUS = ['pending', 'partial', 'settled', 'cancelled'];
const IOU_TYPE = ['lent', 'borrowed'];

const iouSchema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },

    // Counterparty — the other party in the transaction.
    counterpartyName: {
        type: String,
        required: true,
        trim: true,
    },
    counterpartyPhone: {
        type: String,
        trim: true,
    },

    // Direction. 'lent' = user gave money (counterparty owes user).
    //            'borrowed' = user took money (user owes counterparty).
    type: {
        type: String,
        enum: IOU_TYPE,
        required: true,
    },

    // Monetary values
    amount: {
        type: Number,
        required: true,
        min: 0.01,
    },
    amountPaid: {
        type: Number,
        default: 0,
        min: 0,
    },
    currency: {
        type: String,
        default: 'USD',
        uppercase: true,
        trim: true,
    },

    // Lifecycle dates
    transactionDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    expectedPaybackDate: {
        type: Date,
    },
    actualPaybackDate: {
        type: Date,
        default: null,
    },

    // Explicit state. Mutated by the service layer so callers don't have to
    // derive "is this paid?" from amountPaid / actualPaybackDate every time.
    status: {
        type: String,
        enum: IOU_STATUS,
        default: 'pending',
        index: true,
    },

    note: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

iouSchema.index({ userId: 1, status: 1 });
iouSchema.index({ userId: 1, type: 1 });

// Outstanding balance — never exposed via $set from API input.
iouSchema.virtual('amountRemaining').get(function () {
    return Math.max(this.amount - (this.amountPaid || 0), 0);
});

// Overdue if still owed and we're past the agreed-upon payback date.
iouSchema.virtual('isOverdue').get(function () {
    if (this.status === 'settled' || this.status === 'cancelled') return false;
    if (!this.expectedPaybackDate) return false;
    return this.expectedPaybackDate < new Date();
});

module.exports = mongoose.model('Iou', iouSchema);
module.exports.IOU_STATUS = IOU_STATUS;
module.exports.IOU_TYPE = IOU_TYPE;
