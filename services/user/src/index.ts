import express from "express";
import dotenv from "dotenv";
import userroutes from "./routes/user.js";
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

app.use("/api/user", userroutes);
app.listen(process.env.PORT, () => {
  console.log(`User service is listening on ${process.env.PORT}`);
});
