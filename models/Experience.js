const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  companyName: {
    type: String,
    required: true,
  },
  profile: {
    type: String,
    required: true
  },
  processType: {
    type: String,
    enum: ["onCampus", "ppo", "offCampus", "pool", "online"],
  },
  dateOfInterview: {
    type: Date,
  },
  body: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Experience", experienceSchema);
