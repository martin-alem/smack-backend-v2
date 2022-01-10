import { Server, Socket } from "socket.io";

function assignRoom(io: Server, socket: Socket) {
  socket.on("join_room", payload => {
      const { userId } = payload
      socket.join(userId)
  });
}

export default assignRoom;
