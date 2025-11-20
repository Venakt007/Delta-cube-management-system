# Installation Checklist

Follow these steps in order to set up the Recruitment Management System.

## ✅ Pre-Installation

- [ ] Node.js installed (v16+) - Check with: `node --version`
- [ ] PostgreSQL installed - Check with: `psql --version`
- [ ] OpenAI account created at https://platform.openai.com/
- [ ] OpenAI API key obtained

## ✅ Database Setup

- [ ] PostgreSQL service is running
- [ ] Created database: `CREATE DATABASE recruitment_db;`
- [ ] Ran schema file: `psql -U postgres -d recruitment_db -f database.sql`
- [ ] Verified tables created: `psql -U postgres -d recruitment_db -c "\dt"`

## ✅ Configuration

- [ ] Copied `.env.example` to `.env` (or edited existing `.env`)
- [ ] Updated `DATABASE_URL` with your PostgreSQL credentials
- [ ] Added your `OPENAI_API_KEY`
- [ ] Changed `JWT_SECRET` to a random string
- [ ] Verified no extra spaces in `.env` values

## ✅ Dependencies

- [ ] Installed backend dependencies: `npm install`
- [ ] Installed frontend dependencies: `cd client && npm install`
- [ ] No error messages during installation

## ✅ First Run

- [ ] Started backend: `npm run dev`
- [ ] Backend running on port 5000 (check console)
- [ ] Started frontend in new terminal: `cd client && npm start`
- [ ] Frontend opened in browser at http://localhost:3000
- [ ] No error messages in either terminal

## ✅ Testing

- [ ] Public form loads at http://localhost:3000
- [ ] Login page loads at http://localhost:3000/login
- [ ] Can login with admin credentials (admin@recruitment.com / admin123)
- [ ] Admin dashboard loads successfully
- [ ] Can logout and login again

## ✅ Functionality Tests

### Test Public Form
- [ ] Fill out application form
- [ ] Upload a test resume (PDF)
- [ ] Upload a test ID proof (JPG/PDF)
- [ ] Submit form successfully
- [ ] See success message

### Test Admin Login
- [ ] Login as admin
- [ ] See the submitted application in "All Resumes" tab
- [ ] Can download the uploaded resume
- [ ] See parsed data (skills, experience, etc.)

### Test Recruiter Account
- [ ] Create recruiter account via API or admin panel
- [ ] Login as recruiter
- [ ] Upload test resumes (bulk upload)
- [ ] See uploaded resumes in dashboard
- [ ] Search by skill works

### Test Admin Features
- [ ] Login as admin
- [ ] See all resumes (form + recruiter uploads)
- [ ] Advanced filter works
- [ ] Paste job description in JD Matching tab
- [ ] See matched candidates with percentages
- [ ] Can download any resume

## ✅ Security

- [ ] Changed default admin password
- [ ] JWT_SECRET is unique and random
- [ ] Database password is secure
- [ ] `.env` file is in `.gitignore`
- [ ] Not committing sensitive data to git

## ✅ Production Ready (Optional)

- [ ] Set up cloud database (AWS RDS, Heroku Postgres)
- [ ] Set up file storage (AWS S3, Cloudflare R2)
- [ ] Configure domain name
- [ ] Set up SSL certificate
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure automated backups

## Common Issues & Solutions

### "Cannot connect to database"
- Check PostgreSQL is running: `pg_ctl status`
- Verify DATABASE_URL format: `postgresql://username:password@host:port/database`
- Check password has no special characters that need escaping

### "OpenAI API error"
- Verify API key is correct (no extra spaces)
- Check you have credits: https://platform.openai.com/account/usage
- Try a different model if GPT-4 access is limited

### "Port already in use"
- Change PORT in .env to 5001 or another free port
- Or stop the process using the port

### "Module not found"
- Run `npm install` again in root directory
- Run `npm install` again in client directory
- Delete node_modules and package-lock.json, then reinstall

### "Resume parsing not working"
- Check OpenAI API key is valid
- Verify file is PDF or DOCX format
- Check file size is under 5MB
- Look at backend console for error messages

### "Cannot upload files"
- Check uploads folder exists (create it manually if needed)
- Verify file permissions on uploads folder
- Check file type is allowed (.pdf, .doc, .docx)

## Need Help?

1. Check README.md for detailed documentation
2. Review SETUP_GUIDE.md for step-by-step instructions
3. Check PROJECT_SUMMARY.md for system overview
4. Look at console logs for error messages
5. Verify all environment variables are set correctly

## Success! 🎉

If all checkboxes are checked, your system is ready to use!

**Next Steps:**
1. Share the public form URL with candidates
2. Create recruiter accounts for your team
3. Start collecting and reviewing resumes
4. Use JD matching to find best candidates

**Remember:**
- Backup your database regularly
- Monitor OpenAI API usage and costs
- Keep dependencies updated for security
- Change default passwords immediately
