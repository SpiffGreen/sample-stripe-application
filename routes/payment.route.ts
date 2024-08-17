import express, { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import auth from "../middlewares/auth.middleware";
import multer from "multer";

const userRouter = Router();

// Use memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage() });

userRouter.get("/transactions", auth, paymentController.listTransactions);

// First version (simply receive funds)
userRouter.get(
  "/verify-payment-intent/:paymentIntent",
  paymentController.verifyPayment
);
userRouter.post(
  "/create-payment-intent",
  auth,
  paymentController.createPaymentIntent
);
userRouter.post(
  "/verify-payment",
  express.raw({ type: "application/json" }),
  paymentController.verifyWebhook
);

// Second checkout
userRouter.post(
  "/create-checkout-session",
  auth,
  paymentController.createCheckoutSession
);

// Payouts routes
userRouter.post(
  "/setup-payout",
  auth,
  upload.single("idDocument"),
  paymentController.setupPayout
);

export default userRouter;
