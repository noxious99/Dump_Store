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
  preferences: {
    currency: {
      type: String,
      default: "USD"
    },
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);