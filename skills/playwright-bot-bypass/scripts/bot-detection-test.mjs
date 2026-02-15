#!/usr/bin/env node
/**
 * Bot Detection Test Script
 * Tests if the stealth configuration bypasses bot detection
 *
 * Usage: node bot-detection-test.mjs
 */

import { chromium } from 'rebrowser-playwright';

async function testBotDetection() {
  console.log('🔍 Bot Detection Test Starting...\n');

  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome'
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  // Apply stealth patches
  await context.addInitScript(() => {
    delete Object.getPrototypeOf(navigator).webdriver;
  });

  const page = await context.newPage();

  console.log('📡 Navigating to bot.sannysoft.com...\n');
  await page.goto('https://bot.sannysoft.com', { waitUntil: 'networkidle' });

  // Wait for test table to render
  await page.waitForSelector('table tr td', { timeout: 10000 });

  // Check key detection points
  const results = await page.evaluate(() => {
    const getResult = (testName) => {
      const rows = document.querySelectorAll('table tr');
      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2 && cells[0].textContent.includes(testName)) {
          const resultCell = cells[1];
          const isRed = resultCell.style.backgroundColor === 'rgb(255, 102, 102)' ||
                       resultCell.style.backgroundColor === '#ff6666' ||
                       resultCell.classList.contains('failed');
          return {
            value: resultCell.textContent.trim(),
            passed: !isRed && !resultCell.textContent.includes('failed')
          };
        }
      }
      return { value: 'N/A', passed: true };
    };

    return {
      userAgent: getResult('User Agent'),
      webDriver: getResult('WebDriver'),
      webDriverAdvanced: getResult('WebDriver Advanced'),
      chrome: getResult('Chrome'),
      webglVendor: getResult('WebGL Vendor'),
      webglRenderer: getResult('WebGL Renderer')
    };
  });

  // Print results
  console.log('═══════════════════════════════════════════');
  console.log('           BOT DETECTION RESULTS           ');
  console.log('═══════════════════════════════════════════\n');

  const tests = [
    ['User Agent', results.userAgent],
    ['WebDriver', results.webDriver],
    ['WebDriver Advanced', results.webDriverAdvanced],
    ['Chrome', results.chrome],
    ['WebGL Vendor', results.webglVendor],
    ['WebGL Renderer', results.webglRenderer]
  ];

  let allPassed = true;
  for (const [name, result] of tests) {
    const status = result.passed ? '✅' : '❌';
    if (!result.passed) allPassed = false;
    console.log(`${status} ${name.padEnd(20)} ${result.value.substring(0, 50)}`);
  }

  console.log('\n═══════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED - Bot detection bypassed!');
  } else {
    console.log('⚠️  SOME TESTS FAILED - May be detected as bot');
  }
  console.log('═══════════════════════════════════════════\n');

  // Save screenshot
  await page.screenshot({ path: 'bot-detection-result.png' });
  console.log('📸 Screenshot saved: bot-detection-result.png\n');

  await browser.close();
}

testBotDetection().catch(console.error);
