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
[ ] display small image thumbnail when image was selected
[ ] make sure Upload component allows upload of single image, jpg, png, tiff only, file size limit 25mb.
[ ] show spinner when file is uploading and green checkmark over the thumbnail when uploaded
[ ] show red X if upload was unsuccessful and allow another choice.
[ ] create endpoint that handles the file, puts in on Vercel Blob
[ ] endpoint also validates file type and size before handling and returns Blob url if successful
[ ] Blob url is preserved in LocalStorage in session data, its added to a list so all images uploaded by user are remembered
[ ] when front end receives the image url it redirects to /format

## PHASE 3 - CHOOSING PRINT FORMAT

[ ] user lands on /format with a thumbanil of the uploaded image taken from LocalStorage
[ ] below the image there is a select where user can choose size of the print from predefined list
[ ] changing the selection changes the size of the thumbnail
[ ] below the select user can choose matte/glossy paper (matte by default)
[ ] below the texture selection user chan change the color of the frame (include also "no frame" option)
[ ] changing the frame selection changes the border around the thumbnail
[ ] all choices are preserved in LocalStorage in session data
[ ] below the form there is a Order CTA that redirects to /order
