import { z } from 'zod';

if (!process.env.PRODIGI_API_KEY) {
  throw new Error('PRODIGI_API_KEY must be defined');
}

const shippingAddressSchema = z.object({
  name: z.string(),
  address1: z.string(),
  city: z.string(),
  postcode: z.string(),
  countryCode: z.string().length(2), // ISO 2-letter country code
});

const createOrderSchema = z.object({
  imageUrl: z.string().url(),
  productType: z.string(),
  size: z.string(),
  shippingAddress: shippingAddressSchema,
});

type CreateOrderRequest = z.infer<typeof createOrderSchema>;

export const orderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

type OrderStatus = (typeof orderStatus)[keyof typeof orderStatus];

export const fulfillmentService = {
  async createOrder(request: CreateOrderRequest) {
    const validated = createOrderSchema.parse(request);

    try {
      // PLACEHOLDER: Will implement actual Prodigi order creation
      console.log('Creating fulfillment order:', validated);

      return {
        success: true,
        orderId: `PRD-${Date.now()}`,
        status: orderStatus.PENDING,
      };
    } catch (err) {
      console.error('Fulfillment order creation error:', err);
      return {
        success: false,
        error: 'Failed to create fulfillment order',
      };
    }
  },

  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    if (!orderId) throw new Error('Order ID is required');

    // PLACEHOLDER: Will implement actual status check
    return orderStatus.PROCESSING;
  },
};
