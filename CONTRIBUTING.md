# Contributing

Thanks for your interest in contributing to playwright-bot-bypass!

## How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/playwright-bot-bypass.git

# Install dependencies
npm install rebrowser-playwright

# Run bot detection test
node skills/playwright-bot-bypass/scripts/bot-detection-test.mjs
```

## Guidelines

- Test your changes against [bot.sannysoft.com](https://bot.sannysoft.com) before submitting
- Keep PRs focused on a single change
- Update README if adding new features or scripts

## Reporting Bugs

Open an [issue](https://github.com/greekr4/playwright-bot-bypass/issues) with:
- What you expected to happen
- What actually happened
- Your environment (OS, Node.js version, browser)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
