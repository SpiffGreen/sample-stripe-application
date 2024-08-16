import Stripe from "stripe";
import { db } from "../utils/db.util";
import { paymentIntentsTable, transactionsTable } from "../migrations/schema";
import { and, desc, eq } from "drizzle-orm";

export const stripe = new Stripe(process.env.STRIPE_SECRET as string);

type CartItem = {
  productName: string;
  productId: string;
  price: number;
  quantity: number;
};

const formatItems = (items: CartItem[]) => {
  return items.map((item) => ({
    price_data: {
      currency: "cad",
      product_data: {
        name: item.productName,
      },
      unit_amount: item.price * 100,
    },
    quantity: item.quantity,
  }));
};

export const createPaymentIntent = async (amount: number) => {
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "cad",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent.client_secret;
};

export const createConnectedAccount = async (payload: {
  email: string;
}): Promise<string> => {
  const response = await stripe.accounts.create({
    email: payload.email,
    country: "",
    controller: {
      losses: {
        payments: "application",
      },
      fees: {
        payer: "application",
      },
      stripe_dashboard: {
        type: "express",
      },
    },
  });
  return response.id;
};

export const transferToConnectedAccount = async (payload: {
  amount: number;
  accountId: string;
}): Promise<string> => {
  const transfer = await stripe.transfers.create({
    amount: 1000,
    currency: "cad",
    destination: "{{CONNECTED_STRIPE_ACCOUNT_ID}}",
  });

  return transfer.id;
};

export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  /**
   * {
  id: "pi_3PnY45FOLfddDffr0AzSEhc7",
  object: "payment_intent",
  amount: 2000,
  amount_capturable: 0,
  amount_details: {
    tip: {},
  },
  amount_received: 2000,
  application: null,
  application_fee_amount: null,
  automatic_payment_methods: null,
  canceled_at: null,
  cancellation_reason: null,
  capture_method: "automatic",
  client_secret: "pi_3PnY45FOLfddDffr0AzSEhc7_secret_huaWPVmAn5fimUS1DKOIMEbmq",
  confirmation_method: "automatic",
  created: 1723606801,
  currency: "usd",
   */

  if (!paymentIntent.client_secret) throw new Error("Invalid request");

  const intentRecord = await db.query.paymentIntentsTable.findFirst({
    where: and(
      eq(
        paymentIntentsTable.paymentIntent,
        paymentIntent.client_secret as string
      ),
      eq(paymentIntentsTable.status, "pending")
    ),
  });
  if (!intentRecord) throw new Error("Invalid request!");

  if (intentRecord.amount > paymentIntent.amount_received)
    throw new Error("Invalid request!!"); // You can decide to throw here too

  const lastTransaction = await db.query.transactionsTable.findFirst({
    where: and(
      eq(transactionsTable.userId, intentRecord.userId),
      eq(transactionsTable.status, "done")
    ),
    orderBy: desc(transactionsTable.id),
  });
  const prevBalance = lastTransaction?.balance ?? 0;

  await db.insert(transactionsTable).values({
    status: "done",
    amount: intentRecord.amount,
    balance: prevBalance + intentRecord.amount,
    summary: "Deposit of $" + (intentRecord.amount / 100).toString(),
    userId: intentRecord.userId,
    paymentIntent: intentRecord.paymentIntent,
  });

  await db.update(paymentIntentsTable).set({
    status: "done",
  });
}

export const createCheckoutSession = async (payload: {
  products: CartItem[];
  successUrl: string;
  cancelUrl: string;
  userEmail: string;
}) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: formatItems(payload.products),
    mode: "payment",
    success_url: payload.successUrl,
    cancel_url: payload.cancelUrl,
    customer_email: payload.userEmail,
  });

  return session;
};
