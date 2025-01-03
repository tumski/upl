# Project Rules and Conventions

# AI Agent Integration

## Usage of AI Agents:

LLMs may be used to generate boilerplate code, documentation, tests, and initial component logic.
Treat LLM output as a starting point; always review, refactor, and test.
Maintain human oversight to ensure LLM suggestions comply with project standards, security rules, and localization requirements.
Data & Privacy with LLMs:

Never provide real API keys, secrets, or user data to the LLM.
Use placeholder values or mocked data when requesting code generation from LLMs.
Redact any sensitive information from prompts before sending to LLMs.
Validation of LLM-Generated Code:

Run linting, formatting, and type-checking on LLM output.
Write or adjust tests to confirm LLM-generated logic behaves as intended.
Verify i18n keys and translations referenced by LLM-generated code are correct and consistent.

## Package Management

Tooling: Use pnpm for all package management tasks.
Lockfile: Always commit pnpm-lock.yaml.
Versioning: Use semantic versioning (^) for dependencies.
Dependency Updates: Regular updates through automated tools (e.g., Renovate).

## Code Style

Language: TypeScript for all files.
TypeScript Strict Mode: Enable strict mode and avoid any or unknown wherever possible.
Linting & Formatting: Use ESLint with Next.js recommended rules and Prettier formatting.
Exports & Functions: Use named exports over default exports, and arrow functions for consistency.
Documentation: Use JSDoc where needed for complex types or utility functions.
Comments: Keep comments concise and meaningful, remove stale comments promptly.

## TypeScript and Data Validation

Zod Schemas: Define Zod schemas for all data structures (e.g., request payloads, responses, database models).
Type Consistency: Match Drizzle schema types exactly in Zod schemas.
Strict Validation: Validate all incoming data before database operations and API responses.
Optionals & Nullables: Handle optional and nullable fields explicitly; avoid ambiguous types.

## Database and Models

ORM: Use Drizzle ORM for DB operations.
Modeling: Define database schema using Drizzle's schema builder and keep corresponding Zod schemas in sync.
Enums: Use Drizzle's createEnum for status and type fields for clarity and type safety.
Validation: Validate all data before insertion or updates to prevent bad data.

## Schema & Migration Management:

Migrations:

- Use drizzle-kit to generate and manage SQL migrations
- Always commit migration files to version control
- Name migrations descriptively (e.g., 'add_user_preferences_table')
- Never modify existing migrations; create new ones instead

## UI Components

Library & Styles: Use shadcn and Tailwind CSS.
Mobile-First: Start all designs from mobile view, ensure tap-friendly targets, and test on mobile devices first.
Atomic Components: Keep components small, focused, and reusable.
Styling Conventions: Follow shadcn’s styling conventions and Tailwind best practices.
Accessibility: Ensure accessible components (proper ARIA attributes, keyboard navigation).

## Responsive Design

Priority: Mobile-first. Start with layouts for ~375px width.
Units & Layout: Use relative units (rem, em), ensure readable font sizes (min 16px).
Media Queries: Add breakpoints only when necessary.
Touch-Friendly: All clickable elements must be large enough and easily tappable.
Performance: Optimize images and code for mobile network conditions.

## Project Structure

Organization: Follow directories as outlined in PRD (e.g., src/components, src/pages, src/server).
Atomic Files: Keep files small and focused; use index files (barrel exports) for cleaner imports.
Types & Schemas: Store shared types, Zod schemas, and validations in utils/validation.
Separation of Concerns: Keep frontend and backend logic separate. The frontend should never directly call external 3rd-party APIs; it should always go through server endpoints.

## State Management

React Query: Use React Query for server state management and caching.
Error Handling & Retries: Implement proper error handling and retry logic, especially for flaky network conditions common on mobile.
Optimistic Updates: Use optimistic updates for a better mobile user experience.

## Internationalization (i18n)

All Text Externalized: Never hardcode user-facing text in components.
Library: Use next-intl for translations and locale detection.
Structure: Place all translations in messages/{locale}.json files.
Consistency: Keep translation keys consistent across locales.
Keys & Namespacing: Use semantic keys (e.g., "home.hero.title") for clarity.
Testing: Test locale switching and fallback behavior in development.

## API and Backend

tRPC: Use tRPC for type-safe API endpoints.
Abstraction Layer: Never expose 3rd-party APIs (Topaz, Prodigi) directly to the frontend. All 3rd-party calls occur in backend routes.
Validation: Validate all inputs/outputs with Zod.
Error Handling: Implement clear error responses and handle them gracefully in the frontend.
Security: Use proper input sanitization, rate limiting, and OWASP guidelines.

## Working with Existing Infrastructure

Database Schema:

- Adhere to the existing schema defined in `schema.ts`
- Do not modify schema unless explicitly required and confirmed
- When adding new features, first attempt to utilize existing tables and relationships
- Any schema changes must be thoroughly documented and reviewed

API Endpoints:

- Leverage existing tRPC endpoints defined in `_app.ts` before creating new ones
- Follow established patterns when creating new endpoints
- Reuse existing router structures and middleware where applicable
- Maintain consistency with existing error handling patterns

Database Connection:

- Use the established database connection from `db/index.ts`
- Maintain the existing Drizzle ORM setup and configuration
- Follow existing patterns for database queries and transactions
- Ensure proper error handling and connection management

Frontend Integration:

- Use the existing tRPC client setup from `utils/trpc.ts`
- Leverage React Query patterns already established
- Maintain consistent data fetching and caching strategies
- Follow existing patterns for error handling and loading states

## Environment Variables

Documentation: Use .env.example to document required vars.
Naming: Prefix public environment variables with NEXT*PUBLIC*.

## Performance

Image Optimization: Use Next.js image optimization for all images.
Code Splitting: Apply code splitting and lazy loading where beneficial.
Caching: Leverage React Query caching and caching headers on the backend.
Monitoring: Keep an eye on bundle size and use analytics to monitor performance.

## Security

Input Validation: Validate and sanitize all user inputs with Zod and server-side logic.
No Direct Third-Party Exposure: Keep 3rd-party keys and API endpoints confidential in server-side code only.

IMPORTANT NOTES

- when dealing with shadcn, use the following in commands: shadcn@latest instead of shadcn-ui@latest
- before starting any development regarding i18n, ensure to be updated on Next Internationalization Documentation
- when using tRPC keep in mind that its newest version does not support react-query v5, react-query needs to be keps at v4
