// Thumbnails for the project pages that sit on the Qmin OS desktop (production notes, trial and error, the asset
// gallery, the DeepHold site). Like Finder's previews, each document icon is the top of the real page, shrunk.
// Pages come from the hrefs in src/lib/links.ts plus the DeepHold site, in every language.
// Usage: npx next build && node scripts/build-doc-thumbs.mjs  (needs Playwright; writes public/os/docs/*.jpg)
// Rerun after a listed page's top changes or a page is added to links.ts.
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = new URL('../out/', import.meta.url).pathname;
const OUT = new URL('../public/os/docs/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const LOCALES = ['ko', 'en'];
const links = readFileSync(new URL('../src/lib/links.ts', import.meta.url), 'utf8');
const paths = new Set(['/{locale}/deephold/']);
for (const m of links.matchAll(/\$\{SITE\}(\/[^`]*)`/g)) paths.add(m[1]);
const pages = [...new Set([...paths].flatMap((p) => LOCALES.map((l) => p.replace('{locale}', l))))];

/** Same name the home screen asks for (src/components/os/data.ts, thumbOf). */
const thumbName = (href) => href.replace(/^\/|\/$/g, '').replace(/\//g, '_') + '.jpg';

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  let f = join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) return res.writeHead(404).end();
  res.setHeader('content-type', TYPES[extname(f)] ?? 'application/octet-stream');
  createReadStream(f).pipe(res);
}).listen(0);
const base = `http://localhost:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
for (const href of pages) {
  await page.goto(base + href, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  // The top-left 1024×640 (title and lead), so the text stays legible at icon size.
  const png = await page.screenshot({ clip: { x: 64, y: 0, width: 1024, height: 640 } });
  await sharp(png).resize(256, 160).jpeg({ quality: 78, mozjpeg: true }).toFile(new URL(thumbName(href), OUT).pathname);
  console.log(thumbName(href));
}
await browser.close();
server.close();
