import { Server, Socket } from "socket.io";

function call(io: Server, socket: Socket) {
  socket.on("call", payload => {
    const { recipientId } = payload;
    socket.broadcast.to(recipientId).emit("call", payload);
  });

  socket.on("answer_call", payload => {
    const { userId } = payload;
    socket.broadcast.to(userId).emit("answer_call", payload);
  });

  socket.on("reject_call", payload => {
    const { userId } = payload;
    socket.broadcast.to(userId).emit("reject_call", payload);
  });

  socket.on("sdp-offer", payload => {
    const { peer } = payload;
    socket.broadcast.to(peer).emit("sdp-offer", payload);
  });

  socket.on("sdp-answer", payload => {
    const { peer } = payload;
    socket.broadcast.to(peer).emit("sdp-answer", payload);
  });

  socket.on("ice-candidate", payload => {
    const { peer } = payload;
    socket.broadcast.to(peer).emit("ice-candidate", payload);
  });

  socket.on("leave", payload => {
    const { peer } = payload;
    console.log(payload);
    socket.broadcast.to(peer).emit("leave", payload);
  });
}

export default call;
