import puppeteer from "puppeteer";
import TurndownService from "turndown";
import fs from "fs/promises";
import path from "path";

type DocSource = {
  urls: string[] | { rootUrl: string; recursive: boolean };
};

const docSources: Record<string, DocSource> = {
  "next-intl": {
    urls: [
      "https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing",
      "https://next-intl-docs.vercel.app/docs/routing/middleware",
      "https://next-intl-docs.vercel.app/docs/routing/navigation",
    ],
  },
  topaz: {
    urls: ["https://developer.topazlabs.com/"],
  },
  drizzle: {
    urls: ["https://orm.drizzle.team/docs/get-started/neon-new"],
  },
  // stripe times out, probably secured for scraping
  // stripe: {
  //   urls: [
  //     "https://docs.stripe.com/payments/checkout/how-checkout-works",
  //     "https://docs.stripe.com/api",
  //   ],
  // },
  // TODO: handle navigation better
  // "react-query": {
  //   urls: {
  //     rootUrl: "https://tanstack.com/query/latest/docs/framework/react/overview",
  //     recursive: true,
  //   },
  // },
};

const toKebabCase = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function getNavigationUrls(page: puppeteer.Page): Promise<string[]> {
  // Adjust selectors based on the site's navigation structure
  const urls = await page.$$eval("nav a", links =>
    links.map(link => link.href).filter(href => href.includes("/docs/"))
  );
  return [...new Set(urls)]; // Remove duplicates
}

async function scrapeToMarkdown(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const turndown = new TurndownService();

  try {
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.waitForSelector("main");

    const mainContent = await page.$eval("main", main => main.innerHTML);
    const title =
      (await page.$eval("main h1, h1", h1 => h1.textContent || "")) ||
      (await page.$eval('nav a[aria-current="page"]', nav => nav.textContent || "")) ||
      new URL(url).pathname.split("/").pop() ||
      "index";

    const markdown = turndown.turndown(mainContent);
    return { markdown, title };
  } finally {
    await browser.close();
  }
}

async function processAllDocs() {
  for (const [prefix, source] of Object.entries(docSources)) {
    const folderPath = path.join("docs", prefix);
    await fs.mkdir(folderPath, { recursive: true });

    let urlsToProcess: string[] = [];

    if (Array.isArray(source.urls)) {
      urlsToProcess = source.urls;
    } else {
      // Handle recursive navigation
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(source.urls.rootUrl, { waitUntil: "networkidle0" });
      urlsToProcess = await getNavigationUrls(page);
      await browser.close();
    }

    for (const url of urlsToProcess) {
      try {
        const { markdown, title } = await scrapeToMarkdown(url);
        const filename = `${toKebabCase(title.trim())}.md`;
        const filePath = path.join(folderPath, filename);
        await fs.writeFile(filePath, markdown);
        console.log(`✓ Saved ${filePath}`);
      } catch (error) {
        console.error(`✗ Failed to process ${url}:`, error);
      }
    }
  }
}

processAllDocs().catch(error => {
  console.error("Script failed:", error);
  process.exit(1);
});
