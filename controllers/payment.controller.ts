import express, { type NextFunction } from "express";
import * as stripeService from "../helpers/stripe.helper";
import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from "../helpers/exceptions.helper";
import { db } from "../utils/db.util";
import {
  cartTable,
  paymentIntentsTable,
  transactionsTable,
  usersTable,
} from "../migrations/schema";
import { HttpTransaction } from "@libsql/client/http";
import { and, desc, eq } from "drizzle-orm";

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
        const cartSession = await db.query.cartTable.findFirst({
          where: eq(cartTable.sessionId, event.data.object.id),
        });
        if (!cartSession) throw new BadRequestException();

        // Do some additional check for the amount

        await db
          .update(cartTable)
          .set({
            status: "done",
          })
          .where(eq(cartTable.id, cartSession.id));
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
    await db.insert(cartTable).values({
      userId: req.user?.sub ?? 0,
      products: req.body.products as stripeService.CartItem[],
      sessionId: session.id,
    });
    return res.json({
      success: true,
      message: "Created checkout session",
      data: session,
    });
  } catch (error) {
    if (error instanceof HttpTransaction) return next(error);
    next(new InternalServerErrorException("Could not create "));
  }
}

export async function setupPayout(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    if (!req.file) throw new BadRequestException("Please provide file");
    const response = await stripeService.createConnectedAccount({
      email: req.user?.email ?? "",
      ip: req.socket.remoteAddress ?? req.ip,
      file: req.file?.buffer,
    });
    return res.json({
      success: true,
      message: "Successfully setup Payout info",
      data: response.id,
    });
  } catch (error) {
    if (error instanceof HttpException) return next(error);
    next(new InternalServerErrorException("Could not setup account"));
  }
}

export const cashout = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { amount } = req.body;
    if (!amount) throw new BadRequestException("Please provide amount");
    const lastTransaction = await db.query.transactionsTable.findFirst({
      where: and(
        eq(transactionsTable.userId, req.user!.sub),
        eq(transactionsTable.status, "done")
      ),
      orderBy: desc(transactionsTable.id),
    });

    if ((lastTransaction?.balance || 0) < amount)
      throw new BadRequestException("Insufficient funds");

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, req.user!.sub),
    });
    if (!user) throw new BadRequestException();
    if (!user.stripeConnectedAccount)
      throw new BadRequestException("Please setup your account first");

    const transfer = await stripeService.withdrawToConnectedAccount({
      stripeConnectId: user.stripeConnectedAccount,
      amount,
    });

    await db.insert(transactionsTable).values({
      amount,
      balance: Number(lastTransaction?.balance) - amount,
      summary: "Withdraw funds",
      userId: user.id,
      paymentIntent: transfer.id,
      status: "done",
    });

    return res.json({
      success: true,
      message: "Transfer in progress",
      data: transfer,
    });
  } catch (error) {
    console.log(error);
    if (error instanceof HttpException) return next(error);
    next(new InternalServerErrorException("Withdrawal failed"));
  }
};
