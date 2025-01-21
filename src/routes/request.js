const router = require("express").Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

router.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const allowedStatus = ["ignored", "interested"];
    if (!allowedStatus.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status type: " + status });
    }

    const toUser = await User.findById(toUserId);

    if (!toUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // If there is an existing connection request
    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingConnectionRequest) {
      return res
        .status(400)
        .json({ message: "Connection Request already sent!" });
    }

    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    const data = await connectionRequest.save();

    const message =
      status === "interested"
        ? `${req.user.firstName} is ${status} in ${toUser.firstName}`
        : `${req.user.firstName} had ${status} ${toUser.firstName}`;

    res.send({
      message: message,
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

router.post("/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;

    // Validate the status
    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status type: " + status });
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested",
    });

    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found." });
    }

    connectionRequest.status = status;
    const data = await connectionRequest.save();
    res.json({ message: "Connection request " + status, data });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});
module.exports = router;
