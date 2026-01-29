#!/usr/bin/env node
/**
 * Stealth Google Search Example
 * Demonstrates bot-detection-free Google search
 *
 * Usage: node stealth-google-search.mjs "search query"
 */

import { chromium } from 'rebrowser-playwright';

const searchQuery = process.argv[2] || 'Playwright automation';

async function stealthGoogleSearch(query) {
  console.log(`🔍 Searching Google for: "${query}"\n`);

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

  // Navigate to Google
  await page.goto('https://www.google.com');
  await page.waitForTimeout(1000);

  // Enter search query
  await page.fill('textarea[name="q"]', query);
  await page.waitForTimeout(500);
  await page.press('textarea[name="q"]', 'Enter');

  // Wait for results
  await page.waitForTimeout(3000);

  // Check if we got blocked
  const url = page.url();
  if (url.includes('sorry')) {
    console.log('❌ CAPTCHA detected! Bot detection triggered.');
  } else {
    console.log('✅ Search successful! No CAPTCHA.');

    // Get search results
    const results = await page.evaluate(() => {
      const items = document.querySelectorAll('div.g');
      return Array.from(items).slice(0, 5).map(item => {
        const title = item.querySelector('h3')?.textContent || '';
        const link = item.querySelector('a')?.href || '';
        return { title, link };
      });
    });

    console.log('\n📋 Top Results:');
    results.forEach((r, i) => {
      console.log(`${i + 1}. ${r.title}`);
      console.log(`   ${r.link}\n`);
    });
  }

  // Save screenshot
  await page.screenshot({ path: 'google-search-result.png' });
  console.log('📸 Screenshot saved: google-search-result.png\n');

  console.log('Closing in 10 seconds...');
  await page.waitForTimeout(10000);
  await browser.close();
}

stealthGoogleSearch(searchQuery).catch(console.error);
