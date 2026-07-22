import { chromium } from "file:///Users/ruben/GameDev/spellwright/node_modules/playwright/index.mjs";
const OUT = process.cwd();
const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:8741/", { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await page.click("#play-btn");
await page.waitForTimeout(900);
await page.evaluate(() => window.__skimmers.selectCandidate(1));
await page.click("#phase-next"); await page.waitForTimeout(200);
await page.click("#phase-next"); await page.waitForTimeout(400); // paint

const rotBefore = await page.evaluate(() => window.__skimmers.G.playerRock.group.rotation.y);
// drag on open water (left side) -> should spin, not paint
await page.mouse.move(200, 400);
await page.mouse.down();
await page.mouse.move(700, 300, { steps: 12 });
await page.mouse.up();
await page.waitForTimeout(300);
const rotAfter = await page.evaluate(() => ({
  y: window.__skimmers.G.playerRock.group.rotation.y,
  x: window.__skimmers.G.playerRock.group.rotation.x,
}));
// drag ON the rock (center) -> should paint
await page.evaluate(() => document.querySelectorAll("#swatches .swatch")[4]?.click());
await page.mouse.move(640, 390);
await page.mouse.down();
for (let i = 0; i < 12; i++) { await page.mouse.move(600 + i * 8, 385 + (i % 3) * 8); await page.waitForTimeout(40); }
await page.mouse.up();
await page.waitForTimeout(400);
const painted = await page.evaluate(() => {
  const c = window.__skimmers.G.playerRock.strokeCanvas;
  const d = c.getContext("2d").getImageData(0, 0, 256, 256).data;
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 30) n++;
  return n;
});
await page.screenshot({ path: `${OUT}/paint_rotate.png` });
console.log(JSON.stringify({ errors, rotBefore: +rotBefore.toFixed(2), rotAfter: { y: +rotAfter.y.toFixed(2), x: +rotAfter.x.toFixed(2) }, paintedPixels: painted }));
await browser.close();
