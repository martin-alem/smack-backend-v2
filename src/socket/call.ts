import { Server, Socket } from "socket.io";

function call(io: Server, socket: Socket) {
  socket.on("call", payload => {
    const { recipientId } = payload;
    socket.broadcast.to(recipientId).emit("call", payload);
  });

  socket.on("answer_call", payload => {
    const { callerId } = payload;
    socket.broadcast.to(callerId).emit("answer_call", payload);
  });

  socket.on("reject_call", payload => {
    const { callerId } = payload;
    socket.broadcast.to(callerId).emit("reject_call", payload);
  });

  socket.on("sdp-offer", payload => {
    const { peerId } = payload;
    socket.broadcast.to(peerId).emit("sdp-offer", payload);
  });

  socket.on("sdp-answer", payload => {
    const { peerId } = payload;
    socket.broadcast.to(peerId).emit("sdp-answer", payload);
  });

  socket.on("ice-candidate", payload => {
    const { peerId } = payload;
    socket.broadcast.to(peerId).emit("ice-candidate", payload);
  });

  socket.on("leave", payload => {
    const { peerId } = payload;
    socket.broadcast.to(peerId).emit("leave", payload);
  });
}

export default call;
