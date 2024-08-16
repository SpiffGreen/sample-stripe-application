import express, { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import auth from "../middlewares/auth.middleware";

const userRouter = Router();

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
  paymentController.createCheckoutSession
);

userRouter.get("/transactions", auth, paymentController.listTransactions);

export default userRouter;
