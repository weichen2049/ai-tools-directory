import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.OG_IMAGE_PORT || 4310);
const TARGET_URL = process.env.OG_IMAGE_URL || `http://localhost:${PORT}`;
const OUTPUT_PATH = path.join(__dirname, "..", "public", "og-image.png");
const VIEWPORT = { width: 1200, height: 630 };

async function waitForServer(url, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok || res.status < 500) {
        return;
      }
    } catch {
    }
    await sleep(500);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function startServer() {
  if (process.env.SKIP_OG_CAPTURE === "true") {
    throw new Error("OG capture skipped via SKIP_OG_CAPTURE=true");
  }

  const child = spawn("npm", ["run", "start", "--", "-p", PORT], {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      NODE_ENV: "production"
    }
  });

  child.on("error", (err) => {
    console.error("Failed to start server", err);
  });

  await waitForServer(TARGET_URL);
  return child;
}

async function generateScreenshot() {
  if (process.env.SKIP_OG_CAPTURE === "true") {
    console.warn("Skipping OG capture because SKIP_OG_CAPTURE=true");
    return;
  }

  console.warn("Starting Next.js server for OG capture…");
  const server = await startServer();

  try {
    console.warn("Launching Chromium…");
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: VIEWPORT });
    await page.goto(TARGET_URL, { waitUntil: "networkidle" });
    await sleep(2000);
    await page.screenshot({
      path: OUTPUT_PATH,
      fullPage: false
    });
    await browser.close();
    console.warn(`OG image saved to ${OUTPUT_PATH}`);
  } finally {
    server.kill();
  }
}

generateScreenshot().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});