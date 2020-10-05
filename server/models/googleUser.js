const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  email: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  todo: {
    type: Array,
    default: [],
  },
  complete: {
    type: Array,
    default: [],
  },
  groups: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("googleUser", userSchema);
