- [ ] Plan: remove backend-only pdf libraries that cause pdfjs/polyfill warnings during Render startup
- [ ] Edit Server/package.json to remove pdf-parse and pdfjs-dist
- [ ] Update Server/package-lock.json accordingly (run npm install in Server)
- [ ] Redeploy to Render and confirm startup errors/warnings are gone
- [ ] If PDF parsing is required, add lazy-loading and Node-safe pdfjs configuration instead of removing deps

