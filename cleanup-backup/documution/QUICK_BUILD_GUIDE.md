# ⚡ Quick Build Guide - One-Page Reference

## 🎯 Complete Project in 10 Prompts

Copy these prompts to ChatGPT/Claude in order:

---

### 1️⃣ DATABASE & SETUP
"Create Node.js + Express + PostgreSQL recruitment system. Setup: package.json with express, cors, pg, bcryptjs, jsonwebtoken, multer, pdf-parse, mammoth, axios. Database with users table (id, email, password, role, name) and applications table (id, name, email, phone, linkedin, technology, skills, location, experience_years, resume_url, source, uploaded_by, parsed_data JSONB). Include config/db.js and server.js with CORS and /health endpoint."

---

### 2️⃣ AUTHENTICATION
"Add JWT authentication. Create middleware/auth.js with auth(), isAdmin(), isRecruiterOrAdmin(). Create routes/auth.js with POST /register (hash password with bcrypt, create user, return JWT) and POST /login (verify password, return JWT expires 7 days). Include in server.js."

---

### 3️⃣ FILE UPLOAD & AI PARSER
"Create middleware/upload.js with multer (save to ./uploads, validate .pdf/.doc/.docx for resume, .pdf/.jpg/.png for id_proof, 5MB limit). Create utils/resumeParser.js with: extractTextFromPDF(), extractTextFromDOCX(), parseResumeWithAI() using OpenAI gpt-3.5-turbo to extract name/email/phone/skills/experience as JSON, parseResumeBasic() as regex fallback, parseResume() main function."

---

### 4️⃣ APPLICATION ROUTES
"Create routes/applications.js with: POST /submit (public form, parse resume, save with source='html_form'), POST /upload-bulk (auth, parse multiple resumes, return successes and errors), GET /my-resumes (auth, get user's uploads), GET /my-resumes/search (auth, filter by skill/experience), POST /check-profile (auth, find by email/phone), POST /manual-entry (auth, create/update with action parameter), DELETE /delete/:id (auth, verify ownership)."

---

### 5️⃣ ADMIN ROUTES & JD MATCHING
"Create routes/admin.js (admin only) with: GET /resumes (all with uploader names), GET /resumes/filter (by skills/experience/location), POST /jd-match (analyze JD with OpenAI, extract required_skills/experience, match all resumes with scoring: skills 60%, experience 30%, location 10%, return ranked by percentage), GET /stats (counts)."

---

### 6️⃣ REACT SETUP
"Create React app in /client with react-router-dom, axios. Setup App.js with routes: / (ApplicationForm public), /login (Login), /recruiter (protected), /admin (protected). Create ProtectedRoute component checking localStorage token and user role. Create Login.js with form, POST /api/auth/login, save to localStorage, navigate with window.location.href. Add Tailwind CDN to index.html."

---

### 7️⃣ PUBLIC FORM
"Create ApplicationForm.js with fields: name, email, phone, linkedin, technology (dropdown: Web/Mobile/Data Science/DevOps/Cloud/AI-ML), primary_skill, secondary_skill, location, experience_years, resume file, id_proof file. POST FormData to /api/applications/submit. Gradient blue background, white card, 2-column grid, Tailwind styling, success/error messages, form reset on success."

---

### 8️⃣ RECRUITER DASHBOARD
"Create RecruiterDashboard.js with 3 tabs: 1) Manual Entry: Step 1 blue box (name/email/phone + purple 'Check Profile' button, POST /check-profile, show yellow alert if exists with Continue/Update/Cancel buttons, green alert if not), Step 2 gray box (full form, POST /manual-entry). 2) Upload Resumes: multiple file input, POST /upload-bulk, show success count and error list with colors. 3) My Resumes: table with name/email/skills/experience/actions, yellow highlight for 'Unknown', ❌ delete button with confirmation, search by skill. Logout button."

---

### 9️⃣ ADMIN DASHBOARD
"Create AdminDashboard.js with 3 tabs: 1) All Resumes: table showing all (form + recruiters) with name/email/skills/experience/source badge/uploader/download. 2) Advanced Filter: inputs for skills/experience/location/technology, apply filters button, show filtered table. 3) JD Matching: textarea for job description, POST /jd-match, show table with match % badge (green≥70%, yellow≥50%, red<50%), matching skills (green tags), missing skills (red tags), sorted by percentage. Consistent styling with tabs."

---

### 🔟 INTEGRATION & SETUP
"Create: 1) scripts/createTestUsers.js (create admin@recruitment.com/admin123 and recruiter@test.com/recruiter123 with bcrypt). 2) setup-everything.js (create tables, indexes, default admin). 3) Update server.js to serve React build in production. 4) .gitignore (node_modules, .env, uploads). 5) README.md with installation steps. 6) package.json scripts: dev, client, setup-db, create-users."

---

## 🚀 After All Prompts

```bash
# 1. Install
npm install
cd client && npm install

# 2. Database
psql -U postgres -c "CREATE DATABASE recruitment_db;"
node setup-everything.js

# 3. Configure .env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/recruitment_db
JWT_SECRET=your_secret_key
OPENAI_API_KEY=sk-your-key

# 4. Start
npm run dev          # Terminal 1
cd client && npm start   # Terminal 2

# 5. Access
http://localhost:3000
Login: admin@recruitment.com / admin123
```

---

## ✅ Features Checklist

- [ ] Public application form
- [ ] Recruiter login & dashboard
- [ ] Admin login & dashboard
- [ ] Bulk resume upload
- [ ] AI resume parsing (GPT-3.5)
- [ ] Fallback regex parsing
- [ ] Manual entry with duplicate check
- [ ] Delete with confirmation
- [ ] Search & filter
- [ ] JD matching with AI
- [ ] Role-based access control
- [ ] File upload validation
- [ ] Responsive design

---

**Copy prompts 1-10 to any AI assistant and build the complete system!** 🎯
