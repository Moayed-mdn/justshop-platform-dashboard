# Phase 2 Testing Guide

## 🧪 How to Test Phase 2

### Prerequisites
- Frontend running on `http://localhost:3001`
- Backend running on `http://localhost:8000` (optional for now)

---

## Test Scenarios

### Scenario 1: Sign-In Page UI
**Without backend running**

1. Navigate to `http://localhost:3001`
2. Should redirect to `/en/sign-in` automatically
3. Verify sign-in form renders:
   - ✅ Email input field
   - ✅ Password input field (with show/hide toggle)
   - ✅ Sign In button
   - ✅ Language switcher (top-right)
   - ✅ Theme toggle (top-right)

**Expected**: Beautiful centered sign-in card

---

### Scenario 2: Form Validation
**Test client-side validation**

1. Leave both fields empty → Click "Sign In"
2. Should show validation errors:
   - ✅ "Please enter a valid email address"
   - ✅ "Password is required"

3. Enter invalid email (e.g., "test") → Click "Sign In"
4. Should show:
   - ✅ "Please enter a valid email address"

**Expected**: Red error messages below fields

---

### Scenario 3: Password Visibility Toggle

1. Enter password in password field
2. Click the eye icon
3. Should toggle between:
   - 👁️ Show password (text visible)
   - 👁️‍🗨️ Hide password (dots/asterisks)

**Expected**: Password visibility toggles

---

### Scenario 4: Loading State

1. Enter valid email: `admin@example.com`
2. Enter any password: `password123`
3. Click "Sign In"
4. Should show:
   - ✅ Button disabled
   - ✅ Spinner icon
   - ✅ Text changes to "Signing in..."

**Expected**: Loading state during submission

---

### Scenario 5: Language Switching on Sign-In Page

1. Click language switcher → Select "العربية"
2. Should change:
   - ✅ Form labels to Arabic
   - ✅ Button text to Arabic
   - ✅ RTL layout (form aligns right)

3. Switch back to English
4. Should return to LTR layout

**Expected**: Bilingual sign-in form works

---

### Scenario 6: Theme Toggle on Sign-In Page

1. Click theme toggle → Select "Dark"
2. Should show dark background

3. Click theme toggle → Select "Light"  
4. Should show light/white background

**Expected**: Dark mode works on sign-in page

---

### Scenario 7: Dashboard Shell (Mock User)
**After attempting sign-in**

Since we don't have backend yet, you'll see an error toast. To see the dashboard:

**Option A: Temporary Bypass (for testing)**
1. Comment out the redirect check in middleware (we'll do this next)

**Option B: Wait for Backend Integration**
- The sign-in will work once backend is running
- Backend needs to be at `http://localhost:8000`
- Endpoint: `POST /api/v1/users/login`

For now, let's test the dashboard UI by creating a temporary bypass:

---

## Testing Dashboard Shell (Without Auth)

Let me create a temporary page to view the dashboard:

**Steps:**
1. Navigate directly to: `http://localhost:3001/en`
2. Should see:
   - ✅ Sidebar on the left with navigation
   - ✅ Header on top with user menu
   - ✅ Main content area
   - ✅ Collapsible sidebar (click arrow)
   - ✅ User avatar/menu (top-right)

---

### Scenario 8: Sidebar Navigation

1. Check sidebar items:
   - ✅ Home
   - ✅ Users
   - ✅ Stores  
   - ✅ CMS
   - ✅ Audit Logs
   - ✅ Feature Flags
   - ✅ Leads

2. Click collapse arrow (◀️)
3. Sidebar should minimize to icons only

4. Click expand arrow (▶️)
5. Sidebar should expand back

**Expected**: Sidebar collapses/expands smoothly

---

### Scenario 9: User Menu

1. Click user avatar (top-right corner)
2. Should show dropdown with:
   - ✅ User name: "Admin User"
   - ✅ Email: "admin@example.com"
   - ✅ Sign Out button

3. Click "Sign Out"
4. Should redirect back to sign-in page

**Expected**: User menu works and sign-out redirects

---

### Scenario 10: Language Switch in Dashboard

1. In dashboard, click language switcher
2. Switch to Arabic
3. Should change:
   - ✅ Sidebar labels to Arabic
   - ✅ Navigation items to Arabic
   - ✅ Header elements to Arabic
   - ✅ Layout flips to RTL

**Expected**: Dashboard fully bilingual with RTL

---

### Scenario 11: Responsive Design

1. Resize browser to mobile width (< 768px)
2. Should show:
   - ✅ Hamburger menu icon
   - ✅ Sidebar hidden by default
   - ✅ Content full width

3. Click hamburger menu
4. Should toggle sidebar on mobile

**Expected**: Mobile-responsive dashboard

---

## Backend Integration (Optional)

### If Laravel Backend is Running:

**Test Credentials** (check your Laravel backend):
```
Email: admin@example.com
Password: password (or whatever is seeded)
```

**Expected Flow:**
1. Enter credentials on sign-in page
2. Click "Sign In"
3. Backend returns httpOnly cookie
4. Frontend redirects to dashboard
5. User info appears in header
6. Sign out clears cookie and redirects

---

## Known Behaviors (Expected)

✅ **Without backend**: Sign-in will show error toast (expected)
✅ **Mock user data**: Dashboard shows "Admin User" (hardcoded for now)
✅ **No real auth**: Can access dashboard directly (will be fixed with middleware)

---

## Next Steps

**Phase 3** will add:
- Real user data from backend
- Protected routes (middleware)
- Dashboard analytics and KPIs
- Real-time statistics

---

## Troubleshooting

### Issue: Can't see sign-in page
- Clear browser cache
- Check URL: should be `/en/sign-in` or `/ar/sign-in`

### Issue: Form validation not working
- Check browser console for errors
- Refresh page

### Issue: Translation errors
- Run `npm run dev` to restart server
- Clear `.next` cache if needed

### Issue: Sidebar not collapsing
- Check browser console for errors
- Clear localStorage: `localStorage.clear()`

---

## Summary Checklist

- [ ] Sign-in page renders correctly
- [ ] Form validation works
- [ ] Password toggle works
- [ ] Loading state shows during submission
- [ ] Language switching works (English ⇄ Arabic)
- [ ] RTL layout works for Arabic
- [ ] Theme toggle works (Light/Dark)
- [ ] Dashboard shell renders (sidebar + header)
- [ ] Sidebar collapses/expands
- [ ] User menu works
- [ ] Sign-out redirects to sign-in
- [ ] Mobile responsive
- [ ] No console errors

**All checked?** ✅ Phase 2 is working perfectly!
