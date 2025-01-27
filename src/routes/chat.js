const router = require("express").Router();
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/chat");

router.post("/messages", userAuth, async (req, res) => {
  const { userId, targetUserId } = req.body;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName",
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
      });
      await chat.save();
    }

    res.json({
      message: "All messages fetched successfully",
      success: true,
      data: chat,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message, success: false });
  }
});

module.exports = router;
