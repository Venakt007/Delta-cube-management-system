# Quick Start Guide

Get the Recruitment Management System running in 5 minutes.

## Prerequisites
- Node.js 14+ installed
- PostgreSQL 12+ installed and running
- Git installed

## Installation Steps

### 1. Clone and Install
```bash
git clone <repository-url>
cd recruitment-system
npm run setup
```

### 2. Configure Database
```bash
# Create database
createdb recruitment_db

# Or using psql
psql -U postgres
CREATE DATABASE recruitment_db;
\q
```

### 3. Set Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/recruitment_db
JWT_SECRET=your_random_secret_key_min_32_chars
OPENAI_API_KEY=sk-your-openai-api-key
NODE_ENV=development
```

### 4. Run Migrations
```bash
npm run migrate
```

### 5. Create Admin User
```bash
npm run create-admin
```

Follow the prompts to create your admin account.

### 6. Start Application
```bash
# Development mode (auto-reload)
npm run dev-all

# Or start separately
# Terminal 1
npm run dev

# Terminal 2
npm run client
```

### 7. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Login
Use the credentials you created in step 5.

## Test the System

### 1. Login as Admin
- Go to http://localhost:3000/login
- Enter your admin credentials

### 2. Create a Recruiter
- Navigate to Admin Dashboard
- Create a new recruiter user

### 3. Test Application Form
- Go to http://localhost:3000
- Fill out the public application form
- Submit with a sample resume

### 4. Upload Resumes
- Login as recruiter
- Go to "Upload Resumes" tab
- Upload sample PDF/DOCX resumes

## Common Issues

### Port Already in Use
```bash
# Change PORT in .env
PORT=5001
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready

# Verify credentials in .env
DATABASE_URL=postgresql://user:pass@localhost:5432/recruitment_db
```

### OpenAI API Errors
- Verify OPENAI_API_KEY in .env
- Check API key has credits
- Resume parsing will use fallback if API fails

## Next Steps

1. Read [README.md](README.md) for detailed documentation
2. Check [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
3. Customize technology categories
4. Add more location options
5. Configure email notifications (if needed)

## Support

For issues:
1. Check logs: `npm run dev` shows detailed errors
2. Verify all environment variables are set
3. Ensure database migrations ran successfully
4. Contact development team with error details

---

**Ready to go!** 🚀
