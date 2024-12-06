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

## PHASE 1 - I18N SETUP

[ ] set up next-intl according to documentation
[ ] Proof Of Concept that i18n works by replacing default Next.js landing page with landing page with simple hero header with copy inlanguage files
[ ] incude basic tailwind styling
[ ] include shadcn by this stage
[ ] only if POC was successful, implement Header and LanguageSwitcher compoennts and include it in the landing page
