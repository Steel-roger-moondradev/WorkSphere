import express from "express";
import jobroutes from "./routes/job.js";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL!, "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/job", jobroutes);
export default app;
