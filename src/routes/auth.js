const router = require("express").Router();
const User = require("../models/user");
const {
  validateSignUpData,
  validationLoginData,
} = require("../utils/validation");

router.post("/register", async (req, res) => {
  try {
    // Validation of data
    validateSignUpData(req);
    const { firstName, lastName, email, password } = req.body;

    // Creating a new instance of the User Model
    const user = new User({
      firstName,
      lastName,
      email,
      password,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJwt();

    // Add the token to cookie and send the response back to the user
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    });

    res.json({
      message: "User added successfully.",
      data: savedUser,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message, success: false });
  }
});

router.post("/login", async (req, res) => {
  try {
    validationLoginData(req);
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Invalid credentials!");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      // Create a JWT Token
      const token = await user.getJwt();

      // Add the token to cookie and send the response back to the user
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
      });
      res.json({ message: "Login Successful", success: true, data: user });
    } else {
      throw new Error("Invalid credentials!");
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message, success: false });
  }
});

router.post("/logout", async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout Successful!", success: true });
});

module.exports = router;
