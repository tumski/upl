# Project Implementation Progress Guide

This guide outlines a step-by-step process for setting up and implementing the project from initial scaffolding to the final user journey. It includes checkpoints, recommended task order, and priorities to ensure a smooth and consistent development flow.

## Key Principles:

Set up core infrastructure (TypeScript, pnpm, ESLint, Prettier) immediately.
Establish i18n and reusable components before building screens.
Integrate React Query, tRPC, and authentication early for consistent data handling.
Develop each screen individually, verifying that i18n and reusable components are in place.
Abstract all 3rd-party services behind backend APIs from the start.
Perform frequent testing and incremental integration of external APIs (Stripe, Prodigi, Topaz).

## PHASE 0 - INITIAL SETUP

[x] set up environment
[x] nextjs
[x] git repo
[x] set up typescript config, prettier and eslint

## PHASE 1 - I18N SETUP AND HOMEPAGE PLACEHOLDER

[x] set up next-intl according to documentation
[x] Proof Of Concept that i18n works by replacing default Next.js landing page with landing page with simple hero header with copy in language files
[x] review intl-react setup to allow routing with AppRouter according to documenation from intl-react-routing.txt, intl-react-react-routing-navigation.txt, intl-react-react-routing-middleware.txt
[x] include basic tailwind styling of home page
[x] include shadcn by this stage
[x] implement Header and LanguageSwitcher using shadcn components and include it in the landing page

## PHASE 2 - IMAGE UPLOAD

[x] include CTA Button on homepage that redirects user to /upload
[x] create Upload component that allows image choosing and supports drag & drop on desktop
[x] display small image thumbnail when image was selected
[x] make sure Upload component allows upload of single image, jpg, png, tiff only, file size limit 25mb.
[x] show spinner when file is uploading and green checkmark over the thumbnail when uploaded
[x] show red X if upload was unsuccessful and allow another choice.
[x] set up tRPC and make ./ping page and /pong endpoint that proves its working (endpoint returns "pong" and ./ping displays it after retreving)
[x] create /upload endpoint that handles the file, puts in on Vercel Blob, endpoint also validates file type and size before handling and returns Blob url if successful
[x] connect the tRPC endpoint in ./components/Upload.tsx
[x] Blob url is preserved in LocalStorage in session data, its added to a list so all images uploaded by user are remembered
[x] when front end receives the image url it redirects to /format

## PHASE 3 - CHOOSING PRINT FORMAT

Preparing page ./src/app/[locale]/format/page.tsx

[x] user lands on /format with a thumbanil of the uploaded image taken from LocalStorage
[x] below the image there is a select where user can choose size of the print from predefined list
[x] changing the selection changes the size of the thumbnail
[x] below the select user can choose matte/glossy paper (matte by default)
[x] below the texture selection user chan change the color of the frame (include also "no frame" option)
[x] changing the frame selection changes the border around the thumbnail
[x] all choices are preserved in LocalStorage in session data
[x] below the form there is a Order CTA that redirects to /order
[x] display price below the image and trigger the price calculation on any format change

## PHASE 3.8 - DATABASE, ORM, ORDER Endpoints

- [x] set up database with Drizzle ORM
- [x] set up tRPC endpoints for orders

## PHASE 4 - ORDER CONFIRMATION

- [x] create ./src/app/[locale]/order/page.tsx page
  - [x] create order in DB (with null customer at this point) and initial order item
  - [x] make sure to store uploaded image url of each order item in DB with item
- [x] display order details with all items on the page
- [x] allow removing items from the order, reflect in DB
- [x] allow edit: changing the size, material, and frame of the order item with format/[itemId]
- [x] allow to redirect to /upload to add more order items

## PHASE 5 - CHECKOUT

- [x] on click we create a request to backed
  - [x] create stripe checkout session
  - [x] attach stripe checkout session id to skeledon of order in db
  - [x] redirect to Stripe Checkout (hosted page)
- [x] handle error states (e.g., Stripe API down), notify admin via email
- [x] handle failed payment [locale]/order-failed page with a message and retry link, notify admin
- [x] handle successful payment [locale]/order-confirmed page with a confirmation message
- [ ] create sessionId polling endpoint that checks stripe session status and redirect to [locale]/order/[id] when order is created in DB

## PHASE 6 - POST ORDER WEBHOOKS

- [ ] implement Stripe checkout webhook listener server-side
  - [ ] create customer in DB from Stripe payload
  - [ ] create order in DB from Stripe payload, including customer uploaded image
  - [ ] send confirmation email to customer
- [ ] set up Topaz service for image upscaling
- [ ] trigger Topaz Upscaling async, separately on all order items
- [ ] set up webhook listener for Topaz to update image status when upscaling is done, download the upscaled image, save it to Vercel Blob and save the URL in DB
- [ ] handle failed upscaling with retries, notify admin
- [ ] handle failed image download with retries, notify admin
- [ ] implement Prodigi service for order fulfillment
- [ ] in topaz webhook when image is downloaded, send order to Prodigi to be printed
- [ ] handle failed Prodigi order, notify admin
- [ ] handle successful Prodigi order, change status in DB, notify customer via email
- [ ] create webhook listener for Prodigi to update order status, notify customer via email

## PHASE 7 - ORDER TRACKING

- [ ] create [locale]/login to allow user to enter e-mail and get magic link to sign in
- [ ] create [locale]/orders page to display user’s order history
- [ ] create [locale]/order/[id] page to display order details
- [ ] i18n for date formatting and status messages
- [ ] add link in header to [locale]/orders
- [ ] add "Logout" button in header to sign out
