import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import paymentRoutes from "./routes/payment";
import Razorpay from "razorpay";

dotenv.config();

export const instance = new Razorpay({
  key_id: process.env.Razorpay_Key,
  key_secret: process.env.Razorpay_Secret,
});

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL!, "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/payment", paymentRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Payment service running on port ${process.env.PORT}`);
});
