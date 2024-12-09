Docs[Getting started](/docs/getting-started "Getting started")[App Router](/docs/getting-started/app-router "App Router")With i18n routing

App Router setup with i18n routing
==================================

In order to use unique pathnames for every language that your app supports, `next-intl` can be used to handle the following routing setups:

1.  Prefix-based routing (e.g. `/en/about`)
2.  Domain-based routing (e.g. `en.example.com/about`)

In either case, `next-intl` integrates with the App Router by using a top-level `[locale]` [dynamic segment](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes) that can be used to provide content in different languages.

Getting started[](#getting-started)
-----------------------------------

If you haven’t done so already, [create a Next.js app](https://nextjs.org/docs/getting-started/installation) that uses the App Router and run:

    npm install next-intl

Now, we’re going to create the following file structure:

    ├── messages
    │   ├── en.json (1)
    │   └── ...
    ├── next.config.mjs (2)
    └── src
        ├── i18n
        │   ├── routing.ts (3)
        │   └── request.ts (5)
        ├── middleware.ts (4)
        └── app
            └── [locale]
                ├── layout.tsx (6)
                └── page.tsx (7)

In case you’re migrating an existing app to `next-intl`, you’ll typically move your existing pages into the `[locale]` folder as part of the setup.

**Let’s set up the files:**

### `messages/en.json`[](#messages)

Messages represent the translations that are available per language and can be provided either locally or loaded from a remote data source.

The simplest option is to add JSON files in your local project folder:

messages/en.json

    {
      "HomePage": {
        "title": "Hello world!",
        "about": "Go to the about page"
      }
    }

### `next.config.mjs`[](#next-config)

Now, set up the plugin which creates an alias to provide a request-specific i18n configuration to Server Components—more on this in the following steps.

next.config.mjsnext.config.js

next.config.mjs

    import createNextIntlPlugin from 'next-intl/plugin';
     
    const withNextIntl = createNextIntlPlugin();
     
    /** @type {import('next').NextConfig} */
    const nextConfig = {};
     
    export default withNextIntl(nextConfig);

next.config.js

    const createNextIntlPlugin = require('next-intl/plugin');
     
    const withNextIntl = createNextIntlPlugin();
     
    /** @type {import('next').NextConfig} */
    const nextConfig = {};
     
    module.exports = withNextIntl(nextConfig);

### `src/i18n/routing.ts`[](#i18n-routing)

We’ll integrate with Next.js’ routing in two places:

1.  **Middleware**: Negotiates the locale and handles redirects & rewrites (e.g. `/` → `/en`)
2.  **Navigation APIs**: Lightweight wrappers around Next.js’ navigation APIs like `<Link />`

This enables you to work with pathnames like `/about`, while i18n aspects like language prefixes are handled behind the scenes.

To share the configuration between these two places, we’ll set up `routing.ts`:

src/i18n/routing.ts

    import {defineRouting} from 'next-intl/routing';
    import {createNavigation} from 'next-intl/navigation';
     
    export const routing = defineRouting({
      // A list of all locales that are supported
      locales: ['en', 'de'],
     
      // Used when no locale matches
      defaultLocale: 'en'
    });
     
    // Lightweight wrappers around Next.js' navigation APIs
    // that will consider the routing configuration
    export const {Link, redirect, usePathname, useRouter, getPathname} =
      createNavigation(routing);

Depending on your requirements, you may wish to customize your routing configuration later—but let’s finish with the setup first.

### `src/middleware.ts`[](#middleware)

Once we have our routing configuration in place, we can use it to set up the middleware.

src/middleware.ts

    import createMiddleware from 'next-intl/middleware';
    import {routing} from './i18n/routing';
     
    export default createMiddleware(routing);
     
    export const config = {
      // Match only internationalized pathnames
      matcher: ['/', '/(de|en)/:path*']
    };

### `src/i18n/request.ts`[](#i18n-request)

When using features from `next-intl` in Server Components, the relevant configuration is read from a central module that is located at `i18n/request.ts` by convention. This configuration is scoped to the current request and can be used to provide messages and other options based on the user’s locale.

src/i18n/request.ts

    import {getRequestConfig} from 'next-intl/server';
    import {routing} from './routing';
     
    export default getRequestConfig(async ({requestLocale}) => {
      // This typically corresponds to the `[locale]` segment
      let locale = await requestLocale;
     
      // Ensure that a valid locale is used
      if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
      }
     
      return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
      };
    });

[](#i18n-request-path)Can I move this file somewhere else?

This file is supported out-of-the-box as `./i18n/request.ts` both in the `src` folder as well as in the project root with the extensions `.ts`, `.tsx`, `.js` and `.jsx`.

If you prefer to move this file somewhere else, you can optionally provide a path to the plugin:

next.config.mjs

    const withNextIntl = createNextIntlPlugin(
      // Specify a custom path here
      './somewhere/else/request.ts'
    );

### `src/app/[locale]/layout.tsx`[](#layout)

The `locale` that was matched by the middleware is available via the `locale` param and can be used to configure the document language. Additionally, we can use this place to pass configuration from `i18n/request.ts` to Client Components via `NextIntlClientProvider`.

app/\[locale\]/layout.tsx

    import {NextIntlClientProvider} from 'next-intl';
    import {getMessages} from 'next-intl/server';
    import {notFound} from 'next/navigation';
    import {routing} from '@/i18n/routing';
     
    export default async function LocaleLayout({
      children,
      params: {locale}
    }: {
      children: React.ReactNode;
      params: {locale: string};
    }) {
      // Ensure that the incoming `locale` is valid
      if (!routing.locales.includes(locale as any)) {
        notFound();
      }
     
      // Providing all messages to the client
      // side is the easiest way to get started
      const messages = await getMessages();
     
      return (
        <html lang={locale}>
          <body>
            <NextIntlClientProvider messages={messages}>
              {children}
            </NextIntlClientProvider>
          </body>
        </html>
      );
    }

Note that `NextIntlClientProvider` automatically inherits configuration from `i18n/request.ts` here, but `messages` need to be passed explicitly.

### `src/app/[locale]/page.tsx`[](#page)

And that’s it!

Now you can use translations and other functionality from `next-intl` in your components:

app/\[locale\]/page.tsx

    import {useTranslations} from 'next-intl';
    import {Link} from '@/i18n/routing';
     
    export default function HomePage() {
      const t = useTranslations('HomePage');
      return (
        <div>
          <h1>{t('title')}</h1>
          <Link href="/about">{t('about')}</Link>
        </div>
      );
    }

In case you ran into an issue, have a look at [the App Router example](/examples#app-router) to explore a working app.

💡

**Next steps:**

*   [Usage guide](/docs/usage): Learn how to format messages, dates and times
    
*   [Routing](/docs/routing): Set up localized pathnames, domain-based routing & more
    
*   [Workflows](/docs/workflows): Integrate deeply with TypeScript and other tools
    

Static rendering[](#static-rendering)
-------------------------------------

When using the setup with i18n routing, `next-intl` will currently opt into dynamic rendering when APIs like `useTranslations` are used in Server Components. This is a limitation that we aim to remove in the future, but as a stopgap solution, `next-intl` provides a temporary API that can be used to enable static rendering.

### Add `generateStaticParams`[](#add-generatestaticparams)

Since we are using a dynamic route segment for the `[locale]` param, we need to pass all possible values to Next.js via [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) so that the routes can be rendered at build time.

Depending on your needs, you can add `generateStaticParams` either to a layout or pages:

1.  **Layout**: Enables static rendering for all pages within this layout (e.g. `app/[locale]/layout.tsx`)
2.  **Individual pages**: Enables static rendering for a specific page (e.g. `app/[locale]/page.tsx`)

**Example:**

    import {routing} from '@/i18n/routing';
     
    export function generateStaticParams() {
      return routing.locales.map((locale) => ({locale}));
    }

### Add `setRequestLocale` to all relevant layouts and pages[](#add-setrequestlocale-to-all-relevant-layouts-and-pages)

`next-intl` provides an API that can be used to distribute the locale that is received via `params` in layouts and pages for usage in all Server Components that are rendered as part of the request.

app/\[locale\]/layout.tsx

    import {setRequestLocale} from 'next-intl/server';
    import {notFound} from 'next/navigation';
    import {routing} from '@/i18n/routing';
     
    export default async function LocaleLayout({children, params: {locale}}) {
      // Ensure that the incoming `locale` is valid
      if (!routing.locales.includes(locale as any)) {
        notFound();
      }
     
      // Enable static rendering
      setRequestLocale(locale);
     
      return (
        // ...
      );
    }

app/\[locale\]/page.tsx

    import {setRequestLocale} from 'next-intl/server';
     
    export default function IndexPage({params: {locale}}) {
      // Enable static rendering
      setRequestLocale(locale);
     
      // Once the request locale is set, you
      // can call hooks from `next-intl`
      const t = useTranslations('IndexPage');
     
      return (
        // ...
      );
    }

**Keep in mind that:**

1.  The locale that you pass to `setRequestLocale` should be validated (e.g. in your [root layout](#layout)).
2.  You need to call this function in every page and every layout that you intend to enable static rendering for since Next.js can render layouts and pages independently.
3.  `setRequestLocale` needs to be called before you invoke any functions from `next-intl` like `useTranslations` or `getMessages`.

[](#setrequestlocale-implementation)How does setRequestLocale work?

`next-intl` uses [`cache()`](https://react.dev/reference/react/cache) to create a mutable store that holds the current locale. By calling `setRequestLocale`, the current locale will be written to the store, making it available to all APIs that require the locale.

Note that the store is scoped to a request and therefore doesn’t affect other requests that might be handled in parallel while a given request resolves asynchronously.

[](#setrequestlocale-background)Why is this API necessary?

Next.js currently doesn’t provide an API to read route params like `locale` at arbitrary places in Server Components (see [`vercel/next.js`#58862](https://github.com/vercel/next.js/discussions/58862)). The `locale` is fundamental to all APIs provided by `next-intl`, therefore passing this as a prop throughout the tree doesn’t stand out as particularly ergonomic.

Due to this, `next-intl` uses its middleware to attach an `x-next-intl-locale` header to the incoming request, holding the negotiated locale as a value. This technique allows the locale to be read at arbitrary places via `headers().get('x-next-intl-locale')`.

However, the usage of `headers` opts the route into dynamic rendering.

By using `setRequestLocale`, you can provide the locale that is received in layouts and pages via `params` to `next-intl`. All APIs from `next-intl` can now read from this value instead of the header, enabling static rendering.

### Use the `locale` param in metadata[](#use-the-locale-param-in-metadata)

In addition to the rendering of your pages, also page metadata needs to qualify for static rendering.

To achieve this, you can forward the `locale` that you receive from Next.js via `params` to [the awaitable functions from `next-intl`](/docs/environments/server-client-components#async-components).

page.tsx

    import {getTranslations} from 'next-intl/server';
     
    export async function generateMetadata({params: {locale}}) {
      const t = await getTranslations({locale, namespace: 'Metadata'});
     
      return {
        title: t('title')
      };
    }

Last updated on November 18, 2024

[App Router](/docs/getting-started/app-router "App Router")[Without i18n routing](/docs/getting-started/app-router/without-i18n-routing "Without i18n routing")