import { z } from 'zod';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY must be defined');
}

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const createSessionSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3), // e.g., 'EUR', 'PLN'
  locale: z.string(), // e.g., 'de', 'nl'
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  metadata: z.record(z.string()),
});

type CreateSessionRequest = z.infer<typeof createSessionSchema>;

export const paymentService = {
  async createCheckoutSession(request: CreateSessionRequest) {
    const validated = createSessionSchema.parse(request);

    try {
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: validated.currency,
              product_data: {
                name: 'AI Upscaled Print',
              },
              unit_amount: validated.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: validated.successUrl,
        cancel_url: validated.cancelUrl,
        metadata: validated.metadata,
      });

      return {
        success: true,
        sessionId: session.id,
      };
    } catch (err) {
      console.error('Payment session creation error:', err);
      return {
        success: false,
        error: 'Failed to create payment session',
      };
    }
  },
};
