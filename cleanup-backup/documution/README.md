# Recruitment Management System

AI-Powered Resume Management & Matching System with role-based access control.

## Features

### Public Application Form
- Candidates can submit applications with resume and ID proof
- Auto-parsing of resumes using AI (GPT-4)
- Fields: Name, Email, Phone, LinkedIn, Technology, Skills, Location, Experience

### Recruiter Dashboard
- Bulk resume upload (up to 20 files at once)
- Automatic resume parsing and data extraction
- View only own uploaded resumes
- Search and filter by skills and experience
- Download resumes

### Admin Panel
- View ALL resumes (form submissions + all recruiter uploads)
- Advanced filtering by skills, experience, location, technology
- Job Description (JD) matching with AI
- Match percentage calculation
- See who uploaded each resume
- Download any resume

## Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL database
- JWT authentication
- OpenAI GPT-4 for resume parsing
- Multer for file uploads

**Frontend:**
- React.js
- React Router
- Tailwind CSS
- Axios

## Installation

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- OpenAI API key

### Setup Steps

1. **Clone and Install Dependencies**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

2. **Database Setup**
```bash
# Create PostgreSQL database
psql -U postgres

# In psql:
CREATE DATABASE recruitment_db;
\q

# Run the database schema
psql -U postgres -d recruitment_db -f database.sql
```

3. **Environment Configuration**
```bash
# Copy example env file
copy .env.example .env

# Edit .env and add your credentials:
# - DATABASE_URL
# - JWT_SECRET
# - OPENAI_API_KEY
```

4. **Create Admin User**
```bash
# The database.sql already includes a default admin
# Email: admin@recruitment.com
# Password: admin123

# Or create a new admin via API:
# POST /api/auth/register
# Body: { "email": "your@email.com", "password": "yourpass", "name": "Your Name", "role": "admin" }
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Mode

```bash
# Build frontend
cd client
npm run build
cd ..

# Start backend (serves frontend build)
npm start
```

## Usage

### For Candidates
1. Visit http://localhost:3000
2. Fill out the application form
3. Upload resume and ID proof
4. Submit

### For Recruiters
1. Visit http://localhost:3000/login
2. Login with recruiter credentials
3. Upload resumes in bulk
4. View and search your uploaded resumes

### For Admins
1. Visit http://localhost:3000/login
2. Login with admin credentials
3. View all resumes from all sources
4. Use advanced filters
5. Paste job descriptions for AI matching

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Applications
- `POST /api/applications/submit` - Public form submission
- `POST /api/applications/upload-bulk` - Bulk resume upload (Recruiter)
- `GET /api/applications/my-resumes` - Get recruiter's resumes
- `GET /api/applications/my-resumes/search` - Search own resumes

### Admin
- `GET /api/admin/resumes` - Get all resumes
- `GET /api/admin/resumes/filter` - Advanced filter
- `POST /api/admin/jd-match` - JD matching
- `GET /api/admin/stats` - Statistics

## Resume Parsing

The system uses OpenAI GPT-4 to parse resumes and extract:
- Name, Email, Phone
- Skills (array)
- Years of experience
- Education
- Certifications
- Location
- Availability
- Professional summary

Works with any resume format (PDF, DOCX) and template.

## JD Matching Algorithm

The AI analyzes job descriptions and matches candidates based on:
- **Skills (60% weight):** Required and preferred skills matching
- **Experience (30% weight):** Years of experience range
- **Location (10% weight):** Location preference

Results are ranked by match percentage with detailed breakdown.

## Security Features

- JWT-based authentication
- Role-based access control (Admin, Recruiter, Public)
- Password hashing with bcrypt
- File type validation
- File size limits (5MB)
- SQL injection prevention
- CORS protection

## Troubleshooting

**Database connection error:**
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify database exists

**Resume parsing fails:**
- Check OPENAI_API_KEY in .env
- Ensure API key has credits
- Check file format (PDF/DOCX only)

**File upload fails:**
- Check uploads folder exists
- Verify file size < 5MB
- Check file type is allowed

## License

MIT
