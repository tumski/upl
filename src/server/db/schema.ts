import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  integer,
  decimal,
  pgEnum,
  json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enum for order status
export const orderStatus = pgEnum("order_status", [
  "draft", // Pre-payment, temporary order
  "awaiting_payment", // Stripe session created
  "payment_processing", // During payment
  "payment_failed", // Payment specifically failed
  "paid", // Payment successful
  "upscaling", // Topaz processing
  "upscaling_failed", // Topaz processing failed
  "fulfillment_pending", // Ready to send to Prodigi
  "fulfilling", // Prodigi processing
  "completed", // Delivered
  "cancelled", // Cancelled/Refunded
  "failed", // Other system failures
]);

// Enum for item status
export const itemStatus = pgEnum("item_status", [
  "pending",
  "upscaling",
  "upscaling_failed",
  "upscaling_complete",
]);

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  addressLine1: varchar("address_line1", { length: 255 }),
  addressLine2: varchar("address_line2", { length: 255 }),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 255 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Customers relations
export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  status: orderStatus("status").notNull().default("draft"),
  stripeCheckoutSessionId: varchar("stripe_checkout_session_id", { length: 255 }),
  prodigiOrderId: varchar("prodigi_order_id", { length: 255 }),
  totalAmount: integer("total_amount").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  shippingAddress: text("shipping_address"),
  trackingNumber: varchar("tracking_number", { length: 255 }),
  metadata: json("metadata"), // Store webhook responses
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Orders relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(items),
}));

// Items table
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  sku: varchar("sku", { length: 100 }).notNull(),
  prodigiSkuId: varchar("prodigi_sku_id", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  originalImageUrl: text("original_image_url").notNull(),
  enhancedImageUrl: text("enhanced_image_url"),
  amount: integer("amount").notNull().default(1),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  size: varchar("size", { length: 50 }),
  format: varchar("format", { length: 50 }),
  status: itemStatus("status").notNull().default("pending"),
  metadata: json("metadata"), // Store upscaling results
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Items relations
export const itemsRelations = relations(items, ({ one }) => ({
  order: one(orders, {
    fields: [items.orderId],
    references: [orders.id],
  }),
}));
