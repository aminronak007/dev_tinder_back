require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user");

app.use(express.json());

app.post("/signup", async (req, res) => {
  // Creating a new instance of the User Model
  const user = new User(req.body);

  try {
    await user.save();
    res.send("User added successfully.");
  } catch (error) {
    console.log(error);
    res.status(400).send("Error adding the user: ", error);
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

app.patch("/user", async (req, res) => {
  const userId = req.body.userId;
  const data = req.body;
  try {
    await User.findByIdAndUpdate(userId, data);
    res.send("User updated successfully.");
  } catch (error) {
    console.log(error);
    res.status(400).send("Something went wrong");
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
