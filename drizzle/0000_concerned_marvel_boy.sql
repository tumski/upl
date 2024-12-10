CREATE SCHEMA IF NOT EXISTS public;

CREATE TYPE "public"."item_status" AS ENUM('pending', 'upscaling', 'upscaling_failed', 'upscaling_complete');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('draft', 'awaiting_payment', 'payment_processing', 'payment_failed', 'paid', 'upscaling', 'upscaling_failed', 'fulfillment_pending', 'fulfilling', 'completed', 'cancelled', 'failed');--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(255),
	"state" varchar(255),
	"postal_code" varchar(20),
	"country" varchar(2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"sku" varchar(100) NOT NULL,
	"prodigi_sku_id" varchar(255),
	"name" varchar(255) NOT NULL,
	"original_image_url" text NOT NULL,
	"enhanced_image_url" text,
	"amount" integer DEFAULT 1 NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"size" varchar(50),
	"format" varchar(50),
	"status" "item_status" DEFAULT 'pending' NOT NULL,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"status" "order_status" DEFAULT 'draft' NOT NULL,
	"stripe_checkout_session_id" varchar(255),
	"prodigi_order_id" varchar(255),
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"shipping_address" text,
	"tracking_number" varchar(255),
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;