# Recruitment Management System

A comprehensive full-stack recruitment management application built with React, Node.js, Express, and PostgreSQL. Features AI-powered resume parsing, job description matching, and multi-role access control.

## 🚀 Features

### Core Functionality
- **Public Application Form** - HTML form for candidates to submit applications with referral tracking
- **AI Resume Parser** - Automatic extraction of candidate information from PDF/DOCX resumes
- **Multi-Role System** - Admin and Recruiter roles with different permissions
- **Job Description Matching** - AI-powered matching of candidates to job requirements
- **Bulk Operations** - Upload and manage multiple resumes simultaneously
- **Status Tracking** - Recruitment and placement status management
- **Location Autocomplete** - Smart location suggestions for 100+ cities (India, USA, UK, Australia)
- **Dynamic Technology Management** - Add and manage technology categories

### User Roles

#### Admin
- View all resumes across all recruiters
- Filter by onboarded candidates
- Access to complete system analytics
- Manage all recruitment data

#### Recruiter
- Upload and manage own resumes
- Manual entry with profile duplication check
- Edit and update candidate information
- Track recruitment and placement status
- Access social media applications
- Bulk delete operations
- JD matching for targeted searches

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## � ️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd recruitment-system
```

### 2. Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd client
npm install
cd ..
```

### 3. Database Setup

Create PostgreSQL database:
```sql
CREATE DATABASE recruitment_db;
```

Run migrations:
```bash
node run-migration.js
node run-field-migration.js
```

### 4. Environment Configuration

Create `.env` file in root directory:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/recruitment_db
JWT_SECRET=your_secure_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
```

**Important:** Replace placeholders with actual values:
- `username` and `password` - Your PostgreSQL credentials
- `JWT_SECRET` - Generate a strong random string
- `OPENAI_API_KEY` - Your OpenAI API key for resume parsing

### 5. Create Admin User

```bash
node scripts/createAdmin.js
```

Follow the prompts to create your admin account.

## 🚀 Running the Application

### Development Mode
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

### Production Mode
```bash
# Build frontend
cd client
npm run build
cd ..

# Start backend (serves built frontend)
npm start
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
recruitment-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main app component
│   └── package.json
├── config/                # Configuration files
│   └── db.js             # Database connection
├── middleware/           # Express middleware
│   ├── auth.js          # Authentication
│   └── upload.js        # File upload handling
├── migrations/          # Database migrations
├── routes/             # API routes
│   ├── admin.js       # Admin endpoints
│   ├── applications.js # Application management
│   ├── auth.js        # Authentication
│   ├── locations.js   # Location autocomplete
│   └── technologies.js # Technology management
├── scripts/           # Utility scripts
│   └── createAdmin.js # Admin creation
├── uploads/          # Uploaded files storage
├── utils/           # Utility functions
│   └── resumeParser.js # AI resume parsing
├── .env            # Environment variables
├── .env.example    # Environment template
├── server.js       # Express server
└── package.json    # Dependencies

```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- SQL injection prevention with parameterized queries
- File upload validation and sanitization
- Environment variable protection

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Applications
- `POST /api/applications/submit` - Public form submission
- `POST /api/applications/upload-bulk` - Bulk resume upload (200 max)
- `POST /api/applications/manual-entry` - Manual candidate entry
- `GET /api/applications/my-resumes` - Get recruiter's resumes
- `GET /api/applications/social-media-resumes` - Get public form submissions
- `PATCH /api/applications/resumes/:id/status` - Update status
- `DELETE /api/applications/delete/:id` - Delete single resume
- `POST /api/applications/bulk-delete` - Delete multiple resumes
- `POST /api/applications/jd-match-social` - JD matching

### Admin
- `GET /api/admin/all-resumes` - Get all resumes
- `GET /api/admin/onboarded` - Get onboarded candidates

### Technologies
- `GET /api/technologies` - Get all technologies
- `POST /api/technologies` - Add new technology

### Locations
- `GET /api/locations/autocomplete` - Location suggestions

## 🔧 Configuration

### Resume Upload Limits
- Maximum file size: 5MB per file
- Supported formats: PDF, DOC, DOCX
- Bulk upload: Up to 200 files at once

### Database Schema

**Main Tables:**
- `users` - User accounts (admin, recruiter)
- `applications` - Candidate resumes and data
- `technologies` - Technology categories

**Key Fields:**
- Recruitment status: Pending, On Hold, Rejected, Submitted, Interview scheduled, Closed
- Placement status: Bench, Onboarded
- Source tracking: dashboard, html_form, referral sources

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Verify connection string in .env
DATABASE_URL=postgresql://user:pass@localhost:5432/recruitment_db
```

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Or change PORT in .env
PORT=5001
```

### Resume Parsing Errors
- Ensure OPENAI_API_KEY is set in .env
- Check resume file format (PDF/DOCX only)
- Verify file size is under 5MB

## 📊 Features in Detail

### AI Resume Parsing
- Tiered parsing system (Tier 1: Structured, Tier 2: Regex)
- Extracts: Name, Email, Phone, Skills, Experience, Location
- Confidence scoring
- Fallback mechanisms for parsing failures

### Job Description Matching
- Keyword extraction from JD
- Skill matching with percentage scores
- Sorted by match relevance
- Highlights matching and missing skills

### Bulk Operations
- Upload up to 200 resumes simultaneously
- Automatic parsing for each resume
- Error handling with detailed feedback
- Bulk delete with confirmation

### Location Autocomplete
- 100+ pre-loaded cities (India, USA, UK, Australia)
- Instant local filtering
- No external API dependencies
- Remote work options included

## 🔄 Maintenance

### Database Backups
```bash
# Backup database
pg_dump recruitment_db > backup_$(date +%Y%m%d).sql

# Restore database
psql recruitment_db < backup_20250119.sql
```

### Clear Old Uploads
```bash
# Remove files older than 90 days
find uploads/ -type f -mtime +90 -delete
```

## 📝 License

This project is proprietary software. All rights reserved.

## 👥 Support

For issues or questions, contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Status:** Production Ready
