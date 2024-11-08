const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const objectiveSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  isDone: {
    type: Boolean,
    default: false,
  },
});

const goalSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  objectives: {
    type: [objectiveSchema],
  },
  isDone: {
    type: Boolean,
    deafult: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Goal", goalSchema);
