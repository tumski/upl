import { router, publicProcedure, protectedProcedure } from "@/server/trpc";
import { db } from "@/server/db";
import { magicLinks, customers } from "@/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { sendCustomerEmail } from "@/utils/notifications";
import { sessionSchema } from "@/server/session";

// Constants
const MAGIC_LINK_EXPIRY = 15 * 60 * 1000; // 15 minutes

// Input validation schemas
const createMagicLinkSchema = z.object({
  email: z.string().email(),
});

const verifyMagicLinkSchema = z.object({
  token: z.string(),
});

export const authRouter = router({
  // Get current session data
  getSession: publicProcedure
    .query(({ ctx }) => {
      console.log('Session in getSession:', ctx.session);
      return sessionSchema.parse(ctx.session);
    }),

  // Logout endpoint
  logout: publicProcedure
    .mutation(async ({ ctx }) => {
      ctx.session.destroy();
      return { success: true };
    }),

  // Create magic link for email authentication
  createMagicLink: publicProcedure
    .input(createMagicLinkSchema)
    .mutation(async ({ ctx, input }) => {
      const token = nanoid(32);
      const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY);

      await db.insert(magicLinks).values({
        email: input.email,
        token,
        expiresAt,
      });

      // Use the locale from context, defaulting to 'en' if not set
      const locale = ctx.locale || 'en';
      const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/login/verify/${token}`;
      
      await sendCustomerEmail({
        to: input.email,
        subject: "Your login link for Upscale Print Labs",
        text: `Click this link to log in to your account: ${magicLinkUrl}\n\nThis link will expire in 15 minutes.`,
        html: `
          <p>Click this link to log in to your account:</p>
          <p><a href="${magicLinkUrl}">${magicLinkUrl}</a></p>
          <p>This link will expire in 15 minutes.</p>
        `,
      });

      return { success: true };
    }),

  // Verify magic link token
  verifyMagicLink: publicProcedure
    .input(verifyMagicLinkSchema)
    .mutation(async ({ ctx, input }) => {
      console.log('Session before verification:', ctx.session);
      
      const link = await db.query.magicLinks.findFirst({
        where: eq(magicLinks.token, input.token),
      });

      if (!link) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired login link",
        });
      }

      if (link.usedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This login link has already been used",
        });
      }

      if (new Date() > link.expiresAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This login link has expired",
        });
      }

      // Mark the link as used
      await db
        .update(magicLinks)
        .set({ usedAt: new Date() })
        .where(eq(magicLinks.token, input.token));

      // Get or create customer
      let customer = await db.query.customers.findFirst({
        where: eq(customers.email, link.email),
      });

      if (!customer) {
        const [newCustomer] = await db.insert(customers)
          .values({
            email: link.email,
            stripeCustomerId: `temp_${nanoid()}`, // Temporary ID until Stripe customer is created
          })
          .returning();
        customer = newCustomer;
      }

      // Set session data
      ctx.session.user = {
        email: link.email,
        id: customer.id,
      };
      await ctx.session.save();

      console.log('Session after verification:', ctx.session);

      return { success: true };
    }),
});
