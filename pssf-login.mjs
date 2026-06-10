/**
 * Step 1: Open browser, pre-fill phone, send OTP, wait for you to enter the code.
 * Saves session to /tmp/pssf-session.json then exits.
 * Run pssf-test.mjs next.
 */
import { chromium } from "playwright";
import { writeFileSync } from "fs";

const BASE = "http://localhost:3000";
const SESSION_FILE = "/tmp/pssf-session.json";
const PHONE = "+254704696287";

const browser = await chromium.launch({
  headless: false,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });

// Pre-fill and submit phone
await page.fill('input[name="phone"]', PHONE);
await page.click('button[type="submit"]');
await page.waitForTimeout(1500);

console.log(`OTP sent to ${PHONE}.`);
console.log("Enter the code in the browser, then log in.");
console.log("Waiting up to 3 minutes for you to complete login...\n");

// Wait for redirect to /member/
await page.waitForURL(/\/member\//, { timeout: 180_000 });

const cookies = await ctx.cookies();
writeFileSync(SESSION_FILE, JSON.stringify(cookies, null, 2));
console.log(`\nSession saved to ${SESSION_FILE}.`);
console.log("Now run:  node pssf-test.mjs\n");
await browser.close();
