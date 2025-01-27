const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");
const Connection = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://3.110.165.50",
        "https://gadgets-arena.com",
      ],
    },
    withCredentials: true,
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const room = getSecretRoomId(userId, targetUserId);
      console.log(firstName, "joined Room: ", room);
      socket.join(room);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, userId, targetUserId, text: newMessage }) => {
        // Save message to the database
        try {
          const room = getSecretRoomId(userId, targetUserId);
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }
          chat.messages.push({ senderId: userId, text: newMessage });
          await chat.save();
          io.to(room).emit("getMessage", { firstName, newMessage });
        } catch (error) {
          console.log("Error saving message: ", error);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = initializeSocket;
