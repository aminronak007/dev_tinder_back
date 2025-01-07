require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user");
const {
  validateSignUpData,
  validationLoginData,
} = require("./utils/validation");
const cookieParser = require("cookie-parser");
const { verifyAccessToken } = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
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

    await user.save();
    res.send("User added successfully.");
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

app.post("/signin", async (req, res) => {
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
        secure: true,
      });
      res.send("Login Successful");
    } else {
      throw new Error("Invalid credentials!");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

app.get("/profile", verifyAccessToken, (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

app.post("/sendConnectionRequest", verifyAccessToken, async (req, res) => {
  try {
    const user = req.user;
    res.send(user.firstName + " sent the connection request.");
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connection established...");
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  })
  .catch((error) => {
    console.log("Database cannot be connected!!!", error);
  });
