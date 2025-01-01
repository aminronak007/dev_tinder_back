require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user");
const {
  validateSignUpData,
  validationLoginData,
} = require("./utils/validation");
const bcrypt = require("bcrypt");

app.use(express.json());

app.post("/signup", async (req, res) => {
  try {
    // Validation of data
    validateSignUpData(req);
    const { firstName, lastName, email, password } = req.body;

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Creating a new instance of the User Model
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
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

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      res.send("Login Successful");
    } else {
      throw new Error("Invalid credentials!");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

// Get user by email
app.get("/user", async (req, res) => {
  const email = req.body.email;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("Something went wrong");
  }
});

// Feed Api - Get /feed - get all the users from the database
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({}).lean();
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(400).send("Something went wrong");
  }
});

app.delete("/user", async (req, res) => {
  try {
    const userId = req.body.userId;
    await User.findByIdAndDelete(userId);
    res.send("User deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(400).send("Something went wrong");
  }
});

app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  try {
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );

    if (!isUpdateAllowed) {
      throw new Error("Updates not allowed.");
    }

    if (data?.skills.length > 10) {
      throw new Error("Skills should not be more than 10");
    }

    await User.findByIdAndUpdate(userId, data, { runValidators: true });
    res.send("User updated successfully.");
  } catch (error) {
    console.log(error);
    res.status(400).send("Something went wrong: " + error.message);
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
