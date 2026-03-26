export const initSocket = (io) => {
  io.on("connection", (socket) => {
    // Item rooms (existing)
    socket.on("join_item", (itemId) => {
      socket.join(itemId);
    });
    socket.on("leave_item", (itemId) => {
      socket.leave(itemId);
    });

    // User room for personal notifications (NEW)
    socket.on("join_user", (uid) => {
      if (uid) socket.join(`user:${uid}`);
    });
    socket.on("leave_user", (uid) => {
      if (uid) socket.leave(`user:${uid}`);
    });
  });
};
