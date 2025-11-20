# Debug Login Issue - "Nothing Showing After Login"

## 🔍 Step-by-Step Debugging

### Step 1: Check Backend is Running

**Open Terminal 1 and run:**
```bash
npm run dev
```

**You should see:**
```
Server running on port 5000
Database connected successfully
```

**If not running, start it!**

---

### Step 2: Check Frontend is Running

**Open Terminal 2 and run:**
```bash
cd client
npm start
```

**You should see:**
```
Compiled successfully!
Local: http://localhost:3000
```

**Browser should open automatically**

---

### Step 3: Open Browser Console

1. Go to http://localhost:3000/login
2. Press **F12** to open Developer Tools
3. Click on **Console** tab
4. Keep it open

---

### Step 4: Try to Login

**Enter credentials:**
- Email: `admin@recruitment.com`
- Password: `123456`

**Click Login**

---

### Step 5: Check Console Messages

**You should see these messages in console:**
```
Attempting login with: admin@recruitment.com
Login response: {user: {...}, token: "..."}
User role: admin
Navigating to dashboard...
Redirecting to /admin
App - Token: exists
App - User: {id: 1, email: "admin@recruitment.com", name: "System Admin", role: "admin"}
App - Current path: /admin
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network Error" in Console

**Problem:** Backend not running or wrong port

**Solution:**
```bash
# Check backend is running on port 5000
npm run dev
```

**Check .env file:**
```env
PORT=5000
```

---

### Issue 2: "Invalid credentials" Error

**Problem:** Admin user not created or wrong password

**Solution:**
```bash
# Recreate admin user
npm run setup-db
```

**Then try login again with:**
- Email: `admin@recruitment.com`
- Password: `123456`

---

### Issue 3: Login Success but Blank Page

**Problem:** React routing issue or component error

**Check Console for Errors:**
- Look for red error messages
- Look for "Failed to compile" messages

**Common causes:**
- Missing dependencies
- Component syntax errors
- Import errors

**Solution:**
```bash
# Reinstall frontend dependencies
cd client
rm -rf node_modules
npm install
npm start
```

---

### Issue 4: Redirects Back to Login

**Problem:** Token not being saved or user role mismatch

**Check localStorage:**
1. Open Console (F12)
2. Go to **Application** tab
3. Click **Local Storage** → http://localhost:3000
4. Check for:
   - `token` (should have a long string)
   - `user` (should have JSON with role: "admin")

**If missing, clear and try again:**
```javascript
// In console, run:
localStorage.clear();
// Then login again
```

---

### Issue 5: "Cannot GET /admin" Error

**Problem:** React Router not handling the route

**Solution:**
1. Make sure you're accessing through React app (http://localhost:3000/login)
2. Not directly typing http://localhost:5000/admin
3. Frontend must be running on port 3000

---

## 🔧 Quick Fixes

### Fix 1: Restart Everything
```bash
# Stop both servers (Ctrl+C in both terminals)

# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

### Fix 2: Clear Browser Cache
1. Press **Ctrl+Shift+Delete**
2. Clear "Cached images and files"
3. Clear "Cookies and site data"
4. Refresh page

### Fix 3: Clear localStorage
```javascript
// In browser console (F12):
localStorage.clear();
location.reload();
```

### Fix 4: Check Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to login
4. Look for `/api/auth/login` request
5. Check if it returns 200 OK
6. Check response has `token` and `user`

---

## 📊 What Should Happen After Login

### Successful Login Flow:

1. **User enters credentials** → Click Login
2. **POST request** to `/api/auth/login`
3. **Backend validates** credentials
4. **Backend returns** `{user: {...}, token: "..."}`
5. **Frontend saves** to localStorage
6. **Frontend navigates** to `/admin` or `/recruiter`
7. **App.js checks** token and role
8. **Renders** AdminDashboard or RecruiterDashboard

---

## 🎯 Expected Behavior

### After Successful Login:

**For Admin:**
- URL changes to: `http://localhost:3000/admin`
- Page shows: "Admin Dashboard" header
- Shows: "Welcome, System Admin"
- Shows: Three tabs (All Resumes, Advanced Filter, JD Matching)

**For Recruiter:**
- URL changes to: `http://localhost:3000/recruiter`
- Page shows: "Recruiter Dashboard" header
- Shows: "Welcome, [Name]"
- Shows: Bulk upload section

---

## 🔍 Detailed Debugging Steps

### Check 1: Backend API Working
```bash
# Test login API directly
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@recruitment.com\",\"password\":\"123456\"}"
```

**Should return:**
```json
{
  "user": {
    "id": 1,
    "email": "admin@recruitment.com",
    "name": "System Admin",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Check 2: Database Has Admin User
```bash
npm run check-db
```

**Should show:**
```
✅ Admin user EXISTS in database!
✅ Password verification: SUCCESS
```

### Check 3: Frontend Can Reach Backend
```bash
# In browser console:
fetch('/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'admin@recruitment.com', password: '123456'})
})
.then(r => r.json())
.then(console.log)
```

---

## 📝 Checklist

Before asking for help, verify:

- [ ] Backend running (`npm run dev`)
- [ ] Frontend running (`cd client && npm start`)
- [ ] Database has admin user (`npm run check-db`)
- [ ] Browser console open (F12)
- [ ] No red errors in console
- [ ] Network tab shows successful login request
- [ ] localStorage has token and user
- [ ] Using correct credentials (admin@recruitment.com / 123456)
- [ ] Accessing via http://localhost:3000/login (not 5000)

---

## 🆘 Still Not Working?

### Share These Details:

1. **Console errors** (copy from F12 console)
2. **Network tab** (screenshot of /api/auth/login request)
3. **localStorage** (screenshot from Application tab)
4. **Backend logs** (copy from terminal running npm run dev)
5. **What you see** (blank page? error message? redirects?)

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Login button shows "Logging in..."
- ✅ No error message appears
- ✅ URL changes to /admin
- ✅ Admin Dashboard appears
- ✅ Shows "Welcome, System Admin"
- ✅ Shows three tabs
- ✅ Logout button visible

---

**Follow these steps and check the browser console - it will tell you exactly what's happening!**
