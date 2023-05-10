const mongoose = require("mongoose");

const recruiterSchema = new mongoose.Schema({
  companyID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Company",
  },
  name: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  email: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: true,
  },
  
});

module.exports = mongoose.model("Recruiter", recruiterSchema);
