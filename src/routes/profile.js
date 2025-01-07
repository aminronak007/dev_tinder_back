const router = require("express").Router();
const { userAuth } = require("../middlewares/auth");

router.get("/", userAuth, (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

module.exports = router;
