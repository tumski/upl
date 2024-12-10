import Stripe from "stripe";
import { z } from "zod";

// Ensure STRIPE_SECRET_KEY is set
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY must be defined in environment variables");
}

// Initialize Stripe with TypeScript support
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia", // Latest API version
  typescript: true,
});

// Validation schema for line items
export const stripeLineItemSchema = z.object({
  price_data: z.object({
    currency: z.string().length(3),
    product_data: z.object({
      name: z.string(),
      description: z.string().optional(),
      images: z.array(z.string().url()).optional(),
    }),
    unit_amount: z.number().int().positive(),
  }),
  quantity: z.number().int().positive(),
});

export type StripeLineItem = z.infer<typeof stripeLineItemSchema>;

// Helper function to create Stripe checkout session
export async function createCheckoutSession(params: {
  lineItems: StripeLineItem[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: params.lineItems,
      mode: "payment",
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
      metadata: params.metadata,
      shipping_address_collection: {
        allowed_countries: ["DE", "NL", "DK", "PL"], // As per PRD target markets
      },
    });

    return { success: true, session };
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    return { success: false, error };
  }
}

// Helper function to verify Stripe webhook signatures
export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET must be defined in environment variables");
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    throw error;
  }
}
