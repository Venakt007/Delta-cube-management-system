# Quick Reference Guide

## 🚀 Quick Commands

### Installation
```bash
npm run setup              # Install all dependencies (backend + frontend)
```

### Running the Application
```bash
# Option 1: Run both together (requires concurrently)
npm run dev-all

# Option 2: Run separately (recommended for Windows)
# Terminal 1:
npm run dev

# Terminal 2:
npm run client
```

### Database
```bash
# Create database
psql -U postgres -c "CREATE DATABASE recruitment_db"

# Run schema
psql -U postgres -d recruitment_db -f database.sql

# Create test users
npm run create-users
```

## 🔑 Default Login Credentials

### Admin
```
Email: admin@recruitment.com
Password: admin123
```

### Test Recruiter (after running create-users script)
```
Email: recruiter@test.com
Password: recruiter123
```

## 🌐 URLs

- **Public Form:** http://localhost:3000
- **Login Page:** http://localhost:3000/login
- **Recruiter Dashboard:** http://localhost:3000/recruiter
- **Admin Dashboard:** http://localhost:3000/admin
- **Backend API:** http://localhost:5000

## 📋 API Endpoints Quick Reference

### Public
```
POST /api/applications/submit
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Recruiter (requires token)
```
POST /api/applications/upload-bulk
GET  /api/applications/my-resumes
GET  /api/applications/my-resumes/search?skill=react
```

### Admin (requires admin token)
```
GET  /api/admin/resumes
GET  /api/admin/resumes/filter?skills=react,node&experience_min=2
POST /api/admin/jd-match
GET  /api/admin/stats
```

## 🔧 Environment Variables

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/recruitment_db
JWT_SECRET=your_secret_key
OPENAI_API_KEY=sk-...
NODE_ENV=development
```

## 📁 File Upload Limits

- **Resume:** PDF, DOC, DOCX (max 5MB)
- **ID Proof:** PDF, JPG, JPEG, PNG (max 5MB)
- **Bulk Upload:** Up to 20 files at once

## 🎯 User Roles & Permissions

| Feature | Public | Recruiter | Admin |
|---------|--------|-----------|-------|
| Submit application form | ✅ | ✅ | ✅ |
| Upload bulk resumes | ❌ | ✅ | ✅ |
| View own uploads | ❌ | ✅ | ✅ |
| View all resumes | ❌ | ❌ | ✅ |
| Advanced filters | ❌ | ❌ | ✅ |
| JD matching | ❌ | ❌ | ✅ |

## 🤖 AI Features

### Resume Parsing
- Extracts: name, email, phone, skills, experience, education, certifications
- Works with any resume format/template
- Supports PDF and DOCX
- Cost: ~$0.03 per resume (GPT-4)

### JD Matching
- Analyzes job descriptions
- Matches candidates by skills and experience
- Returns match percentage (0-100%)
- Shows matching and missing skills
- Cost: ~$0.05 per JD analysis

## 🐛 Common Issues

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_ctl status

# Restart PostgreSQL (Windows)
net stop postgresql-x64-14
net start postgresql-x64-14
```

### Port Already in Use
```bash
# Change port in .env
PORT=5001
```

### OpenAI API Error
- Check API key is correct
- Verify you have credits at https://platform.openai.com/account/usage
- Ensure no extra spaces in .env

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# For frontend
cd client
rm -rf node_modules package-lock.json
npm install
```

## 📊 Database Schema Quick View

### users
- id, email, password, role, name, created_at

### applications
- id, name, email, phone, linkedin
- technology, primary_skill, secondary_skill
- location, experience_years
- resume_url, id_proof_url
- source (html_form/dashboard)
- uploaded_by (user_id)
- parsed_data (JSON)
- created_at

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET
- [ ] Keep .env file private
- [ ] Use HTTPS in production
- [ ] Regular database backups
- [ ] Monitor API usage
- [ ] Update dependencies regularly

## 📦 Production Deployment

### Environment Variables (Production)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db?ssl=true
JWT_SECRET=very_long_random_string
OPENAI_API_KEY=sk-...
PORT=5000
```

### Build Frontend
```bash
cd client
npm run build
cd ..
```

### Start Production Server
```bash
npm start
```

## 💡 Tips & Tricks

### Create New Admin
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@admin.com","password":"pass123","name":"New Admin","role":"admin"}'
```

### Create New Recruiter
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@recruiter.com","password":"pass123","name":"New Recruiter","role":"recruiter"}'
```

### Test API with Token
```bash
# 1. Login and get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@recruitment.com","password":"admin123"}'

# 2. Use token in requests
curl http://localhost:5000/api/admin/resumes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Check Database
```bash
# Connect to database
psql -U postgres -d recruitment_db

# View all users
SELECT id, email, name, role FROM users;

# View all applications
SELECT id, name, email, source, uploaded_by FROM applications;

# Count resumes by source
SELECT source, COUNT(*) FROM applications GROUP BY source;
```

## 📈 Monitoring

### Check System Health
```
GET http://localhost:5000/health
```

### View Logs
- Backend logs: Check terminal running `npm run dev`
- Frontend logs: Check browser console (F12)
- Database logs: Check PostgreSQL logs

## 🎨 Customization

### Change Colors (Tailwind)
Edit files in `client/src/pages/`:
- `bg-blue-600` → `bg-purple-600`
- `text-blue-700` → `text-purple-700`

### Add Form Fields
Edit `client/src/pages/ApplicationForm.js`:
1. Add field to formData state
2. Add input element
3. Update API endpoint to handle new field
4. Add column to database if needed

### Modify Technology Options
Edit dropdown in `ApplicationForm.js`:
```jsx
<option value="Your Technology">Your Technology</option>
```

## 📞 Support

- **Documentation:** README.md
- **Setup Guide:** SETUP_GUIDE.md
- **Project Overview:** PROJECT_SUMMARY.md
- **Installation Help:** INSTALLATION_CHECKLIST.md

## 🎓 Learning Resources

- **React:** https://react.dev/
- **Express:** https://expressjs.com/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **OpenAI API:** https://platform.openai.com/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs

---

**Remember:** Always backup your database before making changes!
