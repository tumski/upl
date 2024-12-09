[Docs](/docs/getting-started "Docs")[Routing](/docs/routing "Routing")Navigation

Navigation APIs
===============

💡

The navigation APIs are only needed when you’re using [i18n routing](/docs/getting-started/app-router).

`next-intl` provides lightweight wrappers around Next.js’ navigation APIs like [`<Link />`](https://nextjs.org/docs/app/api-reference/components/link) and [`useRouter`](https://nextjs.org/docs/app/api-reference/functions/use-router) that automatically handle the user locale and pathnames behind the scenes.

To create these APIs, you can call the `createNavigation` function with your `routing` configuration:

routing.ts

    import {createNavigation} from 'next-intl/navigation';
    import {defineRouting} from 'next-intl/routing';
     
    export const routing = defineRouting(/* ... */);
     
    export const {Link, redirect, usePathname, useRouter, getPathname} =
      createNavigation(routing);

This function is typically called in a central module like [`src/i18n/routing.ts`](/docs/getting-started/app-router/with-i18n-routing#i18n-routing) in order to provide easy access to navigation APIs in your components.

[](#locales-unknown)What if the locales aren’t known at build time?

In case you’re building an app where locales can be added and removed at runtime, `createNavigation` can be called without the `locales` argument, therefore allowing any string that is encountered at runtime to be a valid locale. In this case, you’d not use the [`defineRouting`](/docs/routing#define-routing) function.

routing.ts

    import {createNavigation} from 'next-intl/navigation';
     
    export const {Link, redirect, usePathname, useRouter, getPathname} =
      createNavigation({
        // ... potentially other routing
        // config, but no `locales` ...
      });

Note however that the `locales` argument for the middleware is still mandatory. If you need to fetch the available locales at runtime, you can provide the routing configuration for the middleware [dynamically per request](/docs/routing/middleware#composing-other-middlewares).

APIs[](#apis)
-------------

The created navigation APIs are thin wrappers around the equivalents from Next.js and mostly adhere to the same function signatures. Your routing configuration and the user’s locale are automatically incorporated.

If you’re using the [`pathnames`](/docs/routing#pathnames) setting in your routing configuration, the internal pathnames that are accepted for `href` arguments will be strictly typed and localized to the given locale.

[](#lint-consistent-usage)How can I ensure consistent usage of navigation APIs?

To avoid importing APIs like `<Link />` directly from Next.js by accident, you can consider [linting](/docs/workflows/linting#consistent-usage-of-navigation-apis) for the consistent usage of internationalized navigation APIs.

### `Link`[](#link)

This component wraps [`next/link`](https://nextjs.org/docs/app/api-reference/components/link) and localizes the pathname as necessary.

    import {Link} from '@/i18n/routing';
     
    // When the user is on `/en`, the link will point to `/en/about`
    <Link href="/about">About</Link>
     
    // Search params can be added via `query`
    <Link href={{pathname: "/users", query: {sortBy: 'name'}}}>Users</Link>
     
    // You can override the `locale` to switch to another language
    // (this will set the `hreflang` attribute on the anchor tag)
    <Link href="/" locale="de">Switch to German</Link>

Depending on if you’re using the [`pathnames`](/docs/routing#pathnames) setting, dynamic params can either be passed as:

    // 1. A final string (when not using `pathnames`)
    <Link href="/users/12">Susan</Link>
     
    // 2. An object (when using `pathnames`)
    <Link href={{
      pathname: '/users/[userId]',
      params: {userId: '5'}
    }}>
      Susan
    </Link>

[](#link-active)How can I render a navigation link?

The [`useSelectedLayoutSegment` hook](https://nextjs.org/docs/app/api-reference/functions/use-selected-layout-segment) from Next.js allows you to detect if a given child segment is active from within the parent layout. Since this returns an internal pathname, it can be matched against an `href` that you can pass to `Link`.

NavigationLink.tsx

    'use client';
     
    import {useSelectedLayoutSegment} from 'next/navigation';
    import {ComponentProps} from 'react';
    import {Link} from '@/i18n/routing';
     
    export default function NavigationLink({
      href,
      ...rest
    }: ComponentProps<typeof Link>) {
      const selectedLayoutSegment = useSelectedLayoutSegment();
      const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : '/';
      const isActive = pathname === href;
     
      return (
        <Link
          aria-current={isActive ? 'page' : undefined}
          href={href}
          style={{fontWeight: isActive ? 'bold' : 'normal'}}
          {...rest}
        />
      );
    }

    <nav>
      <NavigationLink href="/">{t('home')}</NavigationLink>
      <NavigationLink href="/about">{t('about')}</NavigationLink>
      <NavigationLink href="/blog">{t('blog')}</NavigationLink>
    </nav>

See also the Next.js docs on [creating an active link component](https://nextjs.org/docs/app/api-reference/functions/use-selected-layout-segment#creating-an-active-link-component).

[](#link-composition)How can I compose the link with its href prop?

If you need to create a component that receives an `href` prop that is forwarded to `Link` internally, you can compose the props from `Link` with the `ComponentProps` type:

StyledLink.tsx

    import {ComponentProps} from 'react';
    import {Link} from '@/i18n/routing';
     
    type Props = ComponentProps<typeof Link> & {
      color: 'blue' | 'red';
    };
     
    export default function StyledLink({color, href, ...rest}: Props) {
      return <Link href={href} style={{color}} {...rest} />;
    }

In case you’re using the [`pathnames`](/docs/routing#pathnames) setting, the `href` prop of the wrapping component will now be strictly typed based on your routing configuration.

[](#link-unknown-routes)How can I link to unknown routes when using the `pathnames` setting?

In this case, the navigation APIs are strictly typed and only allow routes specified in the `pathnames` config. If you need to link to unknown routes in certain places, you can disable the type checking on a case-by-case basis:

    // @ts-expect-error
    <Link href="/unknown">...</Link>

Unknown routes will be passed through as-is, but will receive relevant locale prefixes in case of absolute pathnames.

[](#link-prefetching)How does prefetching of localized links work?

Just like `next/link`, by default all links are prefetched. The one exception to this is that links to other locales aren’t prefetched, because this may result in prematurely overwriting the locale cookie.

### `useRouter`[](#userouter)

If you need to navigate programmatically, e.g. in an event handler, `next-intl` provides a convience API that wraps [`useRouter` from Next.js](https://nextjs.org/docs/app/api-reference/functions/use-router) and localizes the pathname accordingly.

    'use client';
     
    import {useRouter} from '@/i18n/routing';
     
    const router = useRouter();
     
    // When the user is on `/en`, the router will navigate to `/en/about`
    router.push('/about');
     
    // Search params can be added via `query`
    router.push({
      pathname: '/users',
      query: {sortBy: 'name'}
    });
     
    // You can override the `locale` to switch to another language
    router.replace('/about', {locale: 'de'});

Depending on if you’re using the [`pathnames`](/docs/routing#pathnames) setting, dynamic params can either be passed as:

    // 1. A final string (when not using `pathnames`)
    router.push('/users/12');
     
    // 2. An object (when using `pathnames`)
    router.push({
      pathname: '/users/[userId]',
      params: {userId: '5'}
    });

[](#userouter-change-locale)How can I change the locale for the current page?

By combining [`usePathname`](#usepathname) with [`useRouter`](#userouter), you can change the locale for the current page programmatically by navigating to the same pathname, while overriding the `locale`.

Depending on if you’re using the [`pathnames`](/docs/routing#pathnames) setting, you optionally have to forward `params` to potentially resolve an internal pathname.

    'use client';
     
    import {usePathname, useRouter} from '@/i18n/routing';
    import {useParams} from 'next/navigation';
     
    const pathname = usePathname();
    const router = useRouter();
     
    // Without `pathnames`: Pass the current `pathname`
    router.replace(pathname, {locale: 'de'});
     
    // With `pathnames`: Pass `params` as well
    const params = useParams();
    router.replace(
      // @ts-expect-error -- TypeScript will validate that only known `params`
      // are used in combination with a given `pathname`. Since the two will
      // always match for the current route, we can skip runtime checks.
      {pathname, params},
      {locale: 'de'}
    );

### `usePathname`[](#usepathname)

To retrieve the current pathname without a potential locale prefix, you can call `usePathname`.

    'use client';
     
    import {usePathname} from '@/i18n/routing';
     
    // When the user is on `/en`, this will be `/`
    const pathname = usePathname();

Note that if you’re using the [`pathnames`](/docs/routing#pathnames) setting, the returned pathname will correspond to an internal pathname template (dynamic params will not be replaced by their values).

    // When the user is on `/de/ueber-uns`, this will be `/about`
    const pathname = usePathname();
     
    // When the user is on `/de/neuigkeiten/produktneuheit-94812`,
    // this will be `/news/[articleSlug]-[articleId]`
    const pathname = usePathname();

### `redirect`[](#redirect)

If you want to interrupt the render and redirect to another page, you can invoke the `redirect` function. This wraps [the `redirect` function from Next.js](https://nextjs.org/docs/app/api-reference/functions/redirect) and localizes the pathname as necessary.

Note that a `locale` prop is always required, even if you’re just passing [the current locale](/docs/usage/configuration#locale).

    import {redirect} from '@/i18n/routing';
     
    // Redirects to `/en/login`
    redirect({href: '/login', locale: 'en'});
     
    // Search params can be added via `query`
    redirect({href: '/users', query: {sortBy: 'name'}, locale: 'en'});

Depending on if you’re using the pathnames setting, dynamic params can either be passed as:

    // 1. A final string (when not using `pathnames`)
    redirect({href: '/users/12', locale: 'en'});
     
    // 2. An object (when using `pathnames`)
    redirect({
      href: {
        pathname: '/users/[userId]',
        params: {userId: '5'}
      },
      locale: 'en'
    });

💡

[`permanentRedirect`](https://nextjs.org/docs/app/api-reference/functions/permanentRedirect) is supported too.

[](#redirect-typescript-narrowing)Why does TypeScript not narrow types correctly after calling `redirect`?

TypeScript currently has a [limitation](https://github.com/amannn/next-intl/issues/823#issuecomment-2421891151) with control flow analysis, which results in not being able to narrow types correctly after calling `redirect` as well as detecting unreachable code:

    import {routing} from '@/i18n/routing';
     
    function UserProfile({userId}: {userId?: string}) {
      if (!userId) {
        redirect({href: '/login', locale: 'en'});
      }
     
      // `userId` should be narrowed to `string` here,
      // but TypeScript doesn't analyze this correctly
    }

To work around this limitation, you can add an explicit type annotation to the `redirect` function:

routing.ts

    const {/* ..., */ redirect: _redirect} = createNavigation(routing);
     
    // Enable type narrowing after calling `redirect`
    export const redirect: typeof _redirect = _redirect;

### `getPathname`[](#getpathname)

If you need to construct a particular pathname based on a locale, you can call the `getPathname` function. This can for example be useful to retrieve a [canonical link](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#alternates) for a page that accepts search params.

    import {getPathname} from '@/i18n/routing';
     
    // Will return `/en/about`
    const pathname = getPathname({
      locale: 'en',
      href: '/about'
    });
     
    // Search params can be added via `query`
    const pathname = getPathname({
      locale: 'en',
      href: {
        pathname: '/users',
        params: {sortBy: 'name'}
      }
    });

Depending on if you’re using the [`pathnames`](/docs/routing#pathnames) setting, dynamic params can either be passed as:

    // 1. A final string (when not using `pathnames`)
    const pathname = getPathname({
      locale: 'en',
      href: '/users/12'
    });
     
    // 2. An object (when using `pathnames`)
    const pathname = getPathname({
      locale: 'en',
      href: {
        pathname: '/users/[userId]',
        params: {userId: '5'}
      }
    });

Legacy APIs[](#legacy-apis)
---------------------------

`next-intl@3.0.0` brought the first release of the navigation APIs with these functions:

*   `createSharedPathnamesNavigation`
*   `createLocalizedPathnamesNavigation`

As part of `next-intl@3.22.0`, these functions have been replaced by a single `createNavigation` function, which unifies the API for both use cases and also fixes a few quirks in the previous APIs. Going forward, `createNavigation` is recommended and the previous functions are marked as deprecated.

While `createNavigation` is mostly API-compatible, there are some minor differences that should be noted. Please refer to the [3.22 announcement post](/blog/next-intl-3-22#create-navigation) for full details.

Last updated on November 18, 2024

[Middleware](/docs/routing/middleware "Middleware")[Environments](/docs/environments "Environments")