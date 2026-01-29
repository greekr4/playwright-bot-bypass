# playwright-bot-bypass

Claude Code skill to bypass bot detection using `rebrowser-playwright` (Node.js) or `undetected-chromedriver` (Python).

## Installation

```
npx skills add greekr4/playwright-bot-bypass
```

## Features

- ✅ Pass bot.sannysoft.com all tests
- ✅ Google search without CAPTCHA
- ✅ Real GPU fingerprint (Apple M2, etc.)
- ✅ WebDriver property removed
- ✅ Works with Node.js and Python

## Test Results

| Environment | bot.sannysoft.com | Google Search |
|-------------|-------------------|---------------|
| Standard Playwright | ❌ Detected | ❌ CAPTCHA |
| **rebrowser-playwright** | ✅ Pass | ✅ Works |
| playwright-stealth (Python) | ✅ Pass | ❌ CAPTCHA |
| **undetected-chromedriver** | ✅ Pass | ✅ Works |

## Quick Start

### Node.js (Recommended)

```bash
npm install rebrowser-playwright
```

```javascript
import { chromium } from 'rebrowser-playwright';

const browser = await chromium.launch({
  headless: false,
  channel: 'chrome'
});

const context = await browser.newContext();
await context.addInitScript(() => {
  delete Object.getPrototypeOf(navigator).webdriver;
});

const page = await context.newPage();
await page.goto('https://google.com');
```

### Python

```bash
pip install undetected-chromedriver
```

```python
import undetected_chromedriver as uc

driver = uc.Chrome(version_main=144)  # Match your Chrome version
driver.get('https://google.com')
```

## Why It Works

| Detection Point | Standard Playwright | This Solution |
|-----------------|---------------------|---------------|
| WebDriver | `navigator.webdriver = true` | Removed |
| WebGL Renderer | SwiftShader (software) | Real GPU |
| User Agent | HeadlessChrome | Clean Chrome |

## Scripts Included

- `scripts/bot-detection-test.mjs` - Test if bypass is working
- `scripts/stealth-template.mjs` - Reusable stealth browser template
- `examples/stealth-google-search.mjs` - Google search example
- `examples/ab-test.mjs` - Compare detected vs stealth

## License

MIT
