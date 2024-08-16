import express, { type NextFunction } from "express";
import * as stripeService from "../helpers/stripe.helper";
import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from "../helpers/exceptions.helper";
import { db } from "../utils/db.util";
import { paymentIntentsTable, transactionsTable } from "../migrations/schema";
import { HttpTransaction } from "@libsql/client/http";
import { and, eq } from "drizzle-orm";

export async function createPaymentIntent(
  req: express.Request,
  res: express.Response,
  next: NextFunction
) {
  try {
    const { amount } = req.body;
    if (Number.isNaN(amount))
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });

    const clientSecret = await stripeService.createPaymentIntent(amount);

    await db.insert(paymentIntentsTable).values({
      amount: 40000,
      userId: req.user?.sub ?? 0,
      paymentIntent: clientSecret,
      status: "pending",
    });

    return res.status(201).json({
      message: "Successful",
      success: true,
      data: {
        clientSecret,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function verifyWebhook(
  req: express.Request,
  res: express.Response,
  next: NextFunction
) {
  // payment_intent=pi_3PlOkHFOLfddDffr1gHLBMbv&payment_intent_client_secret=pi_3PlOkHFOLfddDffr1gHLBMbv_secret_1TBq6PBc6rNYDgbVyzEVzymPV&redirect_status=succeeded
  const sig = (req.headers["stripe-signature"] as string) ?? "";
  let event = null;
  try {
    const stripePayload = (req as any).rawBody || req.body;
    event = await stripeService.stripe.webhooks.constructEventAsync(
      stripePayload,
      sig.toString(),
      process.env.STRIPE_SIGNING_SECRET as string
    );

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("PaymentIntent was successful!", event.data, paymentIntent);
        // Then define and call a method to handle the successful payment intent.
        await stripeService.handlePaymentIntentSucceeded(paymentIntent);
        break;
      case "checkout.session.completed":
        console.log(event.data.object);
        console.log("Check complete");
        break;
    }
    return res.json({ received: true });
  } catch (error) {
    // console.log(error);
    return next(new BadRequestException());
  }
}

export async function verifyPayment(
  req: express.Request,
  res: express.Response,
  next: NextFunction
) {
  try {
    const intent = await stripeService.stripe.paymentIntents.retrieve(
      req.params.paymentIntent
    );
    if (intent.amount <= intent.amount_received) {
      return res.status(200).json({
        success: true,
        message: "Verified",
        data: { verified: true },
      });
    } else {
      throw new BadRequestException("Invalid payment intent");
    }
  } catch (err) {
    if (err instanceof HttpException) return next(err);
    next(new BadRequestException());
  }
}

export async function listTransactions(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const transactions = await db.query.transactionsTable.findMany({
      where: and(
        eq(transactionsTable.userId, req.user!.sub)
        // eq(transactionsTable.status, "done")
      ),
    });
    return res.json({
      success: true,
      message: "User transactions",
      data: transactions,
    });
  } catch (error) {
    if (error instanceof HttpTransaction) return next(error);
    next(new InternalServerErrorException());
  }
}

export async function createCheckoutSession(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const session = await stripeService.createCheckoutSession({
      products: req.body.products,
      successUrl: req.body.successUrl,
      cancelUrl: req.body.cancelUrl,
      userEmail: req.user?.email ?? "",
    });
    return res.json({
      success: true,
      message: "Created checkout session",
      data: session,
    });
  } catch (error) {
    if (error instanceof HttpTransaction) return next(error);
    next(new InternalServerErrorException());
  }
}
