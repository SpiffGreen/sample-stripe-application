import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import type { CartItem } from "../helpers/stripe.helper";

export const usersTable = sqliteTable("users", {
  id: integer("id").primaryKey(),
  email: text("email").unique("email").notNull(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  stripeConnectedAccount: text("stripe_account"),
});

// payment records - transactions
export const transactionsTable = sqliteTable("transactions", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  summary: text("summary").notNull(),
  amount: integer("amont").notNull(), // no decimals, use integer but at the lowest unit
  balance: integer("balance").notNull(), // no decimals, use integer but at the lowest unit
  paymentIntent: text("payment_intent"),
  status: text("status"), // 'pending', 'done'
});

// payment records - transactions
export const paymentIntentsTable = sqliteTable("payment_intents", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amont").notNull(), // no decimals, use integer but at the lowest unit
  paymentIntent: text("payment_intent"),
  status: text("status"), // 'pending', 'done'
});

// checkout records - cart
export const cartTable = sqliteTable("cart", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  products: text("products", { mode: "json" }).$type<CartItem[]>(),
  sessionId: text("stripe_cart_session"),
  status: text("status", { enum: ["pending", "done"] }).default("pending"),
});
