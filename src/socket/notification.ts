import { Server, Socket } from "socket.io";

function notification(io: Server, socket: Socket) {
  socket.on("notification", payload => {
    const { recipient, message } = payload;
    socket.broadcast.to(recipient.userId).emit("notification", message);
  });
}

export default notification;
