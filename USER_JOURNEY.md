# Happy Flow of User Journey

1. Landing Page
   Action: User arrives on the mobile-optimized homepage.
   Element: See a localized hero header with a CTA like "Start Your Art".
   Outcome: Click the CTA to proceed to image upload.

2. Image Upload
   Action: Navigate to /upload.
   Element: Drag and drop or select image file.
   Outcome:
   Successful upload: Thumbnail preview, spinner, then green checkmark.
   Failed upload: Red X, option to retry.

3. Choosing Print Format
   Action: Proceed to /format.
   Element:
   Thumbnail of uploaded image.
   Dropdowns for size, paper texture (matte/glossy), frame color.
   Outcome:
   Selections dynamically update image preview.
   Real-time price update.
   Click "Order" CTA to confirm choices.

4. Order Confirmation
   Action: Review at /order.
   Element:
   Order summary including items selected.
   Options to add/modify items.
   Outcome: Click "Pay Now" for checkout.

5. Checkout
   Action: Redirect to Stripe Checkout.
   Element: Payment form on Stripe's hosted page.
   Outcome:
   Successful payment: Redirect to /order-confirmed.
   Receive confirmation email.

6. AI Upscaling and Fulfillment
   Action: Backend processes (invisible to user).
   Element:
   Topaz AI upscales image.
   Prodigi handles printing and shipping.
   Outcome: User receives confirmation and tracking emails.

7. Order Tracking
   Action: Access /orders.
   Element: List of orders with status updates.
   Outcome: User can view the status of their order.

User Flow for Returning User Checking Order Status

1. Landing Page
   Action: User arrives back at the homepage.
   Element: Navigation to "My Orders" or similar in the header.
   Outcome: Click on "My Orders" to proceed.

2. Login
   Action: Navigate to /login.
   Element: Email input for magic link.
   Outcome: Receive and click the magic link to authenticate.

3. Authentication
   Action: Click the received magic link.
   Element: Automatic login process.
   Outcome: User is logged in and redirected.

4. Orders List
   Action: Arrive at /orders.
   Element:
   List of all user's orders.
   Basic info like date, items, status.
   Outcome: User selects an order for details.

5. Order Details
   Action: Click on a specific order to go to /order/[id].
   Element:
   Detailed order information.
   Current status, shipping details, estimated delivery.
   Outcome: User views comprehensive order status.

6. Tracking Updates
   Action: Automatic updates (no user action required).
   Element:
   Real-time or near real-time status updates.
   Email notifications for status changes.
   Outcome: User gets updated on order progress without needing to manually check back.
