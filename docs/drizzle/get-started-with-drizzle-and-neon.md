Neon

New database

Meet Drizzle

[Get started](/docs/get-started)

New database Existing database

PostgreSQL Neon Vercel Postgres Supabase Xata PGLite MySQL PlanetScale TiDB SingleStore SQLite Turso Cloudflare D1 Bun SQLite Cloudflare Durable Objects Expo SQLite OP SQLite

(function(){const currentItem = {"name":"Neon","path":{"existing":"/docs/get-started/neon-existing","new":"/docs/get-started/neon-new"},"icon":{"light":{"path":"/public/svg/neon-light.svg","style":{"width":20}},"dark":{"path":"/public/svg/neon-dark.svg","style":{"width":20}}}}; const flatItems = \[{"name":"PostgreSQL","path":{"existing":"/docs/get-started/postgresql-existing","new":"/docs/get-started/postgresql-new"},"icon":{"light":{"path":"/public/svg/postgresql.svg","style":{"width":20}},"dark":{"path":"/public/svg/postgresql.svg","style":{"width":20,"fill":"#f0f0f0"}}}},{"name":"Neon","path":{"existing":"/docs/get-started/neon-existing","new":"/docs/get-started/neon-new"},"icon":{"light":{"path":"/public/svg/neon-light.svg","style":{"width":20}},"dark":{"path":"/public/svg/neon-dark.svg","style":{"width":20}}}},{"name":"Vercel Postgres","path":{"existing":"/docs/get-started/vercel-existing","new":"/docs/get-started/vercel-new"},"icon":{"light":{"path":"/public/svg/vercel.svg","style":{"width":20}},"dark":{"path":"/public/svg/vercel.svg","style":{"width":20,"fill":"#000000"}}}},{"name":"Supabase","path":{"existing":"/docs/get-started/supabase-existing","new":"/docs/get-started/supabase-new"},"icon":{"light":{"path":"/public/svg/supabase.svg","style":{"width":20}},"dark":{"path":"/public/svg/supabase.svg","style":{"width":20}}}},{"name":"Xata","path":{"existing":"/docs/get-started/xata-existing","new":"/docs/get-started/xata-new"},"icon":{"light":{"path":"/public/svg/xata.svg","style":{"width":26}},"dark":{"path":"/public/svg/xata.svg","style":{"width":26}}}},{"name":"PGLite","path":{"existing":"/docs/get-started/pglite-existing","new":"/docs/get-started/pglite-new"},"icon":{"light":{"path":"/public/svg/pglite.svg","style":{"width":26}},"dark":{"path":"/public/svg/pglite.svg","style":{"width":26}}}},{"name":"MySQL","path":{"existing":"/docs/get-started/mysql-existing","new":"/docs/get-started/mysql-new"},"icon":{"light":{"path":"/public/svg/mysql.svg","style":{"width":20,"fill":"#00546B"}},"dark":{"path":"/public/svg/mysql.svg","style":{"width":20,"fill":"#F0F0F0"}}}},{"name":"PlanetScale","path":{"existing":"/docs/get-started/planetscale-existing","new":"/docs/get-started/planetscale-new"},"icon":{"light":{"path":"/public/svg/planetscale.svg","style":{"width":20}},"dark":{"path":"/public/svg/planetscale.svg","style":{"width":20,"color":"#f0f0f0"}}}},{"name":"TiDB","path":{"existing":"/docs/get-started/tidb-existing","new":"/docs/get-started/tidb-new"},"icon":{"light":{"path":"/public/svg/tidb.svg","style":{"width":20}},"dark":{"path":"/public/svg/tidb.svg","style":{"width":20}}}},{"name":"SingleStore","path":{"existing":"/docs/get-started/singlestore-existing","new":"/docs/get-started/singlestore-new"},"icon":{"light":{"path":"/public/svg/singlestore\_light.svg","style":{"width":20,"fill":"#00546B"}},"dark":{"path":"/public/svg/singlestore\_dark.svg","style":{"width":20,"fill":"#F0F0F0"}}}},{"name":"SQLite","path":{"existing":"/docs/get-started/sqlite-existing","new":"/docs/get-started/sqlite-new"},"icon":{"light":{"path":"/public/svg/sqlite.svg","style":{"width":20}},"dark":{"path":"/public/svg/sqlite.svg","style":{"width":20}}}},{"name":"Turso","path":{"existing":"/docs/get-started/turso-existing","new":"/docs/get-started/turso-new"},"icon":{"light":{"path":"/public/svg/new-turso.svg","style":{"width":26}},"dark":{"path":"/public/svg/new-turso-light.svg","style":{"width":26}}}},{"name":"Cloudflare D1","path":{"existing":"/docs/get-started/d1-existing","new":"/docs/get-started/d1-new"},"icon":{"light":{"path":"/public/svg/cloudflare.svg","style":{"width":26}},"dark":{"path":"/public/svg/cloudflare.svg","style":{"width":26}}}},{"name":"Bun SQLite","path":{"existing":"/docs/get-started/bun-sqlite-existing","new":"/docs/get-started/bun-sqlite-new"},"icon":{"light":{"path":"/public/svg/bun.svg","style":{"width":20}},"dark":{"path":"/public/svg/bun.svg","style":{"width":20}}}},{"name":"Cloudflare Durable Objects","path":{"existing":"/docs/get-started/do-existing","new":"/docs/get-started/do-new"},"icon":{"light":{"path":"/public/svg/cloudflare.svg","style":{"width":26}},"dark":{"path":"/public/svg/cloudflare.svg","style":{"width":26}}}},{"name":"Expo SQLite","path":{"existing":"/docs/get-started/expo-existing","new":"/docs/get-started/expo-new"},"icon":{"light":{"path":"/public/svg/expo.svg","style":{"width":20}},"dark":{"path":"/public/svg/expo.svg","style":{"width":20}}}},{"name":"OP SQLite","path":{"existing":"/docs/get-started/op-sqlite-existing","new":"/docs/get-started/op-sqlite-new"},"icon":{"light":{"path":"/public/svg/opsqlite.png","style":{"width":"20px","borderRadius":"4px"}},"dark":{"path":"/public/svg/opsqlite.png","style":{"width":"20px","borderRadius":"4px"}}}}\]; const databaseType = "new"; const dbSelect = document.getElementById('db-select'); const dbTypeSelect = document.getElementById('db-type-select'); const dbSelectResizer = document.getElementById('db-resizer'); const dbTypeSelectResizer = document.getElementById('db-type-resizer'); dbSelect.addEventListener('change', (e) => { dbSelectResizer.innerText = e.target.value; dbSelect.style.width = \`${dbSelectResizer.offsetWidth}px\`; window.location.href = flatItems.find(({name}) => name === e.target.value).path\[databaseType\]; }); dbTypeSelect.addEventListener('change', (e) => { dbTypeSelectResizer.innerText = e.target.value === 'new' ? 'New database' : 'Existing database' dbTypeSelect.style.width = \`${dbTypeSelectResizer.offsetWidth}px\`; window.location.href = currentItem.path\[e.target.value\] }); dbSelect.style.width = \`${dbSelectResizer.offsetWidth}px\`; dbTypeSelect.style.width = \`${dbTypeSelectResizer.offsetWidth}px\`; })();

Get Started with Drizzle and Neon
=================================

This guide assumes familiarity with:

*   **dotenv** - package for managing environment variables - [read here](https://www.npmjs.com/package/dotenv)
*   **tsx** - package for running TypeScript files - [read here](https://tsx.is/)
*   **Neon** - serverless Postgres platform - [read here](https://neon.tech/docs/introduction)

Drizzle has native support for Neon connections with the `neon-http` and `neon-websockets` drivers. These use the **neon-serverless** driver under the hood.

With the `neon-http` and `neon-websockets` drivers, you can access a Neon database from serverless environments over HTTP or WebSockets instead of TCP. Querying over HTTP is faster for single, non-interactive transactions.

If you need session or interactive transaction support, or a fully compatible drop-in replacement for the `pg` driver, you can use the WebSocket-based `neon-serverless` driver. You can connect to a Neon database directly using [Postgres](/docs/get-started/postgresql-new)

#### Basic file structure[](#basic-file-structure)

This is the basic file structure of the project. In the `src/db` directory, we have table definition in `schema.ts`. In `drizzle` folder there are sql migration file and snapshots.

    📦 <project root>
     ├ 📂 drizzle
     ├ 📂 src
     │   ├ 📂 db
     │   │  └ 📜 schema.ts
     │   └ 📜 index.ts
     ├ 📜 .env
     ├ 📜 drizzle.config.ts
     ├ 📜 package.json
     └ 📜 tsconfig.json

#### Step 1 - Install **@neondatabase/serverless** package[](#step-1---install-neondatabaseserverless-package)

npm

yarn

pnpm

bun

    npm i drizzle-orm @neondatabase/serverless dotenv
    npm i -D drizzle-kit tsx

    yarn add drizzle-orm @neondatabase/serverless dotenv
    yarn add -D drizzle-kit tsx

    pnpm add drizzle-orm @neondatabase/serverless dotenv
    pnpm add -D drizzle-kit tsx

    bun add drizzle-orm @neondatabase/serverless dotenv
    bun add -D drizzle-kit tsx

#### Step 2 - Setup connection variables[](#step-2---setup-connection-variables)

Create a `.env` file in the root of your project and add your database connection variable:

    DATABASE_URL=

#### Step 3 - Connect Drizzle ORM to the database[](#step-3---connect-drizzle-orm-to-the-database)

Create a `index.ts` file in the `src/db` directory and initialize the connection:

    import { drizzle } from 'drizzle-orm/neon-http';
    
    const db = drizzle(process.env.DATABASE_URL);

If you need a synchronous connection, you can use our additional connection API, where you specify a driver connection and pass it to the Drizzle instance.

    import { neon } from '@neondatabase/serverless';
    import { drizzle } from 'drizzle-orm/neon-serverless';
    
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle({ client: sql });

#### Step 4 - Create a table[](#step-4---create-a-table)

Create a `schema.ts` file in the `src/db` directory and declare your table:

src/db/schema.ts

    import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
    
    export const usersTable = pgTable("users", {
      id: integer().primaryKey().generatedAlwaysAsIdentity(),
      name: varchar({ length: 255 }).notNull(),
      age: integer().notNull(),
      email: varchar({ length: 255 }).notNull().unique(),
    });

#### Step 5 - Setup Drizzle config file[](#step-5---setup-drizzle-config-file)

**Drizzle config** - a configuration file that is used by [Drizzle Kit](/docs/kit-overview) and contains all the information about your database connection, migration folder and schema files.

Create a `drizzle.config.ts` file in the root of your project and add the following content:

drizzle.config.ts

    import 'dotenv/config';
    import { defineConfig } from 'drizzle-kit';
    
    export default defineConfig({
      out: './drizzle',
      schema: './src/db/schema.ts',
      dialect: 'postgresql',
      dbCredentials: {
        url: process.env.DATABASE_URL!,
      },
    });

#### Step 6 - Applying changes to the database[](#step-6---applying-changes-to-the-database)

You can directly apply changes to your database using the `drizzle-kit push` command. This is a convenient method for quickly testing new schema designs or modifications in a local development environment, allowing for rapid iterations without the need to manage migration files:

    npx drizzle-kit push

Read more about the push command in [documentation](/docs/drizzle-kit-push).

Tips

Alternatively, you can generate migrations using the `drizzle-kit generate` command and then apply them using the `drizzle-kit migrate` command:

Generate migrations:

    npx drizzle-kit generate

Apply migrations:

    npx drizzle-kit migrate

Read more about migration process in [documentation](/docs/kit-overview).

document.querySelectorAll('.callout-wrap-collapsed').forEach((el) => el.addEventListener('click', (e) => { console.log('expand'); e.target?.closest(".callout-wrap-collapsed")?.classList.remove('callout-wrap-collapsed'); })) document.querySelectorAll("\[data-callout-collapse-btn\]").forEach((n) => { n.addEventListener("click", (e) => { e.stopPropagation(); const parent = n.closest(".callout-wrap"); if (parent) { parent.classList.add("callout-wrap-collapsed"); } }); });

#### Step 7 - Seed and Query the database[](#step-7---seed-and-query-the-database)

Let’s **update** the `src/index.ts` file with queries to create, read, update, and delete users

src/index.ts

    import 'dotenv/config';
    import { drizzle } from 'drizzle-orm/neon-http';
    import { eq } from 'drizzle-orm';
    import { usersTable } from './db/schema';
      
    const db = drizzle(process.env.DATABASE_URL!);
    
    async function main() {
      const user: typeof usersTable.$inferInsert = {
        name: 'John',
        age: 30,
        email: 'john@example.com',
      };
    
      await db.insert(usersTable).values(user);
      console.log('New user created!')
    
      const users = await db.select().from(usersTable);
      console.log('Getting all users from the database: ', users)
      /*
      const users: {
        id: number;
        name: string;
        age: number;
        email: string;
      }[]
      */
    
      await db
        .update(usersTable)
        .set({
          age: 31,
        })
        .where(eq(usersTable.email, user.email));
      console.log('User info updated!')
    
      await db.delete(usersTable).where(eq(usersTable.email, user.email));
      console.log('User deleted!')
    }
    
    main();

#### Step 8 - Run index.ts file[](#step-8---run-indexts-file)

To run any TypeScript files, you have several options, but let’s stick with one: using `tsx`

You’ve already installed `tsx`, so we can run our queries now

**Run `index.ts` script**

npm

yarn

pnpm

bun

    npx tsx src/index.ts

    yarn tsx src/index.ts

    pnpm tsx src/index.ts

    bun tsx src/index.ts

tips

We suggest using `bun` to run TypeScript files. With `bun`, such scripts can be executed without issues or additional settings, regardless of whether your project is configured with CommonJS (CJS), ECMAScript Modules (ESM), or any other module format. To run a script with `bun`, use the following command:

    bun src/index.ts

If you don’t have bun installed, check the [Bun installation docs](https://bun.sh/docs/installation#installing)

document.querySelectorAll('.callout-wrap-collapsed').forEach((el) => el.addEventListener('click', (e) => { console.log('expand'); e.target?.closest(".callout-wrap-collapsed")?.classList.remove('callout-wrap-collapsed'); })) document.querySelectorAll("\[data-callout-collapse-btn\]").forEach((n) => { n.addEventListener("click", (e) => { e.stopPropagation(); const parent = n.closest(".callout-wrap"); if (parent) { parent.classList.add("callout-wrap-collapsed"); } }); });