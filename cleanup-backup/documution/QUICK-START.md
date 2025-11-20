# ⚡ Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies (2 min)
```bash
npm install
cd client && npm install && cd ..
```

### 2. Setup Database (1 min)
```bash
# Create database
psql -U postgres -c "CREATE DATABASE resume_management;"

# Setup tables
node setup-everything.js
```

### 3. Configure Environment (30 sec)
Create `.env` file:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/resume_management
JWT_SECRET=your_secret_key_change_this
OPENAI_API_KEY=your_openai_key_optional
```

### 4. Create Users (1 min)
```bash
node scripts/createAdmin.js
node scripts/createTestUsers.js
node create-system-admin.js
```

### 5. Start Application (30 sec)
```bash
npm run dev
```

## ✅ Done! Access Your Application

### Public Form
```
http://localhost:3000/
```

### Login Page
```
http://localhost:3000/login
```

## 🔐 Default Credentials

| Role | Email | Password | Dashboard URL |
|------|-------|----------|---------------|
| Admin | admin@recruitment.com | admin123 | /admin |
| Recruiter | recruiter@test.com | recruiter123 | /recruiter |
| System Admin | systemadmin@example.com | admin123 | /system-admin |

## 📱 Share Application Form

### With Referral Tracking:
```
LinkedIn:  http://localhost:3000/?ref=LinkedIn
Facebook:  http://localhost:3000/?ref=Facebook
Twitter:   http://localhost:3000/?ref=Twitter
Instagram: http://localhost:3000/?ref=Instagram
WhatsApp:  http://localhost:3000/?ref=WhatsApp
```

## 🎯 Quick Test

1. **Test Public Form:**
   - Go to `http://localhost:3000/`
   - Fill form and submit

2. **Test Recruiter:**
   - Login as recruiter
   - Upload a resume
   - Check "My Resumes" tab

3. **Test Admin:**
   - Login as admin
   - View all resumes
   - Try JD matching

4. **Test System Admin:**
   - Login as system admin
   - Upload resume
   - Check referral source

## 🆘 Quick Fixes

### Can't connect to database?
```bash
# Check PostgreSQL is running
pg_ctl status

# Restart if needed
pg_ctl restart
```

### Port already in use?
```bash
npx kill-port 5000
npx kill-port 3000
```

### Login not working?
```bash
# Recreate users
node scripts/createAdmin.js
```

## 📚 Full Documentation

For detailed information, see:
- **HOW-TO-RUN-PROJECT.md** - Complete setup guide
- **modules/PROJECT-OVERVIEW.md** - System architecture
- **modules/[1-4]/README.md** - Module-specific docs
- **SOCIAL-MEDIA-LINKS.md** - Referral tracking guide

---

**🎉 You're all set! Start managing resumes!**
