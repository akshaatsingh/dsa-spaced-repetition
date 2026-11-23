# Contributing to DSA Spaced Repetition

## How to report a bug / request a feature
- Open an **Issue** and use the appropriate template.

## Pull‑request workflow
1. Fork the repository.
2. Create a new branch (git checkout -b my-feature).
3. Make your changes.
4. Run 
pm install prettier && prettier --check \"**/*.js\" \"**/*.html\" \"**/*.css\" (or rely on the GitHub Action CI).
5. Push the branch to your fork and open a **Pull Request** against main.

## Code style
- Use **Prettier** formatting (4‑space indent, double‑quotes for strings).  
- No inline scripts; keep CSP‑compatible ES modules only.

Thanks for your help! 🎉
