import puppeteer from "puppeteer";
import TurndownService from "turndown";
import fs from "fs/promises";
import path from "path";

type DocUrl = string | { url: string; filename?: string };
type DocSource = {
  urls: DocUrl[] | { rootUrl: string; recursive: boolean };
};

const docSources: Record<string, DocSource> = {
  prodigi: {
    urls: [
      "https://www.prodigi.com/print-api/docs/reference/",
    ],
  },
  nextjs: {
    urls: [
      {"url": "https://nextjs.org/docs/pages/building-your-application/authentication", "filename": "authentication"},
    ],
  },
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
    urls: [
      "https://orm.drizzle.team/docs/get-started/neon-new",
      "https://orm.drizzle.team/docs/sql-schema-declaration",
      "https://orm.drizzle.team/docs/kit-overview",
    ],
  },
  stripe: {
    urls: [
      { url: "https://docs.stripe.com/api", filename: "api-reference" },
    ],
  },
};

const toKebabCase = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function scrapeToMarkdown(url: string) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const turndown = new TurndownService();

  try {
    // Increase timeouts and add better error handling
    await page.setDefaultNavigationTimeout(60000); // 60 seconds
    await page.setDefaultTimeout(60000);

    // Navigate with more lenient wait condition
    await page.goto(url, { 
      waitUntil: ["load", "domcontentloaded", "networkidle2"],
      timeout: 60000
    });

    // Wait for main content with timeout and retry logic
    const mainSelector = "main";
    let retries = 3;
    let mainContent = "";
    
    while (retries > 0) {
      try {
        await page.waitForSelector(mainSelector, { timeout: 20000 });
        mainContent = await page.$eval(mainSelector, main => main.innerHTML);
        break;
      } catch (error) {
        console.log(`Retry ${4 - retries} for ${url}`);
        retries--;
        if (retries === 0) throw error;
        await page.reload({ waitUntil: ["load", "domcontentloaded", "networkidle2"] });
      }
    }

    // Get title with fallbacks
    const title = await page.evaluate(() => {
      const mainH1 = document.querySelector("main h1")?.textContent;
      const h1 = document.querySelector("h1")?.textContent;
      const navCurrent = document.querySelector('nav a[aria-current="page"]')?.textContent;
      return mainH1 || h1 || navCurrent || "";
    }) || new URL(url).pathname.split("/").pop() || "index";

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

    let urlsToProcess: DocUrl[] = [];

    if (Array.isArray(source.urls)) {
      urlsToProcess = source.urls;
    }

    for (const urlConfig of urlsToProcess) {
      try {
        const url = typeof urlConfig === "string" ? urlConfig : urlConfig.url;
        const { markdown, title } = await scrapeToMarkdown(url);
        
        // Use custom filename if provided, otherwise generate from title
        const filename = typeof urlConfig === "string" 
          ? `${toKebabCase(title.trim())}.md`
          : `${urlConfig.filename || toKebabCase(title.trim())}.md`;
        
        const filePath = path.join(folderPath, filename);
        await fs.writeFile(filePath, markdown);
        console.log(`✓ Saved ${filePath}`);
      } catch (error) {
        const errorUrl = typeof urlConfig === "string" ? urlConfig : urlConfig.url;
        console.error(`✗ Failed to process ${errorUrl}:`, error);
      }
    }
  }
}

processAllDocs().catch(error => {
  console.error("Script failed:", error);
  process.exit(1);
});
