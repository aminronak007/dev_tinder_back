const express = require("express");
const app = express();

app.use("/", (req, res) => {
  res.send("Hello from the dashboard!");
});

app.use("/test", (req, res) => {
  res.send("Test from the server!");
});

app.use("/hello", (req, res) => {
  res.send("Test from the server!");
});

const port = 8080;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
