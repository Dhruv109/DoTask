const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  members: {
    type: Array,
    required: true,
  },
  todo: {
    type: Array,
    default: [],
  },
  todoNames: {
    type: Array,
    default: [],
  },
  complete: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("groups", groupSchema);
