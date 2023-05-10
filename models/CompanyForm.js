const mongoose = require("mongoose");

const companyFormSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  companyID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Company",
  },
  profile: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["core", "software", "consultancy", "psu"],
  },
  ctc: {
    type: Number,
  },
  allowedBranches: {
    type: [String],
  },
  cutoffCPI: {
    type: Number,
  },
  cutoff10: {
    type: Number,
  },
  cutoff12: {
    type: Number,
  },
  serviceBond: {
    type: String
  },
  deadline: {
    type: Date, // timeStamp
  },
  dateOfVisit: {
    type: Date,
  },
  processType: {
    type: String,
    enum: ["onCampus", "ppo", "offCampus", "pool", "online"],
  },
  spoc: {
    type: String,
  },
  ops: {
    type: String,
  },
  registered: {
    type: [String], //array of registration numbers 
  },
  shortlisted: {
    type: [String], //array of registration numbers
  },
  placed: {
    type: [String], //array of registration numbers
  },
  groupID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CompanyGroup"
  },
  status: {
    type: String,
    enum: ["pending", "verified", "completed"]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Recruiter",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model("CompanyForm", companyFormSchema);