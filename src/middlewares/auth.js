const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    // Read the token from the req cookies
    const { token } = req.cookies;
    if (!token) {
      return res
        .status(401)
        .json({ message: "You are not logged in. Please Login!" });
    }

    // Validate the token
    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);

    // Find the user
    const { _id } = decodedObj;
    const user = await User.findById(_id).select(
      "_id firstName lastName email skills age about photoUrl"
    );

    if (!user) {
      throw new Error("User not found!");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ message: error.message, success: false });
  }
};

module.exports = { userAuth };
