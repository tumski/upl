import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { createOrder, getOrder, cancelOrder } from "@/utils/prodigi";

export const prodigiRouter = router({
  createOrder: publicProcedure
    .input(z.object({
      merchantReference: z.string().optional(),
      shippingMethod: z.string(),
      recipient: z.object({
        firstName: z.string(),
        lastName: z.string(),
        line1: z.string(),
        line2: z.string().optional(),
        postalOrZipCode: z.string(),
        countryCode: z.string(),
        townOrCity: z.string(),
        stateOrCounty: z.string(),
      }),
      items: z.array(z.object({
        sku: z.string(),
        copies: z.number().int().positive(),
        sizing: z.enum(["fillPrintArea", "fitPrintArea"]).default("fillPrintArea"),
        assets: z.array(z.object({
          url: z.string().url(),
          printArea: z.string().default("default"),
        })),
        attributes: z.record(z.string()).optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      try {
        return await createOrder(input);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to create order",
        });
      }
    }),

  getOrder: publicProcedure
    .input(z.object({
      orderId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        return await getOrder(input.orderId);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to get order",
        });
      }
    }),

  cancelOrder: publicProcedure
    .input(z.object({
      orderId: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        return await cancelOrder(input.orderId);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to cancel order",
        });
      }
    }),
});
