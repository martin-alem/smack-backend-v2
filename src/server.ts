import express, { Request, Response, Express } from "express";
import connectionToDatabase from "./database/connection.js";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

import loginRouter from "./routes/loginRoute.js";
import logoutRouter from "./routes/logoutRoute.js";
import authorizeRouter from "./routes/authorizeRoute.js";
import settingRouter from "./routes/settingRoute.js";
import getCodeRouter from "./routes/getCodeRoute.js";
import enableTFARouter from "./routes/enableTFARoute.js";
import friendsRouter from "./routes/friendsRoute.js";
import userRouter from "./routes/userRoute.js";
import peopleRouter from "./routes/peopleRoute.js";
import notificationRouter from "./routes/notificationRoute.js";
import friendRequestRouter from "./routes/friendRequestRoute.js";
import chatRouter from "./routes/chatRouter.js";
import messagesRouter from "./routes/messagesRoute.js";

import privateChat from "./socket/privateChat.js";
import assignRoom from "./socket/assignRoom.js";

dotenv.config();

connectionToDatabase();

const app: Express = express();

//Express Cors Configuration
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cookieParser());
app.enable("trust proxy");
app.use(cors(corsOptions));
app.use(express.json());

//Setting up socket IO server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE", "OPTIONS", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  },
});

const onConnection = (socket: Socket) => {
  assignRoom(io, socket);
  privateChat(io, socket);
};

io.on("connection", onConnection);

//Login endpoint
app.use("/api/v1/login", loginRouter);

//Logout endpoint
app.use("/api/v1/logout", logoutRouter);

//Authorize endpoint
app.use("/api/v1/authorize", authorizeRouter);

//Settings endpoint
app.use("/api/v1/settings", settingRouter);

//Code endpoint
app.use("/api/v1/code", getCodeRouter);

//Two factor Authentication endpoint
app.use("/api/v1/twoFA", enableTFARouter);

//Friends endpoint
app.use("/api/v1/friends", friendsRouter);

//User endpoint
app.use("/api/v1/user", userRouter);

//People endpoint
app.use("/api/v1/people", peopleRouter);

//Notification endpoint
app.use("/api/v1/notification", notificationRouter);

//Friend request endpoint
app.use("/api/v1/friend_request/", friendRequestRouter);

//Chat summary endpoint
app.use( "/api/v1/chats", chatRouter );

//Message endpoint
app.use( "/api/v1/messages", messagesRouter)

//Ping routes to check server status
app.get("/api/ping", (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    message: "Server up and running",
  });
});

//Bad route handler
app.all("*", (req: Request, res: Response) => {
  res.status(404).json({
    status: 404,
    message: `${req.url} resource not found on this server`,
  });
});

const PORT: string = process.env.PORT || `4000`;
httpServer.listen(PORT, () => {
  console.log(`Server Listening On Port ${PORT}`);
});
