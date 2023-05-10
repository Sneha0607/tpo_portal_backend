const User = require("../models/User");
const bcrypt = require("bcrypt");
const csv = require("csv-parser");
const fs = require("fs");

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = async (req, res) => {
  // Get all users from MongoDB
  const users = await User.find().sort({ name: 1 }).select("-password").lean();

  // If no users
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
};

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = async (req, res) => {
  const { regNo, password, roles } = req.body;

  // Confirm data
  if (!regNo || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate regNo
  const duplicate = await User.findOne({ regNo })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate regNo" });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { regNo, password: hashedPwd }
      : { regNo, password: hashedPwd, roles };

  // Create and store new user
  const user = await User.create(userObject);

  if (user) {
    //created
    res.status(201).json({ message: `New user ${regNo} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
};

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = async (req, res) => {
  const { id, regNo, roles, password } = req.body;

  // Confirm data
  if (!id || !regNo || !Array.isArray(roles) || !roles.length) {
    return res
      .status(400)
      .json({ message: "All fields except password are required" });
  }

  // Does the user exist to update?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check for duplicate
  const duplicate = await User.findOne({ regNo })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate regNo" });
  }

  user.regNo = regNo;
  user.roles = roles;
  user.profileStatus = 'Verified'

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.regNo} updated` });
};

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }

  // Does the user exist to delete?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const reply = `RegNo ${result.regNo} with ID ${result._id} deleted`;

  res.json(reply);
};

const btechBranches = [
  { id: "BT", name: "Biotechnology" },
  { id: "CH", name: "Chemical Engineering" },
  { id: "CE", name: "Civil Engineering" },
  { id: "CSE", name: "Computer Science and Engineering" },
  { id: "EE", name: "Electrical Engineering" },
  { id: "ECE", name: "Electronics and Communication Engineering" },
  { id: "IT", name: "Information Technology" },
  { id: "ME", name: "Mechanical Engineering" },
  { id: "PIE", name: "Production and Industrial Engineering" },
];

const mtechBranches = [
  { id: "MBME", name: "Bio-Medical Engineering (AMD)" },
  { id: "MFE", name: "Fluid Engineering (AMD)" },
  { id: "MMS", name: "Material Sciences (AMD)" },
  { id: "MEMD", name: "Engineering Mechanics and Design (AMD)" },
  { id: "MBT", name: "Biotechnology (Biotechnology)" },
  { id: "MCE", name: "Chemical Engineering (CHED)" },
  { id: "MEE", name: "Environmental Engineering (CED)" },
  { id: "MGTE", name: "Geo-technical Engineering (CED)" },
  { id: "MTE", name: "Transportation Engineering (CED)" },
  { id: "MSTE", name: "Structural Engineering (CED)" },
  { id: "MCSE", name: "Computer Science and Engineering (CSED)" },
  { id: "MIS", name: "Information Security (CSED)" },
  { id: "MSE", name: "Software Engineering (CSED)" },
  { id: "MCI", name: "Control and Instrumentation (EED)" },
  { id: "MPED", name: "Power Electronics and Drives (EED)" },
  { id: "MPS", name: "Power Systems (EED)" },
  { id: "MSI", name: "Signal Processing (ECED)" },
  { id: "MVLSI", name: "Microelectronics and VLSI Design (ECED)" },
  { id: "MCS", name: "Communication Systems (ECED)" },
  { id: "MGIS", name: "Geoinformatics (GIS Cell)" },
  { id: "MCAD", name: "Computer Aided Design and Manufacturing (MED)" },
  { id: "MDE", name: "Design Engineering (MED)" },
  { id: "MPDD", name: "Product Design and Development (MED)" },
  { id: "MPE", name: "Production Engineering (MED)" },
  { id: "MTHE", name: "Thermal Engineering (MED)" },
];

const otherCourses = [
  { id: "MCA", name: "Master of Computer Applications" },
  { id: "MBA", name: "Master of Business Administration" },
  { id: "MSC", name: "Mathematics and Scientific Computing" },
  { id: "PhD", name: "Ph.D." },
];

// add users
const createUsers = async (req, res) => {
  let results = [];
  let response = [];

  // console.log(req.body)

  await fs
    .createReadStream("test_data.csv")
    .pipe(csv({}))
    .on("data", async (data) => {
      results.push(data);
      var regNo = data.regNo;
      var password = data.password;
      var name = data.name;
      var course = data.course;
      var branch = data.branch;
      var gender = data.gender;
      var dob = data.dob;
      var category = data.category.toUpperCase();
      var physicallyChallenged = data.physicallyChallenged.toUpperCase();
      var cpi = data.cpi;
      var currBacklogs = data.currBacklogs;
      var totalBacklogs = data.totalBacklogs;
      var branchCode;
      var profileStatus = 'Pending'

      if (course === "B.Tech.") {
        btechBranches.map((btechBranch) => {
          if (btechBranch.name === branch) {
            branchCode = btechBranch.id;
          }
        });
      } else if (course === "M.Tech.") {
        mtechBranches.map((mtechBranch) => {
          if (mtechBranch.name === branch) {
            branchCode = mtechBranch.id;
          }
        });
      } else {
        otherCourses.map((otherCourse) => {
          if(course === otherCourse.id) {
            branchCode = otherCourse.id
            branch = otherCourse.name
          }
        })
      }

      // Check for duplicate regNo
      var duplicate = await User.findOne({ regNo: regNo })
        .collation({ locale: "en", strength: 2 })
        .lean()
        .exec();

      //   console.log(duplicate);

      if (duplicate) {
        await response.push(`Duplicate regNo, ${regNo}`);
        console.log(`Duplicate regNo, ${regNo}`);
      } else {
        // Hash password
        var hashedPwd = await bcrypt.hash(password, 10); // salt rounds

        var userObject = {
          regNo,
          password: hashedPwd,
          name,
          course,
          branch,
          branchCode,
          gender,
          dob,
          category,
          physicallyChallenged,
          cpi,
          currBacklogs,
          totalBacklogs,
          profileStatus
        };

        // Create and store new user
        var user = await User.create(userObject);

        if (user) {
          await response.push(`New user ${regNo} created`);
        } else {
          await response.push("Invalid user data received");
        }
      }
    })
    .on("end", () => {
      // console.log(results);
      console.log(response);
      res.status(201).json({message: response});
    });
};

// GET /users/:id
const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json(user);
};

// PATCH /users/roles
const updateUserRole = async (req, res) => {
  const user = await User.findById(req.params.id);

  const { roles } = req.body;

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Confirm data
  if (!Array.isArray(roles) || !roles.length) {
    return res
      .status(400)
      .json({ message: "All fields are required" });
  }

  user.roles = roles;

  const updatedUser = await user.save();

  res.status(200).json({ message: `${updatedUser.regNo} roles updated` });

} 


module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
  createUsers,
  getUser,
  updateUserRole
};
