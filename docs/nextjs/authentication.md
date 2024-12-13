On this page

*   [Authentication](#authentication)
*   [Session Management](#session-management)
*   [Stateless Sessions](#stateless-sessions)
*   [Setting and deleting cookies](#setting-and-deleting-cookies)
*   [Database Sessions](#database-sessions)
*   [Authorization](#authorization)
*   [Optimistic checks with Middleware (Optional)](#optimistic-checks-with-middleware-optional)
*   [Creating a Data Access Layer (DAL)](#creating-a-data-access-layer-dal-1)
*   [Protecting API Routes](#protecting-api-routes)
*   [Resources](#resources)
*   [Auth Libraries](#auth-libraries)
*   [Session Management Libraries](#session-management-libraries)
*   [Further Reading](#further-reading)

Authentication
==============

Understanding authentication is crucial for protecting your application's data. This page will guide you through what React and Next.js features to use to implement auth.

Before starting, it helps to break down the process into three concepts:

1.  **[Authentication](#authentication)**: Verifies if the user is who they say they are. It requires the user to prove their identity with something they have, such as a username and password.
2.  **[Session Management](#session-management)**: Tracks the user's auth state across requests.
3.  **[Authorization](#authorization)**: Decides what routes and data the user can access.

This diagram shows the authentication flow using React and Next.js features:

![Diagram showing the authentication flow with React and Next.js features](/_next/image?url=%2Fdocs%2Flight%2Fauthentication-overview.png&w=3840&q=75)![Diagram showing the authentication flow with React and Next.js features](/_next/image?url=%2Fdocs%2Fdark%2Fauthentication-overview.png&w=3840&q=75)

The examples on this page walk through basic username and password auth for educational purposes. While you can implement a custom auth solution, for increased security and simplicity, we recommend using an authentication library. These offer built-in solutions for authentication, session management, and authorization, as well as additional features such as social logins, multi-factor authentication, and role-based access control. You can find a list in the [Auth Libraries](#auth-libraries) section.

[Authentication](#authentication)
---------------------------------

Here are the steps to implement a sign-up and/or login form:

1.  The user submits their credentials through a form.
2.  The form sends a request that is handled by an API route.
3.  Upon successful verification, the process is completed, indicating the user's successful authentication.
4.  If verification is unsuccessful, an error message is shown.

Consider a login form where users can input their credentials:

pages/login.tsx

TypeScript

JavaScriptTypeScript

    import { FormEvent } from 'react'
    import { useRouter } from 'next/router'
     
    export default function LoginPage() {
      const router = useRouter()
     
      async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
     
        const formData = new FormData(event.currentTarget)
        const email = formData.get('email')
        const password = formData.get('password')
     
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
     
        if (response.ok) {
          router.push('/profile')
        } else {
          // Handle errors
        }
      }
     
      return (
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Email" required />
          <input type="password" name="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      )
    }

The form above has two input fields for capturing the user's email and password. On submission, it triggers a function that sends a POST request to an API route (`/api/auth/login`).

You can then call your Authentication Provider's API in the API route to handle authentication:

pages/api/auth/login.ts

TypeScript

JavaScriptTypeScript

    import type { NextApiRequest, NextApiResponse } from 'next'
    import { signIn } from '@/auth'
     
    export default async function handler(
      req: NextApiRequest,
      res: NextApiResponse
    ) {
      try {
        const { email, password } = req.body
        await signIn('credentials', { email, password })
     
        res.status(200).json({ success: true })
      } catch (error) {
        if (error.type === 'CredentialsSignin') {
          res.status(401).json({ error: 'Invalid credentials.' })
        } else {
          res.status(500).json({ error: 'Something went wrong.' })
        }
      }
    }

[Session Management](#session-management)
-----------------------------------------

Session management ensures that the user's authenticated state is preserved across requests. It involves creating, storing, refreshing, and deleting sessions or tokens.

There are two types of sessions:

1.  [**Stateless**](#stateless-sessions): Session data (or a token) is stored in the browser's cookies. The cookie is sent with each request, allowing the session to be verified on the server. This method is simpler, but can be less secure if not implemented correctly.
2.  [**Database**](#database-sessions): Session data is stored in a database, with the user's browser only receiving the encrypted session ID. This method is more secure, but can be complex and use more server resources.

> **Good to know:** While you can use either method, or both, we recommend using session management library such as [iron-session](https://github.com/vvo/iron-session) or [Jose](https://github.com/panva/jose).

### [Stateless Sessions](#stateless-sessions)

#### [Setting and deleting cookies](#setting-and-deleting-cookies)

You can use [API Routes](/docs/pages/building-your-application/routing/api-routes) to set the session as a cookie on the server:

pages/api/login.ts

TypeScript

JavaScriptTypeScript

    import { serialize } from 'cookie'
    import type { NextApiRequest, NextApiResponse } from 'next'
    import { encrypt } from '@/app/lib/session'
     
    export default function handler(req: NextApiRequest, res: NextApiResponse) {
      const sessionData = req.body
      const encryptedSessionData = encrypt(sessionData)
     
      const cookie = serialize('session', encryptedSessionData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // One week
        path: '/',
      })
      res.setHeader('Set-Cookie', cookie)
      res.status(200).json({ message: 'Successfully set cookie!' })
    }

### [Database Sessions](#database-sessions)

To create and manage database sessions, you'll need to follow these steps:

1.  Create a table in your database to store session and data (or check if your Auth Library handles this).
2.  Implement functionality to insert, update, and delete sessions
3.  Encrypt the session ID before storing it in the user's browser, and ensure the database and cookie stay in sync (this is optional, but recommended for optimistic auth checks in [Middleware](#optimistic-checks-with-middleware-optional)).

**Creating a Session on the Server**:

pages/api/create-session.ts

TypeScript

JavaScriptTypeScript

    import db from '../../lib/db'
    import type { NextApiRequest, NextApiResponse } from 'next'
     
    export default async function handler(
      req: NextApiRequest,
      res: NextApiResponse
    ) {
      try {
        const user = req.body
        const sessionId = generateSessionId()
        await db.insertSession({
          sessionId,
          userId: user.id,
          createdAt: new Date(),
        })
     
        res.status(200).json({ sessionId })
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' })
      }
    }

[Authorization](#authorization)
-------------------------------

Once a user is authenticated and a session is created, you can implement authorization to control what the user can access and do within your application.

There are two main types of authorization checks:

1.  **Optimistic**: Checks if the user is authorized to access a route or perform an action using the session data stored in the cookie. These checks are useful for quick operations, such as showing/hiding UI elements or redirecting users based on permissions or roles.
2.  **Secure**: Checks if the user is authorized to access a route or perform an action using the session data stored in the database. These checks are more secure and are used for operations that require access to sensitive data or actions.

For both cases, we recommend:

*   Creating a [Data Access Layer](#creating-a-data-access-layer-dal) to centralize your authorization logic
*   Using [Data Transfer Objects (DTO)](#using-data-transfer-objects-dto) to only return the necessary data
*   Optionally use [Middleware](#optimistic-checks-with-middleware-optional) to perform optimistic checks.

### [Optimistic checks with Middleware (Optional)](#optimistic-checks-with-middleware-optional)

There are some cases where you may want to use [Middleware](/docs/app/building-your-application/routing/middleware) and redirect users based on permissions:

*   To perform optimistic checks. Since Middleware runs on every route, it's a good way to centralize redirect logic and pre-filter unauthorized users.
*   To protect static routes that share data between users (e.g. content behind a paywall).

However, since Middleware runs on every route, including [prefetched](/docs/app/building-your-application/routing/linking-and-navigating#2-prefetching) routes, it's important to only read the session from the cookie (optimistic checks), and avoid database checks to prevent performance issues.

For example:

middleware.ts

TypeScript

JavaScriptTypeScript

    import { NextRequest, NextResponse } from 'next/server'
    import { decrypt } from '@/app/lib/session'
    import { cookies } from 'next/headers'
     
    // 1. Specify protected and public routes
    const protectedRoutes = ['/dashboard']
    const publicRoutes = ['/login', '/signup', '/']
     
    export default async function middleware(req: NextRequest) {
      // 2. Check if the current route is protected or public
      const path = req.nextUrl.pathname
      const isProtectedRoute = protectedRoutes.includes(path)
      const isPublicRoute = publicRoutes.includes(path)
     
      // 3. Decrypt the session from the cookie
      const cookie = (await cookies()).get('session')?.value
      const session = await decrypt(cookie)
     
      // 4. Redirect to /login if the user is not authenticated
      if (isProtectedRoute && !session?.userId) {
        return NextResponse.redirect(new URL('/login', req.nextUrl))
      }
     
      // 5. Redirect to /dashboard if the user is authenticated
      if (
        isPublicRoute &&
        session?.userId &&
        !req.nextUrl.pathname.startsWith('/dashboard')
      ) {
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
      }
     
      return NextResponse.next()
    }
     
    // Routes Middleware should not run on
    export const config = {
      matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
    }

While Middleware can be useful for initial checks, it should not be your only line of defense in protecting your data. The majority of security checks should be performed as close as possible to your data source, see [Data Access Layer](#creating-a-data-access-layer-dal) for more information.

> **Tips**:
> 
> *   In Middleware, you can also read cookies using `req.cookies.get('session').value`.
> *   Middleware uses the [Edge Runtime](/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes), check if your Auth library and session management library are compatible.
> *   You can use the `matcher` property in the Middleware to specify which routes Middleware should run on. Although, for auth, it's recommended Middleware runs on all routes.

### [Creating a Data Access Layer (DAL)](#creating-a-data-access-layer-dal-1)

#### [Protecting API Routes](#protecting-api-routes)

API Routes in Next.js are essential for handling server-side logic and data management. It's crucial to secure these routes to ensure that only authorized users can access specific functionalities. This typically involves verifying the user's authentication status and their role-based permissions.

Here's an example of securing an API Route:

pages/api/route.ts

TypeScript

JavaScriptTypeScript

    import { NextApiRequest, NextApiResponse } from 'next'
     
    export default async function handler(
      req: NextApiRequest,
      res: NextApiResponse
    ) {
      const session = await getSession(req)
     
      // Check if the user is authenticated
      if (!session) {
        res.status(401).json({
          error: 'User is not authenticated',
        })
        return
      }
     
      // Check if the user has the 'admin' role
      if (session.user.role !== 'admin') {
        res.status(401).json({
          error: 'Unauthorized access: User does not have admin privileges.',
        })
        return
      }
     
      // Proceed with the route for authorized users
      // ... implementation of the API Route
    }

This example demonstrates an API Route with a two-tier security check for authentication and authorization. It first checks for an active session, and then verifies if the logged-in user is an 'admin'. This approach ensures secure access, limited to authenticated and authorized users, maintaining robust security for request processing.

[Resources](#resources)
-----------------------

Now that you've learned about authentication in Next.js, here are Next.js-compatible libraries and resources to help you implement secure authentication and session management:

### [Auth Libraries](#auth-libraries)

*   [Auth0](https://auth0.com/docs/quickstart/webapp/nextjs/01-login)
*   [Clerk](https://clerk.com/docs/quickstarts/nextjs)
*   [Kinde](https://kinde.com/docs/developer-tools/nextjs-sdk)
*   [NextAuth.js](https://authjs.dev/getting-started/installation?framework=next.js)
*   [Ory](https://www.ory.sh/docs/getting-started/integrate-auth/nextjs)
*   [Stack Auth](https://docs.stack-auth.com/getting-started/setup)
*   [Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
*   [Stytch](https://stytch.com/docs/guides/quickstarts/nextjs)
*   [WorkOS](https://workos.com/docs/user-management/nextjs)

### [Session Management Libraries](#session-management-libraries)

*   [Iron Session](https://github.com/vvo/iron-session)
*   [Jose](https://github.com/panva/jose)

[Further Reading](#further-reading)
-----------------------------------

To continue learning about authentication and security, check out the following resources:

*   [How to think about security in Next.js](/blog/security-nextjs-server-components-actions)
*   [Understanding XSS Attacks](https://vercel.com/guides/understanding-xss-attacks)
*   [Understanding CSRF Attacks](https://vercel.com/guides/understanding-csrf-attacks)
*   [The Copenhagen Book](https://thecopenhagenbook.com/)

[Previous

Cypress

](/docs/pages/building-your-application/testing/cypress)

[Next

Deploying

](/docs/pages/building-your-application/deploying)

Was this helpful?

supported.

Send