import express from "express";
import authroutes from "./routes/auth.js";

//import { connectkafka } from './producer.js';
import cors from "cors";
const app = express();

// connectkafka();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/auth", authroutes);

export default app;
