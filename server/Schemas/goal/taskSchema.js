const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    goalId: {
        type: Schema.Types.ObjectId,
        ref: 'Goal',
        required: true
    },
    type: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    repeatUntil: {
        type: Date,
        required: true
    },
    completedDates: {
        type: [Date],
        default: []
    }
})

module.exports = mongoose.model('Task', taskSchema)