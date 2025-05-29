const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const mileStoneSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
})

const goalSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }],
  mileStone: [{
    type: mileStoneSchema
  }],
  category: {
    type: String,
    enum: ['longTerm', 'shortTerm']
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  targetDate: {
    type: Date,
    required: true
  },
  completionDate: {
    type: Date,
  }
});

module.exports = mongoose.model("Goal", goalSchema);
