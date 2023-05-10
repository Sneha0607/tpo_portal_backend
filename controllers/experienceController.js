const Experience = require("../models/Experience");
const User = require("../models/User");

// GET - /experience
const getAllExperiences = async (req, res) => {
  const experiences = await Experience.find().sort({ createdAt: 1 }).lean();

  if (!experiences?.length) {
    return res.status(400).json({ message: "No experiences found" });
  }

  const experiencesWithUser = await Promise.all(
    experiences.map(async (experience) => {
      const user = await User.findById(experience.userID)
        .lean()
        .exec();
      return {
        ...experience,
        userName: user.name,
        userRegNo: user.regNo,
        userCourse: user.course,
        userBranch: user.branch
      };
    })
  );

  res.json(experiencesWithUser);
};


// POST - /experience
const createNewExperience = async (req, res) => {
  const { userID, companyName, profile, dateOfInterview, body, createdAt } =
    req.body;

  // Confirm data
  if (
    !userID ||
    !companyName ||
    !profile ||
    !processType ||
    !dateOfInterview ||
    !body
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate experience
  const duplicate = await Experience.findOne({ userID, companyName, profile })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate experience" });
  }

  // Create and store the new experience
  const experience = await Experience.create({
    userID,
    companyName,
    profile,
    processType,
    dateOfInterview,
    body,
    createdAt,
  });

  if (experience) {
    // Created
    return res.status(201).json({ message: "New experience created" });
  } else {
    return res
      .status(400)
      .json({ message: "Invalid experience data received" });
  }
};

module.exports = {
  getAllExperiences,
  createNewExperience,
};
