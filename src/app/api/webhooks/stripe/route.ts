import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { constructWebhookEvent } from "@/utils/stripe";
import { db } from "@/server/db";
import { orders, customers, items } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { enhanceImage } from "@/utils/topaz";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new NextResponse("No signature", { status: 400 });
  }

  // console.log("Stripe webhook payload", body);

  try {
    const event = constructWebhookEvent(body, signature);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        console.log("Stripe checkout session completed", session.id);
        
        const order = await db.query.orders.findFirst({
          where: eq(orders.stripeCheckoutSessionId, session.id),
        });

        if (!order) {
          throw new Error("No orderId in session metadata");
        }
        if (order.status !== "awaiting_payment") {
          console.error("Order status is not awaiting payment", { orderId: order.id, status: order.status });
          throw new Error("Order is not awaiting payment");
        }

        const orderId = order.id;

        // console.log("Webhook processing completed for Order ID:", orderId);

        // Create or update customer
        const [customer] = await db
          .insert(customers)
          .values({
            stripeCustomerId: session.customer?.toString() || "",
            email: session.customer_details?.email || "",
          })
          .onConflictDoUpdate({
            target: customers.stripeCustomerId,
            set: {
              email: session.customer_details?.email || "",
              updatedAt: new Date(),
            },
          })
          .returning();

        // Update order with customer and payment status
        await db
          .update(orders)
          .set({
            customerId: customer.id,
            status: "paid",
            shippingAddress: JSON.stringify(session.shipping_details),
            updatedAt: new Date(),
          })
          .where(eq(orders.id, orderId));

        // Get all items for this order
        const orderItems = await db.query.items.findMany({
          where: eq(items.orderId, orderId),
        });

        // Start upscaling process for each item
        for (const item of orderItems) {
          try {
            // Start upscaling process
            const enhanceResponse = await enhanceImage({
              imageUrl: item.originalImageUrl,
              // Use default settings for high quality upscaling
              outputFormat: "jpg",
              faceEnhancement: true,
            });

            // Update item with process ID and status
            await db
              .update(items)
              .set({
                topazProcessId: enhanceResponse.process_id,
                status: "upscaling",
                updatedAt: new Date(),
              })
              .where(eq(items.id, item.id));
          } catch (error) {
            console.error(`Error starting upscaling for item ${item.id}:`, error);
            // Update item status to failed
            await db
              .update(items)
              .set({
                status: "upscaling_failed",
                updatedAt: new Date(),
              })
              .where(eq(items.id, item.id));
          }
        }

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await db
            .update(orders)
            .set({
              status: "payment_failed",
              updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId));
        }
        break;
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new NextResponse("Webhook error", { status: 400 });
  }
}

// Disable body parsing, as we need the raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
