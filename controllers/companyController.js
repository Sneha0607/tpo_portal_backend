const Company = require("../models/Company");
const CompanyForm = require("../models/CompanyForm");
const User = require("../models/User");

// @desc Get all companies
// @route GET /company
// @access Private
const getAllCompanies = async (req, res) => {
  // Get all notes from MongoDB
  const companies = await Company.find().sort({ name: 1 }).lean();

  // If no companies
  if (!companies?.length) {
    return res.status(400).json({ message: "No companies found" });
  }

  res.json(companies);
};

// @desc Create new company
// @route POST /company
// @access Private
const createNewCompany = async (req, res) => {
  const { name } = req.body;

  // Confirm data
  if (!name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate title
  const duplicate = await Company.findOne({ name })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  // Create and store the new company
  const company = await Company.create({ name });

  if (company) {
    // Created
    return res.status(201).json({ message: "New company created" });
  } else {
    return res.status(400).json({ message: "Invalid company data received" });
  }
};

module.exports = {
  getAllCompanies,
  createNewCompany,
};
