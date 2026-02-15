#!/usr/bin/env node
/**
 * Stealth Twitter/X Scraping Example
 * Scrape public Twitter profiles without login (Camofox + Nitter alternative)
 *
 * Usage: node stealth-twitter-scrape.mjs [username]
 */

import { chromium } from 'rebrowser-playwright';

const username = process.argv[2] || 'elonmusk';

async function scrapeTwitterProfile(username) {
  console.log(`🐦 Scraping @${username} profile...\n`);

  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome'
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  await context.addInitScript(() => {
    delete Object.getPrototypeOf(navigator).webdriver;
  });

  const page = await context.newPage();
  await page.goto(`https://x.com/${username}`, { waitUntil: 'domcontentloaded' });

  // Wait for tweets to render (Twitter loads articles dynamically)
  await page.waitForSelector('article', { timeout: 15000 }).catch(() => {});

  // Check if profile loaded
  const title = await page.title();
  if (!title.includes('@')) {
    console.log('❌ Profile not loaded. May be redirected or blocked.');
    await browser.close();
    return;
  }

  // Extract profile info and tweets
  const data = await page.evaluate(() => {
    const articles = document.querySelectorAll('article');
    const tweets = Array.from(articles).slice(0, 10).map(article => {
      const text = article.innerText.substring(0, 200);
      const time = article.querySelector('time')?.getAttribute('datetime') || '';
      return { text, time };
    });

    return {
      title: document.title,
      url: window.location.href,
      tweetCount: articles.length,
      tweets
    };
  });

  console.log(`✅ Profile loaded: ${data.title}`);
  console.log(`📊 Tweets found: ${data.tweetCount}\n`);

  data.tweets.forEach((tweet, i) => {
    console.log(`--- Tweet ${i + 1} (${tweet.time}) ---`);
    console.log(`${tweet.text.substring(0, 120)}...\n`);
  });

  await page.screenshot({ path: `twitter-${username}.png` });
  console.log(`📸 Screenshot saved: twitter-${username}.png\n`);

  await browser.close();
}

scrapeTwitterProfile(username).catch(console.error);
