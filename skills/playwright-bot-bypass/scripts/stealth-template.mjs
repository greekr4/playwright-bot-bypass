#!/usr/bin/env node
/**
 * Stealth Browser Template
 * Reusable template for bot-detection-free browser automation
 *
 * Usage:
 *   import { createStealthBrowser } from './stealth-template.mjs';
 *   const { browser, context, page } = await createStealthBrowser();
 */

import { chromium } from 'rebrowser-playwright';

/**
 * Create a stealth browser instance that bypasses bot detection
 * @param {Object} options - Configuration options
 * @param {boolean} options.headless - Run in headless mode (default: false, recommended: false)
 * @param {Object} options.viewport - Viewport size (default: { width: 1280, height: 800 })
 * @param {string} options.userAgent - Custom user agent (optional)
 * @returns {Promise<{browser, context, page}>}
 */
export async function createStealthBrowser(options = {}) {
  const {
    headless = false,
    viewport = { width: 1280, height: 800 },
    userAgent = null
  } = options;

  const browser = await chromium.launch({
    headless,
    channel: 'chrome',
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox'
    ]
  });

  const contextOptions = { viewport };
  if (userAgent) {
    contextOptions.userAgent = userAgent;
  }

  const context = await browser.newContext(contextOptions);

  // Apply stealth patches
  await context.addInitScript(() => {
    // Remove webdriver property
    delete Object.getPrototypeOf(navigator).webdriver;

    // Add chrome runtime if missing
    if (!window.chrome) {
      window.chrome = {};
    }
    if (!window.chrome.runtime) {
      window.chrome.runtime = {
        PlatformOs: { MAC: 'mac', WIN: 'win', ANDROID: 'android', CROS: 'cros', LINUX: 'linux', OPENBSD: 'openbsd' },
        PlatformArch: { ARM: 'arm', X86_32: 'x86-32', X86_64: 'x86-64' },
        PlatformNaclArch: { ARM: 'arm', X86_32: 'x86-32', X86_64: 'x86-64' },
        RequestUpdateCheckStatus: { THROTTLED: 'throttled', NO_UPDATE: 'no_update', UPDATE_AVAILABLE: 'update_available' },
        OnInstalledReason: { INSTALL: 'install', UPDATE: 'update', CHROME_UPDATE: 'chrome_update', SHARED_MODULE_UPDATE: 'shared_module_update' },
        OnRestartRequiredReason: { APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic' }
      };
    }
  });

  const page = await context.newPage();

  return { browser, context, page };
}

/**
 * Add human-like delays between actions
 * @param {number} min - Minimum delay in ms
 * @param {number} max - Maximum delay in ms
 */
export function humanDelay(min = 100, max = 500) {
  return new Promise(resolve => {
    const delay = Math.random() * (max - min) + min;
    setTimeout(resolve, delay);
  });
}

/**
 * Type text with human-like speed
 * @param {Page} page - Playwright page
 * @param {string} selector - Element selector
 * @param {string} text - Text to type
 */
export async function humanType(page, selector, text) {
  await page.click(selector);
  for (const char of text) {
    await page.keyboard.type(char);
    await humanDelay(50, 150);
  }
}

// CLI: Run directly to test
const scriptPath = process.argv[1]?.replace(/\\/g, '/');
if (import.meta.url === `file://${scriptPath}` || import.meta.url === `file:///${scriptPath}`) {
  console.log('Testing stealth browser...');
  const { browser, page } = await createStealthBrowser();
  await page.goto('https://bot.sannysoft.com');
  console.log('Browser opened. Check results in the browser window.');
  console.log('Press Ctrl+C to close.');
}
