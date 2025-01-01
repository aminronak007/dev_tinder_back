const express = require("express");
const app = express();

app.get("/getUserData", (req, res) => {
  try {
    // throw new Error("Error unexpected");
    res.send("User Data sent");
  } catch (error) {
    res.status(500).send("Something went wrong. Please contact support team.");
  }
});

app.use("/", (err, req, res, next) => {
  if (err) {
    res.status(500).send("Something went wrong.");
  }
});

const port = 8080;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
