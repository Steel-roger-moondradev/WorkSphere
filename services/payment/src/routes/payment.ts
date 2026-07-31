import express from "express";
import { isAuth } from "../middleware/auth";
import { checkout, paymentVerification } from "../controllers/payment";

const router = express.Router();

const handleproduction = (req: express.Request, res: express.Response) => {
  res
    .status(200)
    .json({ message: "Payment routes are not available in production mode." });
};

if (process.env.NODE_ENV === "production") {
  router.post("/checkout", handleproduction);
  router.post("/verify", handleproduction);
} else {
  router.post("/checkout", isAuth, checkout);
  router.post("/verify", isAuth, paymentVerification);
}

export default router;
