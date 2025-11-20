# System Architecture

Visual guide to understanding how the Recruitment Management System works.

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
├─────────────┬─────────────────┬──────────────────────────────┤
│  Candidates │   Recruiters    │         Admins               │
│  (Public)   │   (Logged In)   │      (Logged In)             │
└──────┬──────┴────────┬────────┴──────────┬───────────────────┘
       │               │                   │
       │               │                   │
       ▼               ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Application  │  │  Recruiter   │  │    Admin     │      │
│  │    Form      │  │  Dashboard   │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                    Port 3000                                 │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
                         │ REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js/Express)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   API Routes                          │   │
│  │  /api/auth  /api/applications  /api/admin           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Middleware                           │   │
│  │  Authentication  │  File Upload  │  Validation       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                Business Logic                         │   │
│  │  Resume Parser  │  JD Matcher  │  Filters           │   │
│  └──────────────────────────────────────────────────────┘   │
│                    Port 5000                                 │
└────────┬──────────────────────┬──────────────────────────────┘
         │                      │
         │                      │
         ▼                      ▼
┌──────────────────┐   ┌──────────────────┐
│   PostgreSQL     │   │   OpenAI API     │
│    Database      │   │   (GPT-4)        │
│                  │   │                  │
│  - users         │   │  - Parse resumes │
│  - applications  │   │  - Match JDs     │
└──────────────────┘   └──────────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. Public Application Submission

```
Candidate
    │
    │ 1. Fills form + uploads files
    ▼
Application Form (React)
    │
    │ 2. POST /api/applications/submit
    ▼
Backend API
    │
    ├─► 3. Save files to /uploads
    │
    ├─► 4. Extract text from resume
    │
    ├─► 5. Send to OpenAI for parsing
    │       │
    │       ▼
    │   OpenAI GPT-4
    │       │
    │       │ Returns parsed JSON
    │       ▼
    │   Backend receives parsed data
    │
    └─► 6. Save to database
            │
            ▼
        PostgreSQL
            │
            │ source: 'html_form'
            │ uploaded_by: NULL
            │ parsed_data: {...}
            ▼
        Success response
            │
            ▼
        Candidate sees confirmation
```

---

### 2. Recruiter Bulk Upload

```
Recruiter
    │
    │ 1. Logs in
    ▼
Login Page
    │
    │ 2. POST /api/auth/login
    ▼
Backend validates credentials
    │
    │ 3. Returns JWT token
    ▼
Recruiter Dashboard
    │
    │ 4. Selects multiple resumes
    ▼
Bulk Upload
    │
    │ 5. POST /api/applications/upload-bulk
    │    (with JWT token)
    ▼
Backend API
    │
    │ 6. Verify token & role
    ▼
For each resume:
    │
    ├─► 7. Save file
    │
    ├─► 8. Extract text
    │
    ├─► 9. Parse with OpenAI
    │       │
    │       ▼
    │   OpenAI GPT-4
    │       │
    │       ▼
    │   Parsed data
    │
    └─► 10. Save to database
            │
            │ source: 'dashboard'
            │ uploaded_by: recruiter_id
            │ parsed_data: {...}
            ▼
        PostgreSQL
            │
            ▼
        Success response
            │
            ▼
        Dashboard shows uploaded resumes
```

---

### 3. Admin JD Matching

```
Admin
    │
    │ 1. Logs in as admin
    ▼
Admin Dashboard
    │
    │ 2. Clicks "JD Matching" tab
    ▼
JD Matching Interface
    │
    │ 3. Pastes job description
    │
    │ 4. Clicks "Find Matching Candidates"
    ▼
POST /api/admin/jd-match
    │
    │ 5. Send JD to OpenAI
    ▼
OpenAI GPT-4
    │
    │ Analyzes JD and extracts:
    │ - Required skills
    │ - Preferred skills
    │ - Experience range
    │ - Location
    │ - Job type
    ▼
Backend receives JD analysis
    │
    │ 6. Query all resumes from database
    ▼
PostgreSQL
    │
    │ Returns all applications
    ▼
Backend
    │
    │ 7. For each resume:
    │    - Compare skills
    │    - Check experience match
    │    - Check location
    │    - Calculate match %
    │
    │ 8. Sort by match percentage
    ▼
Ranked results
    │
    │ Returns to frontend
    ▼
Admin Dashboard
    │
    │ Displays:
    │ - Match percentage
    │ - Matching skills (green)
    │ - Missing skills (red)
    │ - Uploader info
    │ - Download link
    ▼
Admin reviews candidates
```

---

## 🗄️ Database Schema

```
┌─────────────────────────────────────────┐
│              USERS TABLE                 │
├─────────────────────────────────────────┤
│ id (PK)          │ SERIAL                │
│ email            │ VARCHAR(255) UNIQUE   │
│ password         │ VARCHAR(255)          │
│ role             │ VARCHAR(50)           │
│                  │ ('admin', 'recruiter')│
│ name             │ VARCHAR(255)          │
│ created_at       │ TIMESTAMP             │
└─────────────────────────────────────────┘
                    │
                    │ 1:N relationship
                    │
                    ▼
┌─────────────────────────────────────────┐
│          APPLICATIONS TABLE              │
├─────────────────────────────────────────┤
│ id (PK)          │ SERIAL                │
│ name             │ VARCHAR(255)          │
│ email            │ VARCHAR(255)          │
│ phone            │ VARCHAR(50)           │
│ linkedin         │ VARCHAR(500)          │
│ technology       │ VARCHAR(100)          │
│ primary_skill    │ VARCHAR(100)          │
│ secondary_skill  │ VARCHAR(100)          │
│ location         │ VARCHAR(100)          │
│ experience_years │ DECIMAL(4,1)          │
│ resume_url       │ VARCHAR(500)          │
│ id_proof_url     │ VARCHAR(500)          │
│ source           │ VARCHAR(50)           │
│                  │ ('html_form',         │
│                  │  'dashboard')         │
│ uploaded_by (FK) │ INTEGER → users.id    │
│ parsed_data      │ JSONB                 │
│                  │ {                     │
│                  │   skills: [],         │
│                  │   education: [],      │
│                  │   certifications: [], │
│                  │   ...                 │
│                  │ }                     │
│ created_at       │ TIMESTAMP             │
└─────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
User enters credentials
        │
        ▼
POST /api/auth/login
        │
        ▼
Backend checks database
        │
        ├─► User not found → 401 Error
        │
        ├─► Password wrong → 401 Error
        │
        └─► Valid credentials
                │
                ▼
        Generate JWT token
                │
                │ Token contains:
                │ - user.id
                │ - user.role
                │ - expiry (7 days)
                │
                ▼
        Return token to frontend
                │
                ▼
        Frontend stores in localStorage
                │
                ▼
        All future requests include:
        Authorization: Bearer <token>
                │
                ▼
        Backend middleware verifies token
                │
                ├─► Invalid → 401 Error
                │
                ├─► Expired → 401 Error
                │
                └─► Valid
                        │
                        ▼
                Check role permissions
                        │
                        ├─► Admin route + recruiter role → 403 Error
                        │
                        └─► Correct role → Allow access
```

---

## 🎯 Role-Based Access Control

```
┌──────────────────────────────────────────────────────────┐
│                    PUBLIC (No Auth)                       │
├──────────────────────────────────────────────────────────┤
│  ✅ View application form                                │
│  ✅ Submit application                                   │
│  ✅ View login page                                      │
│  ❌ Access dashboards                                    │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                  RECRUITER (Auth Required)                │
├──────────────────────────────────────────────────────────┤
│  ✅ All public access                                    │
│  ✅ Upload bulk resumes                                  │
│  ✅ View own uploaded resumes                            │
│  ✅ Search own resumes                                   │
│  ✅ Download own resumes                                 │
│  ❌ View other recruiters' resumes                       │
│  ❌ View form submissions                                │
│  ❌ Access admin features                                │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                   ADMIN (Auth Required)                   │
├──────────────────────────────────────────────────────────┤
│  ✅ All recruiter access                                 │
│  ✅ View ALL resumes (form + all recruiters)             │
│  ✅ Advanced filtering                                   │
│  ✅ JD matching                                          │
│  ✅ See who uploaded each resume                         │
│  ✅ Download any resume                                  │
│  ✅ View system statistics                               │
│  ✅ Manage all data                                      │
└──────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Resume Parsing Flow

```
Resume File (PDF/DOCX)
        │
        ▼
Extract Text
        │
        ├─► PDF → pdf-parse library
        │
        └─► DOCX → mammoth library
                │
                ▼
        Plain text content
                │
                ▼
        Construct prompt for OpenAI:
        "Parse this resume and extract:
         - name
         - email
         - phone
         - skills (array)
         - experience_years
         - education
         - certifications
         - location
         - availability
         - summary"
                │
                ▼
        POST to OpenAI API
        (GPT-4 model)
                │
                ▼
        OpenAI processes text
                │
                ▼
        Returns structured JSON:
        {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890",
          "skills": ["React", "Node.js", ...],
          "experience_years": 5,
          "education": ["BS Computer Science"],
          "certifications": ["AWS Certified"],
          "location": "New York",
          "availability": "Immediate",
          "summary": "..."
        }
                │
                ▼
        Store in database
        (parsed_data column)
                │
                ▼
        Available for searching
        and matching
```

---

## 🎯 JD Matching Algorithm

```
Job Description Text
        │
        ▼
Send to OpenAI for analysis
        │
        ▼
Extract requirements:
        │
        ├─► Required skills: ["React", "Node.js", "SQL"]
        ├─► Preferred skills: ["AWS", "Docker"]
        ├─► Min experience: 3 years
        ├─► Max experience: 7 years
        ├─► Location: "Remote"
        └─► Job type: "Full-time"
                │
                ▼
Query all resumes from database
                │
                ▼
For each resume, calculate match:
        │
        ├─► Skills Match (60% weight)
        │   │
        │   ├─► Count matching required skills
        │   ├─► Count matching preferred skills
        │   └─► Calculate: (matches / total) * 60
        │
        ├─► Experience Match (30% weight)
        │   │
        │   ├─► Check if in range (min-max)
        │   ├─► If yes: 30 points
        │   ├─► If close: 20-25 points
        │   └─► If far: 0-15 points
        │
        └─► Location Match (10% weight)
            │
            ├─► Exact match: 10 points
            ├─► Partial match: 5 points
            └─► No match: 0 points
                │
                ▼
        Total Score = Skills + Experience + Location
                │
                ▼
        Convert to percentage (0-100%)
                │
                ▼
        Sort candidates by percentage
                │
                ▼
        Return ranked list with:
        - Match percentage
        - Matching skills
        - Missing skills
        - Experience match status
```

---

## 📁 File Storage Flow

```
User uploads file
        │
        ▼
Multer middleware
        │
        ├─► Validate file type
        │   (PDF, DOCX, JPG, PNG)
        │
        ├─► Validate file size
        │   (< 5MB)
        │
        └─► Generate unique filename
            (fieldname-timestamp-random.ext)
                │
                ▼
        Save to /uploads folder
                │
                ▼
        Store file path in database
        (/uploads/resume-123456789.pdf)
                │
                ▼
        Return file URL to frontend
                │
                ▼
        Frontend can download via:
        http://localhost:5000/uploads/resume-123456789.pdf
```

---

## 🔄 Request/Response Cycle

```
Frontend (React)
        │
        │ 1. User action (click, submit)
        ▼
API Call (Axios)
        │
        │ 2. HTTP Request
        │    - Method: GET/POST/PUT/DELETE
        │    - Headers: Authorization, Content-Type
        │    - Body: JSON data or FormData
        ▼
Backend (Express)
        │
        │ 3. Route matching
        ▼
Middleware Chain
        │
        ├─► CORS check
        ├─► Body parsing
        ├─► Authentication (if protected)
        └─► Authorization (role check)
                │
                ▼
        Route Handler
                │
                ├─► Validate input
                ├─► Business logic
                ├─► Database queries
                ├─► External API calls (OpenAI)
                └─► File operations
                        │
                        ▼
                Response
                        │
                        │ 4. HTTP Response
                        │    - Status: 200, 201, 400, 401, 500
                        │    - Body: JSON data
                        ▼
                Frontend receives response
                        │
                        ├─► Success: Update UI
                        └─► Error: Show error message
```

---

## 🌐 Deployment Architecture (Production)

```
                    Internet
                        │
                        ▼
                ┌───────────────┐
                │   CloudFlare  │
                │   (CDN + SSL) │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │  Load Balancer│
                └───────┬───────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
    ┌───────┐      ┌───────┐      ┌───────┐
    │Server1│      │Server2│      │Server3│
    │Node.js│      │Node.js│      │Node.js│
    └───┬───┘      └───┬───┘      └───┬───┘
        │              │              │
        └──────────────┼──────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    ┌────────┐    ┌────────┐    ┌────────┐
    │  RDS   │    │   S3   │    │ OpenAI │
    │Postgres│    │ Files  │    │  API   │
    └────────┘    └────────┘    └────────┘
```

---

## 📊 Performance Optimization

```
Request comes in
        │
        ▼
┌─────────────────┐
│  Rate Limiting  │ ← Prevent abuse
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Compression    │ ← Reduce response size
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Caching        │ ← Cache frequent queries
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Database       │ ← Indexed queries
│  Connection     │ ← Connection pooling
│  Pool           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Response       │ ← Fast delivery
└─────────────────┘
```

---

## 🔒 Security Layers

```
┌─────────────────────────────────────────┐
│         Layer 1: Network                 │
│  - HTTPS/SSL                             │
│  - Firewall rules                        │
│  - DDoS protection                       │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Layer 2: Application             │
│  - CORS policy                           │
│  - Rate limiting                         │
│  - Input validation                      │
│  - SQL injection prevention              │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Layer 3: Authentication          │
│  - JWT tokens                            │
│  - Password hashing (bcrypt)             │
│  - Token expiration                      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Layer 4: Authorization           │
│  - Role-based access control             │
│  - Resource ownership checks             │
│  - Permission validation                 │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Layer 5: Data                    │
│  - Database encryption                   │
│  - Secure file storage                   │
│  - Regular backups                       │
└─────────────────────────────────────────┘
```

---

This architecture ensures a secure, scalable, and maintainable recruitment management system!
