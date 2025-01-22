const router = require("express").Router();
const { userAuth } = require("../middlewares/auth");
const { validateProfileEditData } = require("../utils/validation");
const User = require("../models/user");

router.get("/view", userAuth, (req, res) => {
  try {
    const user = req.user;
    res.json({ data: user, success: true });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

router.patch("/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileEditData(req)) {
      throw new Error("Invalid Edit Reqeust");
    }

    const loggedInUser = req.user;
    const updatedUser = await User.findByIdAndUpdate(loggedInUser._id, {
      ...req.body,
    });
    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfully`,
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

module.exports = router;
