# Quick Setup Guide

## Step-by-Step Installation

### 1. Install PostgreSQL
**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Install with default settings
- Remember the password you set for 'postgres' user

### 2. Create Database
Open Command Prompt and run:
```cmd
psql -U postgres
```
Enter your password, then:
```sql
CREATE DATABASE recruitment_db;
\q
```

### 3. Run Database Schema
```cmd
psql -U postgres -d recruitment_db -f database.sql
```

### 4. Get OpenAI API Key
1. Go to https://platform.openai.com/
2. Sign up or login
3. Go to API Keys section
4. Create new secret key
5. Copy the key

### 5. Configure Environment
Edit the `.env` file:
```
DATABASE_URL=postgresql://postgres:123456@localhost:5432/recruitment_db
OPENAI_API_KEY=your_actual_openai_key_here
JWT_SECRET=change_this_to_random_string
```

### 6. Install Dependencies
```cmd
npm install
cd client
npm install
cd ..
```

### 7. Start the Application

**Terminal 1 (Backend):**
```cmd
npm run dev
```

**Terminal 2 (Frontend):**
```cmd
cd client
npm start
```

### 8. Access the Application
- Application Form: http://localhost:3000
- Login Page: http://localhost:3000/login

### 9. Default Admin Login
```
Email: admin@recruitment.com
Password: admin123
```

**IMPORTANT:** Change this password after first login!

## Creating Additional Users

### Create Recruiter Account
Use API or create via admin panel:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recruiter@company.com",
    "password": "securepassword",
    "name": "John Recruiter",
    "role": "recruiter"
  }'
```

## Testing the System

### 1. Test Public Form
- Go to http://localhost:3000
- Fill out the form
- Upload a sample resume (PDF)
- Submit

### 2. Test Recruiter Dashboard
- Login as recruiter
- Upload multiple resumes
- Search by skills
- View parsed data

### 3. Test Admin Panel
- Login as admin
- View all resumes
- Try advanced filters
- Paste a job description for matching

## Common Issues

**"Cannot connect to database"**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check password is correct

**"OpenAI API error"**
- Verify API key is correct
- Check you have credits in OpenAI account
- Ensure no extra spaces in .env file

**"Port already in use"**
- Change PORT in .env to different number
- Or stop other applications using port 5000/3000

**"Resume parsing not working"**
- Check OpenAI API key
- Verify file is PDF or DOCX
- Check file size < 5MB

## Next Steps

1. Change default admin password
2. Create recruiter accounts
3. Customize technology and skill options
4. Add your company branding
5. Deploy to production server

## Production Deployment

For production:
1. Use environment variables (not .env file)
2. Use PostgreSQL on cloud (AWS RDS, Heroku Postgres)
3. Use file storage service (AWS S3)
4. Enable HTTPS
5. Set NODE_ENV=production
6. Use process manager (PM2)

## Support

For issues or questions:
- Check README.md for detailed documentation
- Review API endpoints
- Check console logs for errors
