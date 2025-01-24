const socket = require("socket.io");
const crypto = require("crypto");

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
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const room = getSecretRoomId(userId, targetUserId);
      console.log(firstName, "joined Room: ", room);
      socket.join(room);
    });

    socket.on(
      "sendMessage",
      ({ firstName, userId, targetUserId, text: newMessage }) => {
        const room = getSecretRoomId(userId, targetUserId);
        console.log(firstName, " ", newMessage);

        io.to(room).emit("getMessage", { firstName, newMessage });
      }
    );

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = initializeSocket;
