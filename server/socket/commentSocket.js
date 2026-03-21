export const initSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("join_item", (itemId) => {
      socket.join(itemId);
    });
    socket.on("leave_item", (itemId) => {
      socket.leave(itemId);
    });
  });
};
