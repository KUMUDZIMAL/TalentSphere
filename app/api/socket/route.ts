import { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse & { socket: any }
) {
  if (!res.socket.server.io) {
    console.log("Starting Socket.IO server...");
    const io = new Server(res.socket.server, {
        path: "/api/socket/", // Changed path
        cors: {
          origin: "*", // Adjust this in production
          methods: ["GET", "POST"]
        },
        addTrailingSlash: false
      });


    res.socket.server.io = io;
    
    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);
      
      socket.on("call_invitation", (data) => {
        io.to(data.targetUserID).emit("call_invitation", {
          roomID: data.roomID,
          callerID: data.callerID,
          callerName: data.callerName
        });
      });
    });
  }
  res.end();
}
// Add CORS configuration and ensure correct path
