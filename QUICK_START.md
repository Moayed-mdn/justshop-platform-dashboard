# Quick Start Guide

## 🚀 Start the Dashboard (30 seconds)

### 1. Navigate to the Project
```bash
cd /home/leader/projects/laravel/v3/tenant/laratenant-backend/platform-dashboard
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
```
http://localhost:3000
```

The app will automatically redirect to `http://localhost:3000/en` (English).

---

## ✅ What to Test (Checkpoint 1)

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

## 🎯 Expected Results

✅ **All features work correctly**
✅ **No console errors**
✅ **Build successful**

---

## 🐛 If Something Goes Wrong

### Issue: Port 3000 in use
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
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

- **README.md** - Complete project documentation
- **docs/ARCHITECTURE.md** - Architecture patterns
- **docs/DEVELOPMENT.md** - Development workflow
- **docs/API_INTEGRATION.md** - Backend integration
- **CHANGELOG.md** - Version history
- **PHASE_1_COMPLETE.md** - Phase 1 summary

---

## 🎉 Phase 1 Complete!

Ready to test! Let me know once you've verified everything works, and we'll move to Phase 2.
