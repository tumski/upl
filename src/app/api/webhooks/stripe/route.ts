import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { constructWebhookEvent } from "@/utils/stripe";
import { db } from "@/server/db";
import { orders, customers } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new NextResponse("No signature", { status: 400 });
  }

  try {
    const event = constructWebhookEvent(body, signature);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          throw new Error("No orderId in session metadata");
        }

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
