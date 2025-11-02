const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
  username: String,
  email: {
    type: String,
    required: true
  },
  avatar: String,
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: false,
    default: ""
  },
  created_at: {
    type: Date,
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);