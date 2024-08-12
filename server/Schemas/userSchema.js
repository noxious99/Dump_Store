const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
  username: String,
  email: String,
  avatar: String,
  password: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);