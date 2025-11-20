# 🤖 AI Prompts to Build Complete Recruitment System

Use these prompts with ChatGPT, Claude, or any AI assistant to build the entire project from scratch.

---

## 📋 Project Overview

**Project Name:** AI-Powered Recruitment Management System

**Description:** A full-stack web application for managing job applications with AI-powered resume parsing, role-based access control, and intelligent candidate matching.

**Tech Stack:**
- Frontend: React.js + Tailwind CSS
- Backend: Node.js + Express.js
- Database: PostgreSQL
- AI: OpenAI GPT-3.5-turbo
- Authentication: JWT

---

## 🚀 Prompt Sequence (Use in Order)

### PROMPT 1: Project Setup & Database

```
Create a recruitment management system with the following requirements:

PROJECT STRUCTURE:
- Backend: Node.js + Express.js
- Frontend: React.js
- Database: PostgreSQL
- Authentication: JWT

STEP 1 - BACKEND SETUP:
Create the following files:

1. package.json with dependencies:
   - express, cors, dotenv, bcryptjs, jsonwebtoken
   - multer (file uploads), pg (PostgreSQL)
   - pdf-parse, mammoth (resume parsing)
   - axios (API calls)

2. .env file with:
   - PORT=5000
   - DATABASE_URL (PostgreSQL connection string)
   - JWT_SECRET
   - OPENAI_API_KEY
   - NODE_ENV=development

3. database.sql with two tables:
   
   USERS TABLE:
   - id (serial primary key)
   - email (unique, not null)
   - password (hashed, not null)
   - role (admin or recruiter)
   - name (not null)
   - created_at (timestamp)

   APPLICATIONS TABLE:
   - id (serial primary key)
   - name, email, phone, linkedin
   - technology, primary_skill, secondary_skill
   - location, experience_years
   - resume_url, id_proof_url
   - source (html_form or dashboard)
   - uploaded_by (foreign key to users)
   - parsed_data (JSONB for AI extracted data)
   - created_at (timestamp)

   Create indexes on: uploaded_by, source, parsed_data (GIN), experience_years

4. config/db.js - PostgreSQL connection pool

5. server.js - Express server with:
   - CORS enabled
   - JSON body parser
   - Static file serving for /uploads
   - Health check endpoint at /health

Provide complete, working code for all files.
```

---

### PROMPT 2: Authentication System

```
Add authentication to the recruitment system:

CREATE THESE FILES:

1. middleware/auth.js with:
   - auth() - Verify JWT token
   - isAdmin() - Check if user is admin
   - isRecruiterOrAdmin() - Check if user is recruiter or admin

2. routes/auth.js with endpoints:
   - POST /api/auth/register
     * Input: email, password, name, role
     * Validate role is 'admin' or 'recruiter'
     * Hash password with bcrypt (10 rounds)
     * Create user in database
     * Return user object and JWT token
   
   - POST /api/auth/login
     * Input: email, password
     * Find user by email
     * Compare password with bcrypt
     * Generate JWT token (expires in 7 days)
     * Return user object and JWT token

3. Update server.js to include auth routes:
   app.use('/api/auth', require('./routes/auth'));

Provide complete, working code with proper error handling.
```

---

### PROMPT 3: File Upload & Resume Parser

```
Add file upload and AI resume parsing:

CREATE THESE FILES:

1. middleware/upload.js using multer:
   - Save files to ./uploads folder
   - Generate unique filenames (timestamp + random)
   - Accept fields: 'resume', 'resumes' (bulk), 'id_proof'
   - File type validation:
     * resume/resumes: .pdf, .doc, .docx
     * id_proof: .pdf, .jpg, .jpeg, .png
   - File size limit: 5MB
   - Return error for invalid types

2. utils/resumeParser.js with:
   
   extractTextFromPDF(filePath):
   - Use pdf-parse library
   - Read file and extract text
   - Return text string

   extractTextFromDOCX(filePath):
   - Use mammoth library
   - Extract raw text
   - Return text string

   parseResumeWithAI(text):
   - Call OpenAI API (gpt-3.5-turbo model)
   - System prompt: "You are a resume parser. Extract structured information and return JSON only."
   - User prompt: "Parse this resume and extract: name, email, phone, location, skills (array), experience_years (number), education (array), certifications (array), availability, linkedin, summary"
   - Temperature: 0.3, max_tokens: 1000
   - Parse JSON response
   - On error, call parseResumeBasic() as fallback

   parseResumeBasic(text):
   - Use regex to extract:
     * Email: /[\w.-]+@[\w.-]+\.\w+/
     * Phone: /[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}/
     * Name: First line of text (if < 50 chars)
     * Skills: Match common tech keywords (JavaScript, Python, React, etc.)
     * Experience: /(\d+)\+?\s*years?\s*(of\s*)?experience/i
     * LinkedIn: /linkedin\.com\/in\/[\w-]+/i
   - Return structured object

   parseResume(filePath):
   - Detect file type (.pdf or .docx)
   - Extract text
   - Call parseResumeWithAI()
   - Return parsed data or null

Provide complete, working code with error handling and fallback.
```

---

### PROMPT 4: Application Routes (Public & Recruiter)

```
Create application management routes:

CREATE routes/applications.js with these endpoints:

1. POST /api/applications/submit (PUBLIC - no auth)
   - Accept form data with files (resume, id_proof)
   - Fields: name, email, phone, linkedin, technology, primary_skill, secondary_skill, location, experience_years
   - Save files to /uploads
   - Parse resume with AI
   - Insert into applications table with source='html_form', uploaded_by=NULL
   - Return success with application ID

2. POST /api/applications/upload-bulk (AUTH - recruiter/admin)
   - Accept multiple resume files (up to 20)
   - For each file:
     * Save to /uploads
     * Parse with AI
     * Extract name, email, phone, skills, experience
     * Insert into database with source='dashboard', uploaded_by=user.id
     * Track successes and errors
   - Return: { uploaded: count, uploadedResumes: [], errors: [] }

3. GET /api/applications/my-resumes (AUTH - recruiter/admin)
   - Query: SELECT * FROM applications WHERE uploaded_by = user.id
   - Order by created_at DESC
   - Return array of resumes

4. GET /api/applications/my-resumes/search (AUTH - recruiter/admin)
   - Query params: skill, experience_min, experience_max
   - Filter by uploaded_by = user.id
   - Search in primary_skill, secondary_skill, parsed_data
   - Return filtered results

5. POST /api/applications/check-profile (AUTH - recruiter/admin)
   - Input: name, email, phone
   - Query: Find existing application by email OR phone for this recruiter
   - Return: { exists: boolean, profile: {...} }

6. POST /api/applications/manual-entry (AUTH - recruiter/admin)
   - Accept form data with files
   - Input: all fields + action ('new', 'update', 'continue') + existing_id
   - If action='update': UPDATE existing record
   - If action='continue': Return existing ID
   - If action='new': INSERT new record
   - Parse resume if uploaded
   - Return success with ID

7. DELETE /api/applications/delete/:id (AUTH - recruiter/admin)
   - Verify resume belongs to user (uploaded_by = user.id)
   - DELETE from database
   - Return success

Update server.js:
app.use('/api/applications', require('./routes/applications'));

Provide complete code with proper authentication checks and error handling.
```

---

### PROMPT 5: Admin Routes & JD Matching

```
Create admin-only routes with AI job description matching:

CREATE routes/admin.js with:

1. GET /api/admin/resumes (AUTH - admin only)
   - Query: SELECT a.*, u.name as uploader_name, u.email as uploader_email
           FROM applications a
           LEFT JOIN users u ON a.uploaded_by = u.id
           ORDER BY a.created_at DESC
   - Return all resumes (form submissions + all recruiter uploads)

2. GET /api/admin/resumes/filter (AUTH - admin only)
   - Query params: skills, experience_min, experience_max, location, technology
   - Build dynamic SQL query with filters
   - Search in primary_skill, secondary_skill, parsed_data (JSONB)
   - Return filtered results

3. POST /api/admin/jd-match (AUTH - admin only)
   - Input: jobDescription (text)
   
   Step 1 - Analyze JD with AI:
   - Call OpenAI API
   - Extract: required_skills (array), preferred_skills (array), min_experience, max_experience, location, job_type
   - Return structured JD analysis

   Step 2 - Match against all resumes:
   - Get all applications from database
   - For each resume, calculate match score:
     * Skills match (60% weight):
       - Count matching required skills
       - Count matching preferred skills
       - Score = (matches / total) * 60
     * Experience match (30% weight):
       - If in range (min-max): 30 points
       - If close: 20-25 points
       - If far: 0-15 points
     * Location match (10% weight):
       - Exact match: 10 points
       - Partial: 5 points
       - No match: 0 points
   
   Step 3 - Return ranked results:
   - Sort by match percentage (highest first)
   - Include: matchPercentage, matchingSkills, missingSkills, experienceMatch
   - Include uploader information

4. GET /api/admin/stats (AUTH - admin only)
   - Query statistics:
     * Total applications
     * Form submissions count
     * Recruiter uploads count
     * Active recruiters count
   - Return stats object

Update server.js:
app.use('/api/admin', require('./routes/admin'));

Provide complete code with AI integration and matching algorithm.
```

---

### PROMPT 6: React Frontend Setup

```
Create React frontend for the recruitment system:

SETUP:
1. Create React app in /client folder
2. Install dependencies: react-router-dom, axios
3. Configure proxy in package.json: "proxy": "http://localhost:5000"
4. Use Tailwind CSS via CDN in public/index.html

CREATE THESE FILES:

1. client/src/App.js:
   - Use React Router
   - Routes:
     * / - ApplicationForm (public)
     * /login - Login page
     * /recruiter - RecruiterDashboard (protected, role='recruiter')
     * /admin - AdminDashboard (protected, role='admin')
   
   - ProtectedRoute component:
     * Check localStorage for token and user
     * Verify user role matches required role
     * Redirect to /login if not authorized

2. client/src/pages/Login.js:
   - Form with email and password
   - POST to /api/auth/login
   - Save token and user to localStorage
   - Navigate to /admin if admin, /recruiter if recruiter
   - Use window.location.href for navigation (forces reload)
   - Show error message if login fails

3. client/public/index.html:
   - Include Tailwind CSS CDN
   - Basic HTML structure with root div

Provide complete, working React code with routing and authentication.
```

---

### PROMPT 7: Public Application Form

```
Create the public application form page:

CREATE client/src/pages/ApplicationForm.js:

FEATURES:
- Form fields (all with Tailwind styling):
  * Full Name * (required)
  * Email * (required, type=email)
  * Contact Number * (required, type=tel)
  * LinkedIn Profile (optional, type=url)
  * Technology * (required, dropdown):
    - Options: Web Development, Mobile Development, Data Science, DevOps, Cloud Computing, AI/ML
  * Primary Skill * (required, text input)
  * Secondary Skill (optional, text input)
  * Location * (required, text input)
  * Years of Experience * (required, number, min=0, step=0.5)
  * Resume * (required, file input, accept=".pdf,.doc,.docx")
  * ID Proof * (required, file input, accept=".pdf,.jpg,.jpeg,.png")

- Form submission:
  * Create FormData object
  * Append all fields and files
  * POST to /api/applications/submit
  * Show success message (green)
  * Reset form on success
  * Show error message (red) on failure

- Styling:
  * Gradient background (blue to indigo)
  * White card with shadow
  * 2-column grid for fields
  * Responsive design
  * Focus states on inputs
  * Submit button with loading state

- Link to login page at bottom

Provide complete React component with form handling and validation.
```

---

### PROMPT 8: Recruiter Dashboard with Tabs

```
Create recruiter dashboard with tab-based navigation:

CREATE client/src/pages/RecruiterDashboard.js:

STRUCTURE:
- Navigation bar with: title, welcome message, logout button
- Three tabs: "Manual Entry", "Upload Resumes", "My Resumes"
- Tab content changes based on active tab

TAB 1 - MANUAL ENTRY:
- Step 1 (Blue box):
  * Fields: Name, Email, Phone (3 columns)
  * "Check if Profile Exists" button (purple, full width)
  * Shows after all 3 fields filled
  * POST to /api/applications/check-profile
  
  If profile exists:
  * Yellow alert box
  * Show existing profile details
  * Three buttons: "Continue with Old Profile", "Update to New Profile", "Cancel"
  
  If no profile:
  * Green alert box
  * Show "No Profile Found" message
  * Display Step 2

- Step 2 (Gray box):
  * Same fields as public form
  * Only shows if no existing profile or user chose to continue
  * POST to /api/applications/manual-entry
  * Include action ('new', 'update', 'continue')

TAB 2 - UPLOAD RESUMES:
- File input (multiple, accept .pdf/.doc/.docx)
- Upload tips section
- POST to /api/applications/upload-bulk
- Show detailed results:
  * Success count
  * List of failed files with errors
  * Color-coded messages (green/yellow/red)
- Progress indicator during upload

TAB 3 - MY RESUMES:
- Search bar (search by skill)
- Table with columns:
  * Name (with ⚠️ badge if parsing failed)
  * Email
  * Phone
  * Skills (as tags, max 3 shown)
  * Experience
  * Location
  * Actions (Download link + ❌ Delete button)
- Yellow row highlight for problematic resumes
- Delete with confirmation dialog
- GET from /api/applications/my-resumes
- DELETE to /api/applications/delete/:id

FUNCTIONS:
- fetchResumes() - Load resume list
- handleBulkUpload() - Upload multiple files
- handleCheckProfile() - Check for duplicates
- handleManualSubmit() - Submit manual entry
- handleDeleteResume() - Delete with confirmation
- handleSearch() - Search by skill
- handleLogout() - Clear localStorage and redirect

Provide complete React component with all tabs and functionality.
```

---

### PROMPT 9: Admin Dashboard with JD Matching

```
Create admin dashboard with advanced features:

CREATE client/src/pages/AdminDashboard.js:

STRUCTURE:
- Navigation bar with: title, welcome message, logout button
- Three tabs: "All Resumes", "Advanced Filter", "JD Matching"

TAB 1 - ALL RESUMES:
- Table showing ALL resumes (form + all recruiters)
- Columns:
  * Name
  * Email
  * Skills (as colored tags)
  * Experience
  * Source (badge: "Form" green or "Dashboard" purple)
  * Uploaded By (recruiter name or "Public")
  * Actions (Download link)
- GET from /api/admin/resumes
- Responsive table with hover effects

TAB 2 - ADVANCED FILTER:
- Filter inputs:
  * Skills (comma-separated)
  * Min Experience (number)
  * Max Experience (number)
  * Location (text)
  * Technology (text)
- "Apply Filters" and "Reset" buttons
- GET from /api/admin/resumes/filter with query params
- Display filtered results in table
- Show count of results

TAB 3 - JD MATCHING:
- Large textarea for job description
- "Find Matching Candidates" button
- POST to /api/admin/jd-match
- Display results table:
  * Match % (colored badge: green ≥70%, yellow ≥50%, red <50%)
  * Name
  * Matching Skills (green tags)
  * Missing Skills (red tags)
  * Experience
  * Uploaded By
  * Actions (Download)
- Sort by match percentage (highest first)
- Show loading state during analysis

FUNCTIONS:
- fetchAllResumes() - Load all resumes
- handleFilter() - Apply filters
- resetFilters() - Clear filters
- handleJDMatch() - Analyze JD and match
- handleLogout() - Clear localStorage and redirect

STYLING:
- Consistent with recruiter dashboard
- Tab navigation (blue active, white inactive)
- Color-coded badges and alerts
- Responsive design
- Loading indicators

Provide complete React component with all admin features.
```

---

### PROMPT 10: Final Integration & Testing

```
Complete the project integration:

1. UPDATE server.js to serve React build in production:
   ```javascript
   if (process.env.NODE_ENV === 'production') {
     app.use(express.static(path.join(__dirname, 'client/build')));
     app.get('*', (req, res) => {
       res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
     });
   }
   ```

2. CREATE scripts/createTestUsers.js:
   - Create default admin: admin@recruitment.com / admin123
   - Create test recruiters: recruiter@test.com / recruiter123
   - Hash passwords with bcrypt
   - Insert into users table

3. CREATE .gitignore:
   ```
   node_modules/
   .env
   uploads/
   *.log
   client/build/
   ```

4. CREATE README.md with:
   - Project description
   - Features list
   - Tech stack
   - Installation steps
   - Usage instructions
   - API endpoints
   - Default credentials

5. UPDATE package.json scripts:
   ```json
   {
     "start": "node server.js",
     "dev": "nodemon server.js",
     "client": "cd client && npm start",
     "setup-db": "node setup-everything.js",
     "create-users": "node scripts/createTestUsers.js"
   }
   ```

6. CREATE setup-everything.js:
   - Connect to database
   - Create tables if not exist
   - Create indexes
   - Create default admin user
   - Show success message

Provide all files with complete setup and documentation.
```

---

## 🎯 Usage Instructions

### How to Use These Prompts:

1. **Copy each prompt in order** (1 through 10)
2. **Paste into ChatGPT/Claude** or any AI assistant
3. **Wait for complete code** before moving to next prompt
4. **Save the generated files** in your project
5. **Test each section** before proceeding

### After All Prompts:

1. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install
   ```

2. **Setup database:**
   ```bash
   psql -U postgres -c "CREATE DATABASE recruitment_db;"
   psql -U postgres -d recruitment_db -f database.sql
   ```

3. **Configure .env:**
   - Add your PostgreSQL credentials
   - Add OpenAI API key
   - Set JWT secret

4. **Create admin user:**
   ```bash
   npm run create-users
   ```

5. **Start application:**
   ```bash
   # Terminal 1
   npm run dev
   
   # Terminal 2
   cd client && npm start
   ```

6. **Access:**
   - Frontend: http://localhost:3000
   - Login: admin@recruitment.com / admin123

---

## 📚 Additional Prompts (Optional Enhancements)

### PROMPT 11: Add Email Notifications
```
Add email notification system using Nodemailer:
- Send email when application is submitted
- Notify admin of new applications
- Send confirmation to candidates
- Configure SMTP settings in .env
```

### PROMPT 12: Add Export to CSV
```
Add CSV export functionality:
- Export filtered resumes to CSV
- Include all fields and parsed data
- Add download button in admin panel
- Use json2csv library
```

### PROMPT 13: Add Candidate Portal
```
Create candidate portal where applicants can:
- Check application status
- Update their information
- Upload new resume
- Track application progress
```

### PROMPT 14: Add Analytics Dashboard
```
Add analytics and statistics:
- Total applications over time (chart)
- Applications by technology (pie chart)
- Average experience by skill
- Top skills in demand
- Recruiter performance metrics
```

---

## ✅ Success Checklist

After completing all prompts, verify:

- [ ] Backend starts without errors
- [ ] Frontend loads successfully
- [ ] Can submit public application
- [ ] Can login as admin
- [ ] Can login as recruiter
- [ ] Resume upload works
- [ ] AI parsing extracts data
- [ ] Manual entry works
- [ ] Profile check works
- [ ] Delete function works
- [ ] Admin can see all resumes
- [ ] Filters work correctly
- [ ] JD matching works
- [ ] All tabs functional
- [ ] Responsive design works

---

## 🎓 Learning Path

If you want to understand the code:

1. **Start with backend** (Prompts 1-5)
2. **Then frontend** (Prompts 6-9)
3. **Finally integration** (Prompt 10)

Each prompt builds on the previous one, so follow the order!

---

## 💡 Tips

- **Test after each prompt** - Don't wait until the end
- **Save all files** - Keep organized folder structure
- **Read the code** - Understand what each part does
- **Customize** - Modify colors, fields, features as needed
- **Ask follow-ups** - If code doesn't work, ask AI to fix it

---

**Use these prompts to recreate the entire recruitment system from scratch with any AI assistant!** 🚀
