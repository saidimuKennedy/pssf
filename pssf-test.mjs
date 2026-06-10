import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "fs";

const BASE = "http://localhost:3000";
const SHOTS = "/tmp/pssf-screenshots";
mkdirSync(SHOTS, { recursive: true });

const cookies = JSON.parse(readFileSync("/tmp/pssf-session.json", "utf8"));

const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addCookies(cookies);
const page = await ctx.newPage();

const jsErrors = [];
page.on("pageerror", (e) => jsErrors.push(`[JS] ${e.message}`));

let stepNum = 0;
async function shot(label) {
  stepNum++;
  const name = `${String(stepNum).padStart(2, "0")}-${label}.png`;
  await page.screenshot({ path: `${SHOTS}/${name}`, fullPage: true });
  console.log(`  📸 ${name}`);
}

async function go(path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
}

const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

async function getCases(type) {
  const r = await fetch(`${BASE}/api/cases?type=${type}`, {
    headers: { cookie: cookieHeader },
  }).catch(() => null);
  if (!r?.ok) return [];
  const data = await r.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

// ── verify session ───────────────────────────────────────────────────────────
await go("/member/dashboard");
if (page.url().includes("/login")) {
  console.error("Session expired — run pssf-login.mjs again.");
  await browser.close();
  process.exit(1);
}
await shot("member-dashboard");
console.log("✅ Session valid\n");

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 1 — Sign-Up (public, no auth needed)
// ═══════════════════════════════════════════════════════════════════════════
console.log("🔷 Journey 1: Sign-Up / Member Onboarding");
await go("/sign-up");
await shot("j1-signup-validate-form");

// DOB mismatch
await page.fill('input[name="national_id"]', "00000001");
await page.fill('input[type="date"]', "1999-01-01");
const tel = page.locator('input[type="tel"]').first();
if (await tel.isVisible({ timeout: 2000 }).catch(() => false)) await tel.fill("+254700000001");
await page.click('button[type="submit"]');
await page.waitForTimeout(2500);
await shot("j1-signup-dob-mismatch-alert");

// NOT_FOUND
await page.fill('input[name="national_id"]', "99999999");
await page.fill('input[type="date"]', "1980-05-15");
await page.click('button[type="submit"]');
await page.waitForTimeout(2500);
await shot("j1-signup-not-found-alert");

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 2 — Member Enrolment
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n🔷 Journey 2: Member Enrolment");
await go("/member/enrolment");
await shot("j2-enrolment-start");

const enrolCases = await getCases("ENROLMENT");
const enrolId = enrolCases[0]?.id ?? "none";
await go(`/member/enrolment/declaration?case_id=${enrolId}`);
await shot("j2-enrolment-declaration-signature-pad");

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 3 — Beneficiary Nomination
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n🔷 Journey 3: Beneficiary Nomination");
await go("/member/beneficiaries");
await shot("j3-beneficiaries-start");

const bCases = await getCases("BENEFICIARY_NOMINATION");
const bId = bCases[0]?.id ?? "none";
await go(`/member/beneficiaries/add?case_id=${bId}`);
await shot("j3-beneficiaries-add-form");

await go(`/member/beneficiaries/guardian?case_id=${bId}`);
await shot("j3-beneficiaries-guardian");

await go(`/member/beneficiaries/witness?case_id=${bId}`);
await shot("j3-beneficiaries-witness");

await go(`/member/beneficiaries/declaration?case_id=${bId}`);
await shot("j3-beneficiaries-declaration-signature-pad");

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 4 — AVC
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n🔷 Journey 4: Additional Voluntary Contributions");
await go("/member/avc");
await shot("j4-avc-start");

const avcCases = await getCases("AVC");
const avcId = avcCases[0]?.id ?? "none";
await go(`/member/avc/action?case_id=${avcId}`);
await shot("j4-avc-action-select");

await go(`/member/avc/declaration?case_id=${avcId}`);
await shot("j4-avc-declaration-signature-pad");

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 5 — Benefits Claim
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n🔷 Journey 5: Benefits Claim");
await go("/member/claims/benefits");
await shot("j5-benefits-start");

const bfCases = await getCases("BENEFITS_CLAIM");
const bfId = bfCases[0]?.id ?? "none";
await go(`/member/claims/benefits/declaration?case_id=${bfId}`);
await shot("j5-benefits-declaration-signature-pad");

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 6 — Death Benefits Claim
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n🔷 Journey 6: Death Benefits Claim");
await go("/member/claims/death");
await shot("j6-death-start");

const dCases = await getCases("DEATH_BENEFIT");
const dId = dCases[0]?.id ?? "none";
await go(`/member/claims/death/declaration?case_id=${dId}`);
await shot("j6-death-declaration-signature-pad");

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 7 — Contribution Statement
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n🔷 Journey 7: Contribution Statement");
await go("/member/statements");
await shot("j7-contribution-statement");

// ═══════════════════════════════════════════════════════════════════════════
// CROSS-JOURNEY: Discrepancy (Fix 3 — CONTRIBUTION field type)
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n🔷 Cross-journey: Discrepancy Report");
await go("/member/discrepancy");
await shot("xj-discrepancy-form");

const combo = page.locator('button[role="combobox"]').first();
if (await combo.isVisible({ timeout: 3000 }).catch(() => false)) {
  await combo.click();
  await page.waitForTimeout(500);
  await shot("xj-discrepancy-field-dropdown-open");
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC: Track (Fix 7 — human-readable status labels)
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n🔷 Public: Track Request");
await go("/track");
await shot("pub-track-form");

await page.fill('input[id="ref"]', "ENR-2026-000001");
await page.click('button[type="submit"]');
await page.waitForTimeout(2500);
await shot("pub-track-result-status-labels");

// ═══════════════════════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════════════════════
const errs = jsErrors.filter((e) => !e.includes("ChunkLoadError"));
console.log("\n" + "═".repeat(60));
if (errs.length) {
  console.log("⚠️  JS errors:");
  errs.forEach((e) => console.log("  ", e));
} else {
  console.log("✅ No JS errors detected");
}
console.log(`\nTotal screenshots: ${stepNum}  →  ${SHOTS}/`);
await browser.close();
