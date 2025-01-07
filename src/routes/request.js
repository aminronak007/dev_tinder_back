const router = require("express").Router();
const { userAuth } = require("../middlewares/auth");

router.post("/sendConnectionRequest", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user.firstName + " sent the connection request.");
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

module.exports = router;
