Drizzle schema
==============

Drizzle lets you define a schema in TypeScript with various models and properties supported by the underlying database. When you define your schema, it serves as the source of truth for future modifications in queries (using Drizzle-ORM) and migrations (using Drizzle-Kit).

If you are using Drizzle-Kit for the migration process, make sure to export all the models defined in your schema files so that Drizzle-Kit can import them and use them in the migration diff process.

document.querySelectorAll('.callout-wrap-collapsed').forEach((el) => el.addEventListener('click', (e) => { console.log('expand'); e.target?.closest(".callout-wrap-collapsed")?.classList.remove('callout-wrap-collapsed'); })) document.querySelectorAll("\[data-callout-collapse-btn\]").forEach((n) => { n.addEventListener("click", (e) => { e.stopPropagation(); const parent = n.closest(".callout-wrap"); if (parent) { parent.classList.add("callout-wrap-collapsed"); } }); });

Organize your schema files[](#organize-your-schema-files)
---------------------------------------------------------

You can declare your SQL schema directly in TypeScript either in a single `schema.ts` file, or you can spread them around — whichever you prefer, all the freedom!

#### Schema in 1 file[](#schema-in-1-file)

The most common way to declare your schema with Drizzle is to put all your tables into one `schema.ts` file.

> Note: You can name your schema file whatever you like. For example, it could be `models.ts`, or something else.

This approach works well if you don’t have too many table models defined, or if you’re okay with keeping them all in one file

Example:

    📦 <project root>
    └ 📂 src
    └ 📂 db
       └ 📜 schema.ts

In the `drizzle.config.ts` file, you need to specify the path to your schema file. With this configuration, Drizzle will read from the `schema.ts` file and use this information during the migration generation process. For more information about the `drizzle.config.ts` file and migrations with Drizzle, please check: [link](/docs/drizzle-config-file)

    import { defineConfig } from "drizzle-kit";
    
    export default defineConfig({
      dialect: 'postgresql', // 'mysql' | 'sqlite' | 'turso'
      schema: './src/db/schema.ts'
    })

#### Schema in multiple files[](#schema-in-multiple-files)

You can place your Drizzle models — such as tables, enums, sequences, etc. — not only in one file but in any file you prefer. The only thing you must ensure is that you export all the models from those files so that the Drizzle kit can import them and use them in migrations.

One use case would be to separate each table into its own file.

    📦 <project root>
     └ 📂 src
        └ 📂 db
           └ 📂 schema
              ├ 📜 users.ts
              ├ 📜 countries.ts
              ├ 📜 cities.ts
              ├ 📜 products.ts
              ├ 📜 clients.ts
              └ 📜 etc.ts

In the `drizzle.config.ts` file, you need to specify the path to your schema folder. With this configuration, Drizzle will read from the `schema` folder and find all the files recursively and get all the drizzle tables from there. For more information about the `drizzle.config.ts` file and migrations with Drizzle, please check: [link](/docs/drizzle-config-file)

    import { defineConfig } from "drizzle-kit";
    
    export default defineConfig({
      dialect: 'postgresql', // 'mysql' | 'sqlite' | 'turso'
      schema: './src/db/schema'
    })

You can also group them in any way you like, such as creating groups for user-related tables, messaging-related tables, product-related tables, etc.

    📦 <project root>
     └ 📂 src
        └ 📂 db
           └ 📂 schema
              ├ 📜 users.ts
              ├ 📜 messaging.ts
              └ 📜 products.ts

In the `drizzle.config.ts` file, you need to specify the path to your schema file. With this configuration, Drizzle will read from the `schema.ts` file and use this information during the migration generation process. For more information about the `drizzle.config.ts` file and migrations with Drizzle, please check: [link](/docs/drizzle-config-file)

    import { defineConfig } from "drizzle-kit";
    
    export default defineConfig({
      dialect: 'postgresql', // 'mysql' | 'sqlite' | 'turso'
      schema: './src/db/schema'
    })

Shape your data schema[](#shape-your-data-schema)
-------------------------------------------------

Drizzle schema consists of several model types from database you are using. With drizzle you can specify:

*   Tables with columns, constraints, etc.
*   Schemas(PostgreSQL only)
*   Enums
*   Sequences(PostgreSQL only)
*   Views
*   Materialized Views
*   etc.

Let’s go one by one and check how the schema should be defined with drizzle

#### **Tables and columns declaration**[](#tables-and-columns-declaration)

A table in Drizzle should be defined with at least 1 column, the same as it should be done in database. There is one important thing to know, there is no such thing as a common table object in drizzle. You need to choose a dialect you are using, PostgreSQL, MySQL or SQLite

![](/_astro/table-structure.fy17afPI_6Eq1p.svg)

PostgreSQL Table

MySQL Table

SQLite Table

    import { pgTable, integer } from "drizzle-orm/pg-core"
    
    export const users = pgTable('users', {
      id: integer()
    });

    import { mysqlTable, int } from "drizzle-orm/mysql-core"
    
    export const users = mysqlTable('users', {
      id: int()
    });

    import { sqliteTable, integer } from "drizzle-orm/sqlite-core"
    
    export const users = sqliteTable('users', {
      id: integer()
    });

By default, Drizzle will use the TypeScript key names for columns in database queries. Therefore, the schema and query from the example will generate the SQL query shown below

This example uses a db object, whose initialization is not covered in this part of the documentation. To learn how to connect to the database, please refer to the [Connections Docs](/docs/get-started-postgresql)

document.querySelectorAll('.callout-wrap-collapsed').forEach((el) => el.addEventListener('click', (e) => { console.log('expand'); e.target?.closest(".callout-wrap-collapsed")?.classList.remove('callout-wrap-collapsed'); })) document.querySelectorAll("\[data-callout-collapse-btn\]").forEach((n) => { n.addEventListener("click", (e) => { e.stopPropagation(); const parent = n.closest(".callout-wrap"); if (parent) { parent.classList.add("callout-wrap-collapsed"); } }); });

  
**TypeScript key = database key**

    // schema.ts
    import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
    
    export const users = pgTable('users', {
      id: integer(),
      first_name: varchar()
    })

    // query.ts
    await db.select().from(users);

    SELECT "id", "first_name" from users;

If you want to use different names in your TypeScript code and in the database, you can use column aliases

    // schema.ts
    import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
    
    export const users = pgTable('users', {
      id: integer(),
      firstName: varchar('first_name')
    })

    // query.ts
    await db.select().from(users);

    SELECT "id", "first_name" from users;

### Camel and Snake casing[](#camel-and-snake-casing)

Database model names often use `snake_case` conventions, while in TypeScript, it is common to use `camelCase` for naming models. This can lead to a lot of alias definitions in the schema. To address this, Drizzle provides a way to automatically map `camelCase` from TypeScript to `snake_case` in the database by including one optional parameter during Drizzle database initialization

For such mapping, you can use the `casing` option in the Drizzle DB declaration. This parameter will help you specify the database model naming convention and will attempt to map all JavaScript keys accordingly

    // schema.ts
    import { drizzle } from "drizzle-orm/node-postgres";
    import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
    
    export const users = pgTable('users', {
      id: integer(),
      firstName: varchar()
    })

    // db.ts
    const db = drizzle({ connection: process.env.DATABASE_URL, casing: 'snake_case' })

    // query.ts
    await db.select().from(users);

    SELECT "id", "first_name" from users;

### Advanced[](#advanced)

There are a few tricks you can use with Drizzle ORM. As long as Drizzle is entirely in TypeScript files, you can essentially do anything you would in a simple TypeScript project with your code.

One common feature is to separate columns into different places and then reuse them. For example, consider the `updated_at`, `created_at`, and `deleted_at` columns. Many tables/models may need these three fields to track and analyze the creation, deletion, and updates of entities in a system

We can define those columns in a separate file and then import and spread them across all the table objects you have

    // columns.helpers.ts
    const timestamps = {
      updated_at: timestamp(),
      created_at: timestamp().defaultNow().notNull(),
      deleted_at: timestamp(),
    }

    // users.sql.ts
    export const users = pgTable('users', {
      id: integer(),
      ...timestamps
    })

    // posts.sql.ts
    export const posts = pgTable('posts', {
      id: integer(),
      ...timestamps
    })

#### **Schemas**[](#schemas)

PostgreSQL

MySQL

SQLite

  
In PostgreSQL, there is an entity called a `schema` (which we believe should be called `folders`). This creates a structure in PostgreSQL:

![](/_astro/postgresql-db-structure.BPKhPpto_2mAGNT.webp)

You can manage your PostgreSQL schemas with `pgSchema` and place any other models inside it.

Define the schema you want to manage using Drizzle

    import { pgSchema } from "drizzle-orm/pg-core"
    
    export const customSchema = pgSchema('custom');

Then place the table inside the schema object

    import { integer, pgSchema } from "drizzle-orm/pg-core";
    
    export const customSchema = pgSchema('custom');
    
    export const users = customSchema.table('users', {
      id: integer()
    })

  
In MySQL, there is an entity called `Schema`, but in MySQL terms, this is equivalent to a `Database`.

You can define them with `drizzle-orm` and use them in queries, but they won’t be detected by `drizzle-kit` or included in the migration flow

![](/_astro/mysql-db-structure.CDh3zkSm_Z9LwSM.webp)

Define the schema you want to manage using Drizzle

    import { mysqlSchema } from "drizzle-orm/mysql-core"
    
    export const customSchema = mysqlSchema('custom');

Then place the table inside the schema object

    import { int, mysqlSchema } from "drizzle-orm/mysql-core";
    
    export const customSchema = mysqlSchema('custom');
    
    export const users = customSchema.table('users', {
      id: int()
    })

  
In SQLite, there is no concept of a schema, so you can only define tables within a single SQLite file context

![](/_astro/sqlite-db-structure.B9OUpLNM_9zJjL.webp)

### Example[](#example)

Once you know the basics, let’s define a schema example for a real project to get a better view and understanding

> All examples will use `generateUniqueString`. The implementation for it will be provided after all the schema examples

PostgreSQL

MySQL

SQLite

    import { AnyPgColumn } from "drizzle-orm/pg-core";
    import { pgEnum, pgTable as table } from "drizzle-orm/pg-core";
    import * as t from "drizzle-orm/pg-core";
    
    export const rolesEnum = pgEnum("roles", ["guest", "user", "admin"]);
    
    export const users = table(
      "users",
      {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        firstName: t.varchar("first_name", { length: 256 }),
        lastName: t.varchar("last_name", { length: 256 }),
        email: t.varchar().notNull(),
        invitee: t.integer().references((): AnyPgColumn => users.id),
        role: rolesEnum().default("guest"),
      },
      (table) => {
        return {
          emailIndex: t.uniqueIndex("email_idx").on(table.email),
        };
      }
    );
    
    export const posts = table(
      "posts",
      {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        slug: t.varchar().$default(() => generateUniqueString(16)),
        title: t.varchar({ length: 256 }),
        ownerId: t.integer("owner_id").references(() => users.id),
      },
      (table) => {
        return {
          slugIndex: t.uniqueIndex("slug_idx").on(table.slug),
          titleIndex: t.index("title_idx").on(table.title),
        };
      }
    );
    
    export const comments = table("comments", {
      id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
      text: t.varchar({ length: 256 }),
      postId: t.integer("post_id").references(() => posts.id),
      ownerId: t.integer("owner_id").references(() => users.id),
    });

    import { mysqlTable as table } from "drizzle-orm/mysql-core";
    import * as t from "drizzle-orm/mysql-core";
    import { AnyMySqlColumn } from "drizzle-orm/mysql-core";
    
    export const users = table(
      "users",
      {
        id: t.int().primaryKey().autoincrement(),
        firstName: t.varchar("first_name", { length: 256 }),
        lastName: t.varchar("last_name", { length: 256 }),
        email: t.varchar({ length: 256 }).notNull(),
        invitee: t.int().references((): AnyMySqlColumn => users.id),
        role: t.mysqlEnum(["guest", "user", "admin"]).default("guest"),
      },
      (table) => {
        return {
          emailIndex: t.uniqueIndex("email_idx").on(table.email),
        };
      }
    );
    
    export const posts = table(
      "posts",
      {
        id: t.int().primaryKey().autoincrement(),
        slug: t.varchar({ length: 256 }).$default(() => generateUniqueString(16)),
        title: t.varchar({ length: 256 }),
        ownerId: t.int("owner_id").references(() => users.id),
      },
      (table) => {
        return {
          slugIndex: t.uniqueIndex("slug_idx").on(table.slug),
          titleIndex: t.index("title_idx").on(table.title),
        };
      }
    );
    
    export const comments = table("comments", {
      id: t.int().primaryKey().autoincrement(),
      text: t.varchar({ length: 256 }),
      postId: t.int("post_id").references(() => posts.id),
      ownerId: t.int("owner_id").references(() => users.id),
    });

    import { sqliteTable as table } from "drizzle-orm/sqlite-core";
    import * as t from "drizzle-orm/sqlite-core";
    import { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
    
    export const users = table(
      "users",
      {
        id: t.int().primaryKey({ autoIncrement: true }),
        firstName: t.text("first_name"),
        lastName: t.text("last_name"),
        email: t.text().notNull(),
        invitee: t.int().references((): AnySQLiteColumn => users.id),
        role: t.text().$type<"guest" | "user" | "admin">().default("guest"),
      },
      (table) => {
        return {
          emailIndex: t.uniqueIndex("email_idx").on(table.email),
        };
      }
    );
    
    export const posts = table(
      "posts",
      {
        id: t.int().primaryKey({ autoIncrement: true }),
        slug: t.text().$default(() => generateUniqueString(16)),
        title: t.text(),
        ownerId: t.int("owner_id").references(() => users.id),
      },
      (table) => {
        return {
          slugIndex: t.uniqueIndex("slug_idx").on(table.slug),
          titleIndex: t.index("title_idx").on(table.title),
        };
      }
    );
    
    export const comments = table("comments", {
      id: t.int().primaryKey({ autoIncrement: true }),
      text: t.text({ length: 256 }),
      postId: t.int("post_id").references(() => posts.id),
      ownerId: t.int("owner_id").references(() => users.id),
    });

**`generateUniqueString` implementation:**

    function generateUniqueString(length: number = 12): string {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let uniqueString = "";
    
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        uniqueString += characters[randomIndex];
      }
    
      return uniqueString;
    }

#### What’s next?[](#whats-next)

  

**Manage schema**

[Column types](/docs/column-types/pg) [Indexes and Constraints](/docs/indexes-constraints) [Database Views](/docs/views) [Database Schemas](/docs/schemas) [Sequences](/docs/sequences) [Extensions](/docs/extensions/pg)

**Zero to Hero**

[Database connection](/docs/connect-overview) [Data querying](/docs/data-querying) [Migrations](/docs/migrations)