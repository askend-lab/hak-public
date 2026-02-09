#!/usr/bin/env node
/**
 * Standalone WCAG 2.1 AA Accessibility Audit
 * Run with: node scripts/a11y-audit.mjs
 */

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const WCAG_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const BASE_URL = process.env.BASE_URL || "http://localhost:5180";

async function runAudit() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("\n🔍 WCAG 2.1 AA Accessibility Audit\n");
  console.log("=".repeat(60));
  console.log(`Base URL: ${BASE_URL}`);

  let totalViolations = 0;
  let totalCritical = 0;
  let totalPasses = 0;

  // Test pages
  const pages = [
    { name: "Synthesis Page", path: "/" },
    { name: "Tasks Page", path: "/tasks" },
  ];

  for (const { name, path } of pages) {
    console.log(`\n📄 Testing: ${name} (${path})`);

    try {
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState("networkidle", { timeout: 10000 });

      const results = await new AxeBuilder({ page })
        .withTags(WCAG_AA_TAGS)
        .analyze();

      const critical = results.violations.filter(
        (v) => v.impact === "critical",
      );
      const serious = results.violations.filter((v) => v.impact === "serious");
      const moderate = results.violations.filter(
        (v) => v.impact === "moderate",
      );
      const minor = results.violations.filter((v) => v.impact === "minor");

      totalViolations += results.violations.length;
      totalCritical += critical.length;
      totalPasses += results.passes.length;

      console.log(`   🔴 Critical: ${critical.length}`);
      console.log(`   🟠 Serious:  ${serious.length}`);
      console.log(`   🟡 Moderate: ${moderate.length}`);
      console.log(`   🔵 Minor:    ${minor.length}`);
      console.log(`   ✅ Passes:   ${results.passes.length}`);

      if (results.violations.length > 0) {
        console.log("\n   Violations:");
        results.violations.forEach((v) => {
          console.log(
            `   [${v.impact?.toUpperCase()}] ${v.id}: ${v.description}`,
          );
          console.log(`      Help: ${v.helpUrl}`);
          console.log(`      Affects: ${v.nodes.length} element(s)`);
          v.nodes.slice(0, 2).forEach((n) => {
            const html = n.html.replace(/\s+/g, " ").substring(0, 80);
            console.log(`      - ${html}${n.html.length > 80 ? "..." : ""}`);
          });
        });
      }
    } catch (error) {
      console.log(`   ⚠️  Error: ${error.message}`);
    }
  }

  await browser.close();

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 AUDIT SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total Violations: ${totalViolations}`);
  console.log(`Critical Issues:  ${totalCritical}`);
  console.log(`Total Passes:     ${totalPasses}`);
  console.log("");

  if (totalCritical === 0 && totalViolations === 0) {
    console.log("✅ WCAG 2.1 AA Audit: PASSED");
    console.log("   No accessibility violations found!");
  } else if (totalCritical === 0) {
    console.log("⚠️  WCAG 2.1 AA Audit: PASSED WITH WARNINGS");
    console.log(`   ${totalViolations} non-critical issues to address`);
  } else {
    console.log("❌ WCAG 2.1 AA Audit: FAILED");
    console.log(`   ${totalCritical} critical issues must be fixed`);
  }
  console.log("=".repeat(60) + "\n");

  process.exit(totalCritical > 0 ? 1 : 0);
}

runAudit().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
