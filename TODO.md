# Fix TODO List

## 1. MongoDB ECONNRESET Fix
- [ ] Update `Server/server.js` with robust mongoose connection options
- [ ] Add connection event handlers (error, disconnected, reconnected)
- [ ] Move `ensureDefaultTemplates()` to run once at startup
- [ ] Update `Server/routes/templates.js` to remove per-request seeding
- [ ] Update `Server/scripts/seedTemplates.js` with connection options
- [ ] Test server restart and verify template fetching works

## 2. Git Push Fix
- [ ] Check if `node_modules` is in `.gitignore`
- [ ] Remove `node_modules` from git tracking if committed
- [ ] Provide solution for large push timeout

