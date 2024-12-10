import { router, publicProcedure } from "@/server/trpc";
import { db } from "@/server/db";
import { orders, items, customers } from "@/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

// Input validation schemas
const createOrderSchema = z.object({
  customerId: z.number(),
  currency: z.string().length(3).default("EUR"),
  totalAmount: z.number().int().positive(),
  shippingAddress: z.string().optional(),
});

const updateOrderSchema = z.object({
  id: z.number(),
  status: z.enum([
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
  ]).optional(),
  stripeCheckoutSessionId: z.string().optional(),
  prodigiOrderId: z.string().optional(),
  trackingNumber: z.string().optional(),
  metadata: z.any().optional(),
});

export const ordersRouter = router({
  // Create a new order
  create: publicProcedure
    .input(createOrderSchema)
    .mutation(async ({ input }) => {
      const order = await db.insert(orders)
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
  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
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
  getByCustomerId: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const customerOrders = await db.query.orders.findMany({
        where: eq(orders.customerId, input),
        with: {
          items: true,
        },
      });
      return customerOrders;
    }),

  // Update order status and details
  update: publicProcedure
    .input(updateOrderSchema)
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      const updatedOrder = await db.update(orders)
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
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0),
    }))
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
});
