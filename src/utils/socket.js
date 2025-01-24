const socket = require("socket.io");

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
    socket.on("joinChat", (data) => {});

    socket.on("sendMessage", (data) => {});

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
