Migrations with Drizzle Kit
===========================

This guide assumes familiarity with:

*   Get started with Drizzle and `drizzle-kit` - [read here](/docs/get-started)
*   Drizzle schema foundamentals - [read here](/docs/sql-schema-declaration)
*   Database connection basics - [read here](/docs/connect-overview)
*   Drizzle migrations foundamentals - [read here](/docs/migrations)

**Drizzle Kit** is a CLI tool for managing SQL database migrations with Drizzle.

npm

yarn

pnpm

bun

    npm i drizzle-kit

    yarn add drizzle-kit

    pnpm add drizzle-kit

    bun add drizzle-kit

IMPORTANT

Make sure to first go through Drizzle [get started](/docs/get-started) and [migration foundamentals](/docs/migrations) and pick SQL migration flow that suites your business needs best.

document.querySelectorAll('.callout-wrap-collapsed').forEach((el) => el.addEventListener('click', (e) => { console.log('expand'); e.target?.closest(".callout-wrap-collapsed")?.classList.remove('callout-wrap-collapsed'); })) document.querySelectorAll("\[data-callout-collapse-btn\]").forEach((n) => { n.addEventListener("click", (e) => { e.stopPropagation(); const parent = n.closest(".callout-wrap"); if (parent) { parent.classList.add("callout-wrap-collapsed"); } }); });

Based on your schema, Drizzle Kit let’s you generate and run SQL migration files, push schema directly to the database, pull schema from database, spin up drizzle studio and has a couple of utility commands.

npm

yarn

pnpm

bun

    npx drizzle-kit generate
    npx drizzle-kit migrate
    npx drizzle-kit push
    npx drizzle-kit pull
    npx drizzle-kit check
    npx drizzle-kit up
    npx drizzle-kit studio

    yarn drizzle-kit generate
    yarn drizzle-kit migrate
    yarn drizzle-kit push
    yarn drizzle-kit pull
    yarn drizzle-kit check
    yarn drizzle-kit up
    yarn drizzle-kit studio

    pnpm drizzle-kit generate
    pnpm drizzle-kit migrate
    pnpm drizzle-kit push
    pnpm drizzle-kit pull
    pnpm drizzle-kit check
    pnpm drizzle-kit up
    pnpm drizzle-kit studio

    bun drizzle-kit generate
    bun drizzle-kit migrate
    bun drizzle-kit push
    bun drizzle-kit pull
    bun drizzle-kit check
    bun drizzle-kit up
    bun drizzle-kit studio

[`drizzle-kit generate`](/docs/drizzle-kit-generate)

lets you generate SQL migration files based on your Drizzle schema either upon declaration or on subsequent changes, [see here](/docs/drizzle-kit-generate).

[`drizzle-kit migrate`](/docs/drizzle-kit-migrate)

lets you apply generated SQL migration files to your database, [see here](/docs/drizzle-kit-migrate).

[`drizzle-kit pull`](/docs/drizzle-kit-pull)

lets you pull(introspect) database schema, convert it to Drizzle schema and save it to your codebase, [see here](/docs/drizzle-kit-pull)

[`drizzle-kit push`](/docs/drizzle-kit-push)

lets you push your Drizzle schema to database either upon declaration or on subsequent schema changes, [see here](/docs/drizzle-kit-push)

[`drizzle-kit studio`](/docs/drizzle-kit-studio)

will connect to your database and spin up proxy server for Drizzle Studio which you can use for convenient database browsing, [see here](/docs/drizzle-kit-studio)

[`drizzle-kit check`](/docs/drizzle-kit-check)

will walk through all generate migrations and check for any race conditions(collisions) of generated migrations, [see here](/docs/drizzle-kit-check)

[`drizzle-kit up`](/docs/drizzle-kit-up)

used to upgrade snapshots of previously generated migrations, [see here](/docs/drizzle-kit-up)

  

Drizzle Kit is configured through [drizzle.config.ts](/docs/drizzle-config-file) configuration file or via CLI params.  
It’s required to at least provide SQL `dialect` and `schema` path for Drizzle Kit to know how to generate migrations.

    📦 <project root>
     ├ 📂 drizzle
     ├ 📂 src
     ├ 📜 .env
     ├ 📜 drizzle.config.ts  <--- Drizzle config file
     ├ 📜 package.json
     └ 📜 tsconfig.json

simple config

extended config

    import { defineConfig } from "drizzle-kit";
    
    export default defineConfig({
      dialect: "postgresql",
      schema: "./src/schema.ts",
    });

    import { defineConfig } from "drizzle-kit";
    
    export default defineConfig({
      out: "./drizzle",
      dialect: "postgresql",
      schema: "./src/schema.ts",
    
      driver: "pglite",
      dbCredentials: {
        url: "./database/",
      },
    
      extensionsFilters: ["postgis"],
      schemaFilter: "public",
      tablesFilter: "*",
    
      introspect: {
        casing: "camel",
      },
    
      migrations: {
        prefix: "timestamp",
        table: "__drizzle_migrations__",
        schema: "public",
      },
    
      breakpoints: true,
      strict: true,
      verbose: true,
    });

You can provide Drizzle Kit config path via CLI param, it’s very useful when you have multiple database stages or multiple databases or different databases on the same project:

npm

yarn

pnpm

bun

    npx drizzle-kit push --config=drizzle-dev.drizzle.config
    npx drizzle-kit push --config=drizzle-prod.drizzle.config

    yarn drizzle-kit push --config=drizzle-dev.drizzle.config
    yarn drizzle-kit push --config=drizzle-prod.drizzle.config

    pnpm drizzle-kit push --config=drizzle-dev.drizzle.config
    pnpm drizzle-kit push --config=drizzle-prod.drizzle.config

    bun drizzle-kit push --config=drizzle-dev.drizzle.config
    bun drizzle-kit push --config=drizzle-prod.drizzle.config

    📦 <project root>
     ├ 📂 drizzle
     ├ 📂 src
     ├ 📜 .env
     ├ 📜 drizzle-dev.config.ts
     ├ 📜 drizzle-prod.config.ts
     ├ 📜 package.json
     └ 📜 tsconfig.json