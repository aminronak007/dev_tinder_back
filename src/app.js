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
