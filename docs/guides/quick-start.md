# Quick Start Guide

> Rewritten from the root-level `QUICK_START.md` during doc cleanup. The original had a
> machine-specific path (`/home/leader/projects/...`), pointed at port 3000, and linked to
> `docs/ARCHITECTURE.md` / `docs/DEVELOPMENT.md` / `docs/API_INTEGRATION.md` files that don't
> exist in this project — those are fixed below. See the reorganization notes in the main
> chat response for details.

## 🚀 Start the Dashboard

### 1. Navigate to the Project

```bash
cd platform-dashboard
```

### 2. Start the Development Server

```bash
npm run dev
```

### 3. Open in Browser

```
http://localhost:3001
```

The app will automatically redirect to `http://localhost:3001/en` (English).

> The port is **3001**, set by the `dev` script in `package.json` (`next dev --webpack -p 3001`).
> `.env.example` still shows `3000` for `NEXT_PUBLIC_APP_URL` — worth aligning that with the real
> port if you regenerate `.env.local` from it.

---

## ✅ What to Test

### 1. Page Loads
- ✅ No errors in browser console
- ✅ Page renders with header and content

### 2. Dark Mode
- Click the sun/moon icon in the header
- Toggle between Light, Dark, and System modes
- ✅ Theme persists after page refresh

### 3. Language Switching
- Click the language icon (🌐) in the header
- Switch to **العربية** (Arabic)
- ✅ Page layout flips to RTL (right-to-left)
- ✅ Text displays in Arabic
- Switch back to **English**
- ✅ Page layout returns to LTR (left-to-right)

### 4. Responsive Design
- Resize browser window
- Test on mobile view (< 768px)
- ✅ Layout adapts to screen size

### 5. Build Test

```bash
npm run build
```
- ✅ Build completes without errors

---

## 🐛 If Something Goes Wrong

### Issue: Port 3001 in use
```bash
# Kill the process
lsof -ti:3001 | xargs kill -9

# Or run on a different port
npm run dev -- -p 3005
```

### Issue: Build fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Issue: Translation not working
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 📚 Documentation

- **README.md** - Project overview and setup
- **CHANGELOG.md** - Version history
- **docs/features/** - What's implemented, feature by feature
- **docs/guides/** - How-to guides (this file, CSS utilities, plan management)
- **docs/archive/** - Historical build logs (phase-by-phase and feature-by-feature)

> Note: several older docs (`CHANGELOG.md`, `PHASE_1_COMPLETE.md`, `SESSION_SUMMARY.md`) reference
> `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT.md`, `docs/API_INTEGRATION.md`, and `docs/TESTING.md`.
> None of these were present in the files provided for this cleanup — they were either never
> created or just not included in the upload. Worth tracking down or recreating if they're needed.
