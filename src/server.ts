import express, { Request, Response, Express } from "express";
import connectionToDatabase from "./database/connection.js";
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
app.listen(PORT, () => {
  console.log(`Server Listening On Port ${PORT}`);
});
