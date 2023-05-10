const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
  const { regNo, password } = req.body;

  if (!regNo || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const foundUser = await User.findOne({ regNo }).exec();

  // || !foundUser.roles.includes("TPR")

  if (!foundUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) return res.status(401).json({ message: "Unauthorized" });

  const accessToken = jwt.sign(
    {
      UserInfo: {
        id: foundUser.id,
        name: foundUser.name,
        regNo: foundUser.regNo,
        roles: foundUser.roles,
        course: foundUser.course,
        branch: foundUser.branch,
        branchCode: foundUser.branchCode,
        cpi: foundUser.cpi,
        gender: foundUser.gender,
        dob: foundUser.dob,
        category: foundUser.category,
        physicallyChallenged: foundUser.physicallyChallenged,
        currBacklogs: foundUser.currBacklogs,
        totalBacklogs: foundUser.totalBacklogs,
        credits: foundUser.credits,
        profileStatus: foundUser.profileStatus,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { regNo: foundUser.regNo },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  // Create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  // Send accessToken containing regNo and roles
  res.json({ accessToken });
};

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      const foundUser = await User.findOne({ regNo: decoded.regNo }).exec();

      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: foundUser.id,
            name: foundUser.name,
            regNo: foundUser.regNo,
            roles: foundUser.roles,
            course: foundUser.course,
            branch: foundUser.branch,
            branchCode: foundUser.branchCode,
            cpi: foundUser.cpi,
            gender: foundUser.gender,
            dob: foundUser.dob,
            category: foundUser.category,
            physicallyChallenged: foundUser.physicallyChallenged,
            currBacklogs: foundUser.currBacklogs,
            totalBacklogs: foundUser.totalBacklogs,
            credits: foundUser.credits,
            profileStatus: foundUser.profileStatus,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    }
  );
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

// PATCH /auth/:id
const updatePassword = async (req, res) => {
  const user = await User.findById(req.params.id);
  const { password, confirmPassword } = req.body;

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(401).json({ message: "Passwords don't match!" });
  }

  var hashedPwd = await bcrypt.hash(password, 10);

  user.password = hashedPwd;

  const updatedUser = await user.save();

  return res.status(200).json(updatedUser);
};

module.exports = {
  login,
  refresh,
  logout,
  updatePassword
};
