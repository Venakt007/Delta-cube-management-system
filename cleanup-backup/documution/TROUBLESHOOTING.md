# Troubleshooting Guide

Common issues and solutions for the Recruitment Management System.

## ✅ FIXED: Module Not Found Errors

### Issue
```
ERROR in ./src/App.js
Module not found: Error: Can't resolve 'react-router-dom'
```

### Solution
```bash
cd client
npm install react-router-dom axios
```

**Status:** ✅ FIXED - Dependencies installed successfully!

---

## 🔧 Common Issues & Solutions

### 1. Frontend Won't Start

**Error:** `npm start` fails in client folder

**Solutions:**
```bash
# Delete node_modules and reinstall
cd client
rmdir /s /q node_modules
del package-lock.json
npm install

# Or use npm cache clean
npm cache clean --force
npm install
```

---

### 2. Backend Won't Start

**Error:** `npm run dev` fails

**Check:**
```bash
# 1. Verify Node.js version
node --version
# Should be 16+ (18+ recommended)

# 2. Install backend dependencies
npm install

# 3. Check .env file exists
dir .env

# 4. Verify PostgreSQL is running
psql -U postgres -c "SELECT version();"
```

---

### 3. Database Connection Error

**Error:** `Cannot connect to database`

**Solutions:**

#### Check PostgreSQL is Running
```bash
# Windows - Check service
sc query postgresql-x64-14

# Start if stopped
net start postgresql-x64-14
```

#### Verify DATABASE_URL in .env
```env
# Correct format:
DATABASE_URL=postgresql://username:password@localhost:5432/recruitment_db

# Common mistakes:
# ❌ Missing password
# ❌ Wrong port (default is 5432)
# ❌ Database name typo
# ❌ Extra spaces
```

#### Test Connection
```bash
psql -U postgres -d recruitment_db
```

---

### 4. OpenAI API Errors

**Error:** `OpenAI API error` or `Invalid API key`

**Solutions:**

#### Verify API Key
```bash
# Check .env file
type .env

# Should have:
OPENAI_API_KEY=sk-...
```

#### Check API Key is Valid
1. Go to https://platform.openai.com/api-keys
2. Verify key exists and is active
3. Check you have credits: https://platform.openai.com/account/usage

#### Test API Key
```bash
curl https://api.openai.com/v1/models ^
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

### 5. File Upload Errors

**Error:** `Cannot upload files` or `ENOENT: no such file or directory`

**Solutions:**

#### Create uploads folder
```bash
mkdir uploads
```

#### Check folder permissions
```bash
# Windows - Give full control
icacls uploads /grant Everyone:F
```

---

### 6. Port Already in Use

**Error:** `Port 5000 is already in use`

**Solutions:**

#### Option 1: Change Port
Edit `.env`:
```env
PORT=5001
```

#### Option 2: Kill Process
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

---

### 7. CORS Errors

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solutions:**

#### Verify proxy in client/package.json
```json
{
  "proxy": "http://localhost:5000"
}
```

#### Restart both servers
```bash
# Stop both (Ctrl+C)
# Start backend
npm run dev

# Start frontend (new terminal)
cd client
npm start
```

---

### 8. JWT Token Errors

**Error:** `Invalid token` or `No authentication token`

**Solutions:**

#### Clear localStorage
Open browser console (F12) and run:
```javascript
localStorage.clear();
```

Then login again.

#### Verify JWT_SECRET in .env
```env
JWT_SECRET=your_secret_key_here
# Should be at least 32 characters
```

---

### 9. Resume Parsing Not Working

**Error:** Resume uploaded but no data extracted

**Check:**

#### 1. OpenAI API Key
```bash
# Verify in .env
type .env | findstr OPENAI_API_KEY
```

#### 2. File Format
- Only PDF and DOCX supported
- File size must be < 5MB

#### 3. Backend Logs
Check terminal running `npm run dev` for errors

#### 4. Test with Simple Resume
Try uploading a simple, well-formatted resume first

---

### 10. Build Errors

**Error:** `npm run build` fails

**Solutions:**

#### Clear cache and rebuild
```bash
cd client
npm cache clean --force
rmdir /s /q node_modules
rmdir /s /q build
del package-lock.json
npm install
npm run build
```

---

## 🔍 Debugging Tips

### Check Backend Logs
```bash
# Terminal running npm run dev shows:
# - API requests
# - Database queries
# - Errors
# - Resume parsing results
```

### Check Frontend Logs
```bash
# Browser Console (F12) shows:
# - API responses
# - JavaScript errors
# - Network requests
```

### Check Database
```bash
# Connect to database
psql -U postgres -d recruitment_db

# Check tables exist
\dt

# Check users
SELECT * FROM users;

# Check applications
SELECT * FROM applications;

# Exit
\q
```

---

## 📊 Verify Installation

### Backend Checklist
```bash
# 1. Dependencies installed
npm list express pg jsonwebtoken

# 2. .env file configured
type .env

# 3. Database exists
psql -U postgres -l | findstr recruitment_db

# 4. Server starts
npm run dev
# Should see: "Server running on port 5000"
```

### Frontend Checklist
```bash
cd client

# 1. Dependencies installed
npm list react react-router-dom axios

# 2. Proxy configured
type package.json | findstr proxy

# 3. Server starts
npm start
# Should open browser at http://localhost:3000
```

---

## 🆘 Still Having Issues?

### 1. Check All Environment Variables
```bash
type .env
```

Should have:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/recruitment_db
JWT_SECRET=your_secret_key
OPENAI_API_KEY=sk-...
NODE_ENV=development
```

### 2. Verify All Services Running
```bash
# PostgreSQL
sc query postgresql-x64-14

# Backend
# Check terminal running npm run dev

# Frontend
# Check terminal running npm start
```

### 3. Test Each Component

#### Test Database
```bash
psql -U postgres -d recruitment_db -c "SELECT 1;"
```

#### Test Backend
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok"}
```

#### Test Frontend
Open browser: http://localhost:3000
Should see application form

---

## 📝 Error Log Template

When reporting issues, include:

```
**Error Message:**
[Copy exact error message]

**What I Was Doing:**
[Describe the action]

**Environment:**
- OS: Windows
- Node Version: [run: node --version]
- PostgreSQL Version: [run: psql --version]

**Steps Taken:**
1. [What you tried]
2. [What happened]

**Logs:**
[Copy relevant logs from terminal]

**Screenshots:**
[If applicable]
```

---

## ✅ Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| Module not found | `cd client && npm install` |
| Database error | Check PostgreSQL is running |
| Port in use | Change PORT in .env |
| API key error | Verify OPENAI_API_KEY in .env |
| Upload error | Create uploads folder |
| CORS error | Restart both servers |
| Token error | Clear localStorage |
| Build error | Delete node_modules, reinstall |

---

## 🔄 Complete Reset (Last Resort)

If nothing works, start fresh:

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Delete node_modules
rmdir /s /q node_modules
rmdir /s /q client\node_modules

# 3. Delete package-lock files
del package-lock.json
del client\package-lock.json

# 4. Reinstall everything
npm install
cd client
npm install
cd ..

# 5. Verify .env configuration
type .env

# 6. Restart database
net stop postgresql-x64-14
net start postgresql-x64-14

# 7. Start backend
npm run dev

# 8. Start frontend (new terminal)
cd client
npm start
```

---

## 📞 Getting Help

1. **Check Documentation**
   - README.md
   - SETUP_GUIDE.md
   - FAQ.md

2. **Review Logs**
   - Backend terminal
   - Browser console (F12)
   - PostgreSQL logs

3. **Search Online**
   - Stack Overflow
   - GitHub Issues
   - Developer forums

4. **Hire Help**
   - Freelance developers
   - Consulting services

---

**Remember:** Most issues are configuration-related. Double-check your .env file and ensure all services are running!
