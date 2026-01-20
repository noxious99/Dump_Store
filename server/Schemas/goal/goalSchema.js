const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const mileStoneSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  goalId: {
    type: Schema.Types.ObjectId,
    ref: "Goal",
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
},
  {
    timestamps: true
  }
)

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
    type: Schema.Types.ObjectId,
    ref: 'MileStone'
  }],
  category: {
    type: String,
    enum: ['longTerm', 'shortTerm']
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  targetDate: {
    type: Date,
    required: true
  },
  completionDate: {
    type: Date,
  }
},
  {
    timestamps: true
  });

const Goal = mongoose.model("Goal", goalSchema);
const MileStone = mongoose.model("MileStone", mileStoneSchema);

module.exports = { Goal, MileStone };
