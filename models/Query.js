const mongoose = require("mongoose");

const querySchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  query: {
    type: String,
    default: "",
    // timestamp
  },
});

module.exports = mongoose.model("Query", querySchema);
