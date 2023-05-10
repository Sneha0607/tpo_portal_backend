const CompanyForm = require("../models/CompanyForm");
const Recruiter = require("../models/Recruiter");
const User = require("../models/User");
const CompanyGroup = require("../models/CompanyGroup");

// @desc Get all company forms
// @route GET /companyForm
// @access Private
const getAllCompanyForms = async (req, res) => {
  const companies = await CompanyForm.find().sort({ createdAt: -1 }).lean();

  // If no companies
  if (!companies?.length) {
    return res.status(400).json({ message: "No company forms found" });
  }

  // Add recruiter name to each company form before sending the response
  const companiesWithRecruiter = await Promise.all(
    companies.map(async (company) => {
      const recruiter = await Recruiter.findById(company.createdBy)
        .lean()
        .exec();
      return {
        ...company,
        recruiterName: recruiter.name,
        recruiterEmail: recruiter.email,
      };
    })
  );

  res.json(companiesWithRecruiter);
};

// @desc Create new company form
// @route POST /companyForm
// @access Private
const createNewCompanyForm = async (req, res) => {
  const {
    companyName,
    companyID,
    profile,
    type,
    ctc,
    allowedBranches,
    cutoffCPI,
    cutoff10,
    cutoff12,
    createdAt,
    createdBy,
  } = req.body;

  // Confirm data
  if (
    !companyName ||
    !companyID ||
    !profile ||
    !type ||
    !ctc ||
    !allowedBranches ||
    !cutoffCPI ||
    !cutoff10 ||
    !cutoff12 ||
    !createdBy
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate title
  const duplicate = await CompanyForm.findOne({ companyID, profile, createdAt })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate company form" });
  }

  // Create and store the new company
  const companyForm = await CompanyForm.create({
    companyName,
    companyID,
    profile,
    type,
    ctc,
    allowedBranches,
    cutoffCPI,
    cutoff10,
    cutoff12,
    createdAt,
    createdBy,
    status: "pending",
  });

  if (companyForm) {
    // Created
    return res.status(201).json(companyForm);
  } else {
    return res.status(400).json({ message: "Invalid company data received" });
  }
};

// PATCH
const updateCompanyForm = async (req, res) => {
  const body = req.body;

  // Confirm form exists to update
  const form = await CompanyForm.findById(body.id).exec();

  if (!form) {
    return res.status(400).json({ message: "Form not found" });
  }

  form.deadline = body.deadline;
  form.dateOfVisit = body.dateOfVisit;
  form.processType = body.processType;
  form.spoc = body.spoc;
  form.ops = body.ops;
  form.status = "verified";
  form.updatedAt = body.updatedAt;

  // const companyGroup = await CompanyGroup.create({
  //   companyFormID: body.id,
  //   name: `${form.companyName}-${form.profile}-${form.updatedAt.getFullYear}`,
  //   admin: [spoc, ops],
  //   members: [spoc, ops],
  // });

  // if (companyGroup == null) {
  //   // TODO - check if null or something else??
  //   return res.status(400).json({ message: "Error in creating company group" });
  // }

  // form.groupID = companyGroup._id;

  const updatedForm = await form.save();

  res
    .status(201)
    .json(`${updatedForm.companyName} - ${updatedForm.profile} form updated`);
};

// PATCH - /companyForm/register
const registerStudent = async (req, res) => {
  const { id, regNo } = req.body;

  // Confirm form exists to update
  const form = await CompanyForm.findById(id).exec();

  if (!form) {
    return res.status(400).json({ message: "Form not found" });
  }

  const registered = form.registered;

  if (registered.includes(regNo)) {
    return res.status(400).json({ message: `${regNo} is already registered` });
  }

  const user = await User.findOne({ regNo }).lean().exec();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.profileStatus !== "Verified") {
    return res
      .status(401)
      .json({ message: `Your profile is ${user.profileStatus}` });
  }

  const allowedBranches = form.allowedBranches;

  if (!allowedBranches.includes(user.branchCode) || form.cutoffCPI > user.cpi) {
    return res
      .status(401)
      .json({ message: "You do not fulfill the eligibility criteria!" });
  }

  registered.push(regNo);
  const updatedForm = await form.save();

  res.status(200).json(updatedForm);
};

// GET - /companyForm/registered/:id
const getRegistered = async (req, res) => {
  let company = await CompanyForm.findById(req.params.id);

  if (!company && company === "pending") {
    return res
      .status(404)
      .json({ message: "Company not found or it's form is pending" });
  }

  // add user details
  const registeredStudents = await Promise.all(
    company.registered.map(async (regNo) => {
      const user = await User.findOne({ regNo }).lean().exec();
      return {
        regNo: user.regNo,
        name: user.name,
        cpi: user.cpi,
        id: user._id,
        course: user.course,
        branch: user.branch,
      };
    })
  );

  return res.status(200).json(registeredStudents);
};

// PATCH -  /companyForm/shortlist
const shortlistStudent = async (req, res) => {
  const { id, regNos } = req.body;

  const shortlistedRegNos = [];

  // Confirm form exists to update
  const form = await CompanyForm.findById(id).exec();

  if (!form) {
    return res.status(400).json({ message: "Form not found" });
  }

  const registered = form.registered;
  const shortlisted = form.shortlisted;

  let i = 0;

  while (i < regNos.length) {
    if (registered.includes(regNos[i]) == false) {
      res.status(400).json(`${regNos[i]} is not registered for this company`);
    }
    if (shortlisted.includes(regNos[i]) == false) {
      shortlistRegNos.push(regNos[i]);
    }
    i++;
  }

  i = 0;

  while (i < shortlistRegNos.length) {
    shortlisted.push(shortlistRegNos[i]);
    i++;
  }

  const updatedForm = await form.save();

  const companyGroup = await CompanyGroup.findById(form.groupID).exec();
  // FIND by company form ID.groupID
  // Push the shortlisted doc IDs into the members array

  res.status(200).json(updatedForm);
};

// GET - /companyForm/shortlisted/:id
const getShortlisted = async (req, res) => {
  let company = await CompanyForm.findById(req.params.id);

  if (!company && company === "pending") {
    return res
      .status(404)
      .json({ message: "Company not found or it's form is pending" });
  }

  // add user details
  const shortlistedStudents = await Promise.all(
    company.shortlisted.map(async (userID) => {
      const user = await User.findById(userID).lean().exec();
      return {
        regNo: user.regNo,
        name: user.name,
        cpi: user.cpi,
        id: user._id,
        course: user.course,
        branch: user.branch,
      };
    })
  );

  return res.status(200).json(shortlistedStudents);
};

// PATCH -  /companyForm/place
const placeStudent = async (req, res) => {
  const { id, regNos } = req.body;

  const placedRegNos = [];

  // Confirm form exists to update
  const form = await CompanyForm.findById(id).exec();

  if (!form) {
    return res.status(400).json({ message: "Form not found" });
  }

  const registered = form.registered;
  const shortlisted = form.shortlisted;
  const placed = form.placed;

  let i = 0;

  while (i < regNos.length) {
    const user = await User.findById(regNos[i]).exec();
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (registered.includes(regNos[i]) == false) {
      res.status(400).json(`${regNos[i]} is not registered for this company`);
    }
    if (shortlisted.includes(regNos[i]) == false) {
      res.status(400).json(`${regNos[i]} is not shortlisted for this company`);
    }
    if (placed.includes(regNos[i]) == false) {
      placedRegNos.push(regNos[i]);
      user.placed = true;
      // id = form._id
      user.companyId.push(id);
      const updatedUser = await user.save();
      console.log(updatedUser);
    }
    i++;
  }

  i = 0;

  while (i < placedRegNos.length) {
    placed.push(placedRegNos[i]);
    i++;
  }

  const updatedForm = await form.save();

  res.status(200).json(updatedForm);
};

// GET - /companyForm/placed/:id
const getPlaced = async (req, res) => {
  let company = await CompanyForm.findById(req.params.id);

  if (!company && company === "pending") {
    return res
      .status(404)
      .json({ message: "Company not found or it's form is pending" });
  }

  // add user details
  const placedStudents = await Promise.all(
    company.placed.map(async (regNo) => {
      const user = await User.findOne({ regNo }).lean().exec();
      return {
        regNo: user.regNo,
        name: user.name,
        cpi: user.cpi,
        id: user._id,
        course: user.course,
        branch: user.branch,
      };
    })
  );

  return res.status(200).json(placedStudents);
};

module.exports = {
  getAllCompanyForms,
  createNewCompanyForm,
  updateCompanyForm,
  registerStudent,
  getRegistered,
  shortlistStudent,
  getShortlisted,
  placeStudent,
  getPlaced,
};
