import { router, publicProcedure } from "@/server/trpc";
import { db } from "@/server/db";
import { orders, items, customers } from "@/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createCheckoutSession, stripeLineItemSchema } from "@/utils/stripe";

// Input validation schemas
const createOrderSchema = z.object({
  customerId: z.string().uuid().nullable(),
  currency: z.string().length(3).default("EUR"),
  totalAmount: z.number().int().positive(),
  shippingAddress: z.string().optional(),
});

const updateOrderSchema = z.object({
  id: z.string().uuid(),
  status: z
    .enum([
      "draft",
      "awaiting_payment",
      "payment_processing",
      "payment_failed",
      "paid",
      "upscaling",
      "upscaling_failed",
      "fulfillment_pending",
      "fulfilling",
      "completed",
      "cancelled",
      "failed",
    ])
    .optional(),
  stripeCheckoutSessionId: z.string().optional(),
  prodigiOrderId: z.string().optional(),
  trackingNumber: z.string().optional(),
  metadata: z.any().optional(),
});

const addItemSchema = z.object({
  orderId: z.string().uuid(),
  name: z.string(),
  originalImageUrl: z.string().url(),
  size: z.string(),
  format: z.string(),
  price: z.number().int().positive(),
  amount: z.number().int().positive(),
  sku: z.string(),
});

const createOrderWithItemSchema = z.object({
  currency: z.string().length(3).default("EUR"),
  totalAmount: z.number().int().positive(),
  item: z.object({
    name: z.string(),
    originalImageUrl: z.string().url(),
    size: z.string(),
    format: z.string(),
    price: z.number().int().positive(),
    amount: z.number().int().positive(),
    sku: z.string().optional(),
  }),
});

const updateItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  size: z.string(),
  format: z.string(),
  price: z.number().int().positive(),
  amount: z.number().int().positive(),
});

const addItemToOrderSchema = z.object({
  orderId: z.string().uuid(),
  item: z.object({
    name: z.string(),
    originalImageUrl: z.string().url(),
    size: z.string(),
    format: z.string(),
    price: z.number().int().positive(),
    amount: z.number().int().positive(),
    sku: z.string().optional(),
  }),
});

const deleteItemSchema = z.object({
  id: z.string().uuid(),
});

export const ordersRouter = router({
  // Create a new order
  create: publicProcedure.input(createOrderSchema).mutation(async ({ input }) => {
    const order = await db
      .insert(orders)
      .values({
        customerId: input.customerId,
        currency: input.currency,
        totalAmount: input.totalAmount,
        shippingAddress: input.shippingAddress,
        status: "draft",
      })
      .returning();
    return order[0];
  }),

  // Get order by ID
  getById: publicProcedure.input(z.string().uuid()).query(async ({ input }) => {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, input),
      with: {
        items: true,
        customer: true,
      },
    });
    return order;
  }),

  // Get orders by customer ID
  getByCustomerId: publicProcedure.input(z.string().uuid()).query(async ({ input }) => {
    const customerOrders = await db.query.orders.findMany({
      where: eq(orders.customerId, input),
      with: {
        items: true,
      },
    });
    return customerOrders;
  }),

  // Update order status and details
  update: publicProcedure.input(updateOrderSchema).mutation(async ({ input }) => {
    const { id, ...updateData } = input;
    const updatedOrder = await db
      .update(orders)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder[0];
  }),

  // Get all orders with pagination
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const { limit, offset } = input;
      const ordersList = await db.query.orders.findMany({
        limit,
        offset,
        orderBy: (orders, { desc }) => [desc(orders.createdAt)],
        with: {
          items: true,
          customer: true,
        },
      });
      return ordersList;
    }),

  // Add item to order
  addItem: publicProcedure.input(addItemSchema).mutation(async ({ input }) => {
    const item = await db
      .insert(items)
      .values({
        orderId: input.orderId,
        name: input.name,
        originalImageUrl: input.originalImageUrl,
        size: input.size,
        format: input.format,
        price: input.price,
        amount: input.amount,
        status: "pending",
        sku: input.sku,
      })
      .returning();
    return item[0];
  }),

  // Create order with item
  createWithItem: publicProcedure.input(createOrderWithItemSchema).mutation(async ({ input }) => {
    // Create order first
    const [order] = await db
      .insert(orders)
      .values({
        customerId: null, // Will be set during checkout
        currency: input.currency,
        totalAmount: input.totalAmount,
        status: "draft",
      })
      .returning();

    // Then create the item
    const [item] = await db
      .insert(items)
      .values({
        orderId: order.id,
        name: input.item.name,
        originalImageUrl: input.item.originalImageUrl,
        size: input.item.size,
        format: input.item.format,
        price: input.item.price,
        amount: input.item.amount,
        status: "pending",
        sku: input.item.sku || "",
      })
      .returning();

    return { order, item };
  }),

  // Get item by ID
  getItemById: publicProcedure.input(z.string().uuid()).query(async ({ input }) => {
    const item = await db.query.items.findFirst({
      where: eq(items.id, input),
      with: {
        order: true,
      },
    });
    return item;
  }),

  // Update item
  updateItem: publicProcedure.input(updateItemSchema).mutation(async ({ input }) => {
    const { id, ...updateData } = input;
    const [updatedItem] = await db
      .update(items)
      .set({
        ...updateData,
        price: updateData.price.toString(),
        updatedAt: new Date(),
      })
      .where(eq(items.id, id))
      .returning();
    return updatedItem;
  }),

  // Add item to existing order
  addItemToOrder: publicProcedure.input(addItemToOrderSchema).mutation(async ({ input }) => {
    // First get the order to ensure it exists
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, input.orderId),
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Then create the item
    const [item] = await db
      .insert(items)
      .values({
        orderId: order.id,
        name: input.item.name,
        originalImageUrl: input.item.originalImageUrl,
        size: input.item.size,
        format: input.item.format,
        price: input.item.price.toString(),
        amount: input.item.amount,
        status: "pending",
        sku: input.item.sku || "",
      })
      .returning();

    return item;
  }),

  // Delete item
  deleteItem: publicProcedure.input(deleteItemSchema).mutation(async ({ input }) => {
    const [deletedItem] = await db.delete(items).where(eq(items.id, input.id)).returning();
    return deletedItem;
  }),

  // Create Stripe checkout session for order
  createCheckoutSession: publicProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
        customerEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Get order with items
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
        with: {
          items: true,
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Convert order items to Stripe line items
      const lineItems = order.items.map(item => ({
        price_data: {
          currency: order.currency,
          product_data: {
            name: item.name,
            description: `${item.size} - ${item.format}`,
            images: [item.originalImageUrl],
          },
          unit_amount: parseInt(item.price, 10),
        },
        quantity: item.amount,
      }));

      // Validate line items
      lineItems.forEach(item => {
        const result = stripeLineItemSchema.safeParse(item);
        if (!result.success) {
          throw new Error(`Invalid line item: ${result.error.message}`);
        }
      });

      // Create Stripe checkout session
      const { success, session, error } = await createCheckoutSession({
        lineItems,
        successUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
        customerEmail: input.customerEmail,
        metadata: {
          orderId: order.id,
        },
      });

      if (!success || !session) {
        throw new Error(`Failed to create checkout session: ${error}`);
      }

      // Update order with Stripe session ID and status
      await db
        .update(orders)
        .set({
          stripeCheckoutSessionId: session.id,
          status: "awaiting_payment",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }),

  // Check Stripe session status
  checkSessionStatus: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const order = await db.query.orders.findFirst({
        where: eq(orders.stripeCheckoutSessionId, input.sessionId),
      });

      if (!order) {
        throw new Error("Order not found for session");
      }

      return {
        status: order.status,
        orderId: order.id,
      };
    }),
});
