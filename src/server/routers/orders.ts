import { router, publicProcedure } from "@/server/trpc";
import { db } from "@/server/db";
import { orders, items, customers } from "@/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

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

    // Create the item
    const [item] = await db
      .insert(items)
      .values({
        orderId: input.orderId,
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

    return { order, item };
  }),

  // Delete item
  deleteItem: publicProcedure.input(deleteItemSchema).mutation(async ({ input }) => {
    const [deletedItem] = await db.delete(items).where(eq(items.id, input.id)).returning();
    return deletedItem;
  }),
});
