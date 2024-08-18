import Stripe from "stripe";
import { db } from "../utils/db.util";
import {
  paymentIntentsTable,
  transactionsTable,
  usersTable,
} from "../migrations/schema";
import { and, desc, eq } from "drizzle-orm";
import { BadRequestException } from "./exceptions.helper";
import type { FileBlob } from "bun";

export const stripe = new Stripe(process.env.STRIPE_SECRET as string);

export type CartItem = {
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

// #region Create connected account

export const createConnectedAccount = async (payload: {
  email: string;
  ip: string | undefined;
  file: Buffer;
}) => {
  try {
    // Upload the verification document to Stripe
    let frontID = {
      id: "",
    };
    frontID = await stripe.files.create({
      file: {
        type: "application.octet-stream",
        name: `${crypto.randomUUID()}.jpg`,
        data: payload.file,
      },
      purpose: "identity_document", // Purpose for the file upload
    });

    const response = await stripe.accounts.create({
      email: payload.email,
      type: "custom",
      country: "CA", // Canada
      business_profile: {
        product_description: "Sale of motor parts",
        url: "https://namecheap.com/about",
        mcc: "5013", // https://stripe.com/guides/merchant-category-codes, https://docs.stripe.com/issuing/categories
      },
      capabilities: {
        transfers: { requested: true },
      },
      business_type: "individual",
      individual: {
        dob: {
          day: 23,
          month: 2,
          year: 2000,
        },
        address: {
          city: "Toronto",
          line1: "123 Maple Street",
          postal_code: "M5A 1A1",
          state: "ON", // Ontario
        },
        relationship: {
          title: "Seller",
        },
        email: payload.email, // Assuming payload.email is provided
        first_name: "John",
        last_name: "Doe",
        phone: "+1 416-555-1234", // Example Canadian phone number
        id_number: "123456789", // Example of a Canadian driver's license number or SIN
        verification: {
          document: {
            front: frontID.id,
            // back: backID.id,
          },
          additional_document: {
            front: frontID.id,
            // back: backID.id,
          },
        },
      },
      external_account: {
        object: "bank_account",
        country: "CA",
        currency: "CAD",
        account_holder_name: `John Doe`,
        account_holder_type: "individual",
        routing_number: "11000-000", // https://docs.stripe.com/connect/testing#account-numbers
        // routing_number: "21323-003", // Example fake routing number
        account_number: "000123456789", // Example account number
        // account_number: "9487249838323", // Fake account number
      },
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: payload.ip,
      },
    });

    await db
      .update(usersTable)
      .set({
        stripeConnectedAccount: response.id,
      })
      .where(eq(usersTable.email, payload.email));

    return response;
  } catch (error: any) {
    if (error.type && error.type === "StripeInvalidRequestError") {
      throw new BadRequestException(error.message.split(".")[0]); // Getting the first sentence rips off the stripe content.
    }
    throw error;
  }
};

// #endregion

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

  await db
    .update(paymentIntentsTable)
    .set({
      status: "done",
    })
    .where(eq(paymentIntentsTable.id, intentRecord.id));
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

export const withdrawToConnectedAccount = async (payload: {stripeConnectId: string, amount: number}) => {
  const transfer = await stripe.transfers.create({
    amount: payload.amount,
    currency: 'cad',
    destination: payload.stripeConnectId,
  });

  return transfer;
}