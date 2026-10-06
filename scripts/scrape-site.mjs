// Fetches a company's existing website into the repository, for the content to be built from: every page reachable
// from the start page on the same site (title, headings, text, links), every photo on those pages, and the raw pages
// for reference. Writes scrape/site.json and scrape/html/*.html, and the photos as WebP (up to 2000 px, with smaller
// copies) in public/photos/site. Run where the site can be reached (the scrape-site workflow):
//   npm i --no-save cheerio && node scripts/scrape-site.mjs https://www.example.se/
import { mkdirSync, writeFileSync } from "node:fs";
import { load } from "cheerio";
import sharp from "sharp";

const START = process.argv[2] || "https://www.fjarassand.se/";
const ORIGIN = new URL(START).origin;
const HOST = new URL(START).hostname.replace(/^www\./, "");
const MAX_PAGES = 80;
const PHOTO_DIR = "public/photos/site";
const WIDTHS = [480, 800, 1200, 1600, 2000];
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

mkdirSync("scrape/html", { recursive: true });
mkdirSync(PHOTO_DIR, { recursive: true });
const log = [];
const note = (line) => {
  console.log(line);
  log.push(line);
};

async function get(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, { headers: { "User-Agent": USER_AGENT }, redirect: "follow" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      if (attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
}

const sameSite = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "") === HOST;
  } catch {
    return false;
  }
};
const absolute = (href, base) => {
  try {
    return new URL(href, base).href.split("#")[0];
  } catch {
    return null;
  }
};
const isImage = (url) => /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url || "");
const isDocument = (url) => /\.(pdf|docx?|xlsx?|zip|mp4|mov)(\?|$)/i.test(url || "");
// WordPress names its smaller copies "photo-300x200.jpg"; the original has no size suffix.
const original = (url) => url.replace(/-\d{2,5}x\d{2,5}(?=\.(jpe?g|png|webp|gif)(\?|$))/i, "").replace(/-scaled(?=\.(jpe?g|png|webp)(\?|$))/i, "");
const clean = (text) => text.replace(/\s+/g, " ").trim();

function photosOn($, base) {
  const found = [];
  const add = (src) => {
    if (!src || src.startsWith("data:")) return;
    const url = absolute(src, base);
    if (url && isImage(url)) found.push(original(url));
  };
  $("a[href]").each((_, el) => isImage($(el).attr("href")) && add($(el).attr("href")));
  $("img, source").each((_, el) => {
    for (const attr of ["data-large_image", "data-orig-file", "data-src", "data-lazy-src", "src"]) add($(el).attr(attr));
    for (const attr of ["srcset", "data-srcset", "data-lazy-srcset"]) {
      const set = $(el).attr(attr);
      if (set) for (const part of set.split(",")) add(part.trim().split(/\s+/)[0]);
    }
  });
  $("[style*='url(']").each((_, el) => {
    for (const match of ($(el).attr("style") || "").matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) add(match[1]);
  });
  $("[data-bg], [data-background], [data-image]").each((_, el) => {
    for (const attr of ["data-bg", "data-background", "data-image"]) add($(el).attr(attr));
  });
  return [...new Set(found)];
}

// 1. Crawl the site from the start page.
const pages = [];
const queue = [START];
const seen = new Set();
while (queue.length && pages.length < MAX_PAGES) {
  const url = queue.shift();
  if (seen.has(url)) continue;
  seen.add(url);
  let html;
  try {
    const response = await get(url);
    if (!(response.headers.get("content-type") || "").includes("html")) continue;
    html = await response.text();
  } catch (error) {
    note(`page failed: ${url} ${error.message}`);
    continue;
  }
  const name = new URL(url).pathname.replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/gi, "_") || "start";
  writeFileSync(`scrape/html/${name}.html`, html);
  const $ = load(html);
  const links = [];
  $("a[href]").each((_, el) => {
    const href = absolute($(el).attr("href"), url);
    if (!href) return;
    links.push({ text: clean($(el).text()), href });
    if (sameSite(href) && !isImage(href) && !isDocument(href) && !/\/(wp-admin|wp-json|feed)\b/.test(href) && !seen.has(href)) queue.push(href);
  });
  const photos = photosOn($, url);
  $("script, style, noscript, svg").remove();
  const main = $("main").length ? $("main") : $("#content, .content, article").first().length ? $("#content, .content, article").first() : $("body");
  pages.push({
    url,
    file: `${name}.html`,
    title: clean($("title").text()),
    description: $('meta[name="description"]').attr("content") || "",
    headings: $("h1, h2, h3, h4").map((_, el) => ({ level: el.tagName, text: clean($(el).text()) })).get().filter((h) => h.text),
    text: main.find("p, li, td, th, h1, h2, h3, h4, address").map((_, el) => clean($(el).text())).get().filter(Boolean),
    links,
    photos,
  });
  note(`${url}: ${photos.length} photos`);
}

// 2. Every photo, once.
const allPhotos = [...new Set(pages.flatMap((page) => page.photos))];
const saved = {};
for (const url of allPhotos) {
  const base = new URL(url).pathname.split("/").pop().replace(/\.[a-z]+$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60) || "bild";
  try {
    const input = Buffer.from(await (await get(url)).arrayBuffer());
    const meta = await sharp(input).metadata();
    if (!meta.width || meta.width < 300) {
      note(`photo skipped (small ${meta.width}px): ${url}`);
      continue;
    }
    const variants = [];
    const top = Math.min(meta.width, 2000);
    for (const w of [...WIDTHS.filter((w) => w < top), top]) {
      if (variants.some((v) => v.width === w)) continue;
      const src = `/photos/site/${base}-${w}.webp`;
      await sharp(input).rotate().resize({ width: w }).webp({ quality: 78 }).toFile(`public${src}`);
      variants.push({ width: w, src });
    }
    saved[url] = { width: meta.width, height: meta.height, variants };
  } catch (error) {
    note(`photo failed: ${url} ${error.message}`);
  }
}
note(`pages: ${pages.length}, photos saved: ${Object.keys(saved).length} of ${allPhotos.length}`);
writeFileSync("scrape/site.json", JSON.stringify({ fetched: new Date().toISOString(), start: START, pages, photos: saved, log }, null, 2) + "\n");
