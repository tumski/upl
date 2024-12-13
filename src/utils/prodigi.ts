import { z } from "zod";

// Environment variables validation
if (!process.env.PRODIGI_API_KEY) {
  throw new Error("PRODIGI_API_KEY must be defined in environment variables");
}

const PRODIGI_API_BASE_URL = process.env.NODE_ENV === "production" 
  ? "https://api.prodigi.com/v4.0"
  : "https://api.sandbox.prodigi.com/v4.0";

// Response schemas
const prodigiErrorSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.string(),
  }),
});

const prodigiAddressSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  postalOrZipCode: z.string(),
  countryCode: z.string(),
  townOrCity: z.string(),
  stateOrCounty: z.string(),
});

const prodigiAssetSchema = z.object({
  url: z.string().url(),
  printArea: z.string().default("default"),
});

const prodigiItemSchema = z.object({
  sku: z.string(),
  copies: z.number().int().positive(),
  sizing: z.enum(["fillPrintArea", "fitPrintArea"]).default("fillPrintArea"),
  assets: z.array(prodigiAssetSchema),
  attributes: z.record(z.string()).optional(),
});

const prodigiOrderStatusSchema = z.enum([
  "Draft",
  "Cancelled",
  "InProgress",
  "Complete",
  "Error",
]);

const prodigiShipmentStatusSchema = z.enum([
  "Processing",
  "Cancelled",
  "Shipped",
]);

const prodigiOrderResponseSchema = z.object({
  id: z.string(),
  status: prodigiOrderStatusSchema,
  created: z.string(),
  merchantReference: z.string().optional(),
  shippingMethod: z.string(),
  recipient: prodigiAddressSchema,
  items: z.array(prodigiItemSchema),
  shipments: z.array(z.object({
    id: z.string(),
    carrier: z.string(),
    status: prodigiShipmentStatusSchema,
    tracking: z.object({
      number: z.string(),
      url: z.string().url(),
    }).optional(),
  })),
});

const prodigiCreateOrderResponseSchema = z.object({
  outcome: z.string(),
  order: prodigiOrderResponseSchema,
});

const prodigiGetOrderResponseSchema = z.object({
  outcome: z.string(),
  order: prodigiOrderResponseSchema,
});

// Type definitions
export type ProdigiAddress = z.infer<typeof prodigiAddressSchema>;
export type ProdigiAsset = z.infer<typeof prodigiAssetSchema>;
export type ProdigiItem = z.infer<typeof prodigiItemSchema>;
export type ProdigiOrderResponse = z.infer<typeof prodigiOrderResponseSchema>;

export interface ProdigiCreateOrderOptions {
  merchantReference?: string;
  shippingMethod: string;
  recipient: ProdigiAddress;
  items: ProdigiItem[];
}

// Helper function to handle rate limiting with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  baseDelay = 1000
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If rate limited, wait and retry
      if (response.status === 429) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error(`Failed after ${maxRetries} attempts`);
}

// Main Prodigi API functions
export async function createOrder(
  options: ProdigiCreateOrderOptions
): Promise<ProdigiOrderResponse> {
  const response = await fetchWithRetry(
    `${PRODIGI_API_BASE_URL}/Orders`,
    {
      method: "POST",
      headers: {
        "X-API-Key": process.env.PRODIGI_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (prodigiErrorSchema.safeParse(error).success) {
      throw new Error(error.error.message);
    }
    throw new Error(`Failed to create order: ${response.statusText}`);
  }

  const data = await response.json();
  const parsed = prodigiCreateOrderResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid response format from Prodigi API");
  }

  return parsed.data.order;
}

export async function getOrder(orderId: string): Promise<ProdigiOrderResponse> {
  const response = await fetchWithRetry(
    `${PRODIGI_API_BASE_URL}/Orders/${orderId}`,
    {
      method: "GET",
      headers: {
        "X-API-Key": process.env.PRODIGI_API_KEY!,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (prodigiErrorSchema.safeParse(error).success) {
      throw new Error(error.error.message);
    }
    throw new Error(`Failed to get order: ${response.statusText}`);
  }

  const data = await response.json();
  const parsed = prodigiGetOrderResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid response format from Prodigi API");
  }

  return parsed.data.order;
}

export async function cancelOrder(orderId: string): Promise<ProdigiOrderResponse> {
  const response = await fetchWithRetry(
    `${PRODIGI_API_BASE_URL}/Orders/${orderId}/actions/cancel`,
    {
      method: "POST",
      headers: {
        "X-API-Key": process.env.PRODIGI_API_KEY!,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (prodigiErrorSchema.safeParse(error).success) {
      throw new Error(error.error.message);
    }
    throw new Error(`Failed to cancel order: ${response.statusText}`);
  }

  const data = await response.json();
  const parsed = prodigiGetOrderResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid response format from Prodigi API");
  }

  return parsed.data.order;
}
