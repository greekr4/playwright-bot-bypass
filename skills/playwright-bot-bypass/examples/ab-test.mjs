#!/usr/bin/env node
/**
 * A/B Test: Detected vs Stealth
 * Compare bot detection between standard playwright and stealth mode
 *
 * Usage: node ab-test.mjs
 */

import { chromium } from 'playwright';
import { chromium as stealthChromium } from 'rebrowser-playwright';

console.log('═══════════════════════════════════════════');
console.log('      A/B TEST: Detected vs Stealth        ');
console.log('═══════════════════════════════════════════\n');

// A: Standard Playwright (will be detected)
console.log('[A] Starting standard Playwright...');
const browserA = await chromium.launch({
  headless: false,
  channel: 'chrome',
  args: ['--window-position=0,0']
});
const contextA = await browserA.newContext({
  viewport: { width: 640, height: 700 }
});
const pageA = await contextA.newPage();

// B: Stealth mode (will bypass detection)
console.log('[B] Starting stealth Rebrowser...');
const browserB = await stealthChromium.launch({
  headless: false,
  channel: 'chrome',
  args: ['--window-position=660,0']
});
const contextB = await browserB.newContext({
  viewport: { width: 640, height: 700 }
});
await contextB.addInitScript(() => {
  delete Object.getPrototypeOf(navigator).webdriver;
});
const pageB = await contextB.newPage();

// Navigate both to bot detection site
console.log('\n📡 Opening bot detection test site...\n');
await Promise.all([
  pageA.goto('https://bot.sannysoft.com', { waitUntil: 'networkidle' }),
  pageB.goto('https://bot.sannysoft.com', { waitUntil: 'networkidle' })
]);

// Wait for test tables to render on both pages
await Promise.all([
  pageA.waitForSelector('table tr td', { timeout: 10000 }),
  pageB.waitForSelector('table tr td', { timeout: 10000 })
]);

// Check WebDriver status
const resultA = await pageA.evaluate(() => {
  const rows = document.querySelectorAll('table tr');
  for (const row of rows) {
    if (row.textContent.includes('WebDriver')) {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) {
        return cells[1].textContent.trim();
      }
    }
  }
  return 'unknown';
});

const resultB = await pageB.evaluate(() => {
  const rows = document.querySelectorAll('table tr');
  for (const row of rows) {
    if (row.textContent.includes('WebDriver')) {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) {
        return cells[1].textContent.trim();
      }
    }
  }
  return 'unknown';
});

console.log('═══════════════════════════════════════════');
console.log('               RESULTS                     ');
console.log('═══════════════════════════════════════════');
console.log(`[A] Standard Playwright: ${resultA.includes('failed') ? '❌ DETECTED' : '✅ Passed'}`);
console.log(`    WebDriver: ${resultA}`);
console.log(`[B] Stealth Rebrowser:   ${resultB.includes('passed') || resultB.includes('missing') ? '✅ BYPASSED' : '❌ Detected'}`);
console.log(`    WebDriver: ${resultB}`);
console.log('═══════════════════════════════════════════\n');

// Screenshots
await Promise.all([
  pageA.screenshot({ path: 'ab-test-detected.png' }),
  pageB.screenshot({ path: 'ab-test-stealth.png' })
]);
console.log('📸 Screenshots saved: ab-test-detected.png, ab-test-stealth.png\n');

await browserA.close();
await browserB.close();

console.log('Done!');
