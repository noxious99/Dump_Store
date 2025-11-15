const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
  username: {
    type: String,
    required: true
  },
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
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);