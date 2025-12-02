# 🔗 URL Structure Guide - Recruitment System

## 📍 How Your URLs Work

### For Social Media (Public Application Form)
**Share this link:** `https://yourdomain.com/apply.html`

✅ **What candidates see:**
- Only the application form
- NO login link visible
- NO navigation to dashboards
- Clean, simple application page

✅ **What happens:**
- Candidate fills form and uploads resume
- Data saved to database with `source = 'html_form'`
- Confirmation message shown
- Form resets for next applicant

---

### For Staff (Dashboard Access)
**Share this link:** `https://yourdomain.com/` or `https://yourdomain.com/login`

✅ **What staff see:**
- Landing page with two options:
  1. "Apply Now" button (for candidates)
  2. "Staff Login" button (for staff)
- OR directly the login page

✅ **After login:**
- Admin → `/admin` dashboard
- Recruiter → `/recruiter` dashboard

---

## 🎯 URL Breakdown

### Public URLs (No Login Required)
```
https://yourdomain.com/
├── Landing page with options
│   ├── "Apply Now" → /apply.html
│   └── "Staff Login" → /login

https://yourdomain.com/apply.html
└── Application form ONLY (for social media)
    - No login link
    - No navigation
    - Just the form
```

### Protected URLs (Login Required)
```
https://yourdomain.com/login
└── Login page

https://yourdomain.com/admin
└── Admin Dashboard (after login)

https://yourdomain.com/recruiter
└── Recruiter Dashboard (after login)
```

---

## 📊 Data Flow

### Social Media Application Flow
```
1. Share link: yourdomain.com/apply.html
   ↓
2. Candidate sees ONLY application form
   ↓
3. Candidate fills form and uploads resume
   ↓
4. POST /api/applications/submit
   ↓
5. Database saves with source='html_form'
   ↓
6. Success message shown
   ↓
7. Recruiter/Admin can see it in dashboard
```

### Staff Access Flow
```
1. Visit: yourdomain.com/ or yourdomain.com/login
   ↓
2. See landing page or login page
   ↓
3. Enter credentials
   ↓
4. POST /api/auth/login
   ↓
5. Redirect based on role:
   - Admin → /admin
   - Recruiter → /recruiter
   ↓
6. Can see all applications including HTML form submissions
```

---

## 🔐 Security & Separation

### What's Separated:
✅ **Social Media Link** (`/apply.html`)
- Completely isolated
- No login link visible
- No way to access dashboards
- Only shows application form

✅ **Staff Access** (`/` or `/login`)
- Requires authentication
- Protected routes
- Role-based access

### Why This Works:
1. **Different Entry Points:**
   - Candidates use `/apply.html`
   - Staff use `/` or `/login`

2. **No Cross-Contamination:**
   - Application form has no links to login
   - Login page has no link to application form
   - Completely separate user experiences

3. **Data Integration:**
   - Both save to same database
   - Staff can see all applications
   - Unified backend

---

## 📱 Social Media Sharing

### What to Share on Social Media:
```
🔗 Link: https://yourdomain.com/apply.html

📝 Sample Post:
"We're hiring! Apply now for exciting opportunities.
Fill out our quick application form: https://yourdomain.com/apply.html"
```

### What Candidates Experience:
1. Click link from social media
2. See beautiful application form
3. Fill details and upload resume
4. Submit
5. Get confirmation
6. Done! (No login, no confusion)

---

## 👨‍💼 Staff Access

### How Staff Access the System:
```
Option 1: Direct Login
🔗 https://yourdomain.com/login

Option 2: Via Landing Page
🔗 https://yourdomain.com/
   → Click "Staff Login" button
   → Redirects to /login
```

### After Login:
- **Admin sees:**
  - All resumes (dashboard + HTML form)
  - All recruiters' uploads
  - Full system access

- **Recruiter sees:**
  - Own uploaded resumes
  - Social Media tab (all HTML form submissions)
  - Can manage and update status

---

## 🎨 Page Descriptions

### 1. Landing Page (`/`)
**Purpose:** Welcome page with options  
**Shows:**
- Hero section
- "Apply Now" button → `/apply.html`
- "Staff Login" button → `/login`
- Features section

**Who sees it:** Anyone visiting root URL

---

### 2. Application Form (`/apply.html`)
**Purpose:** Public job application  
**Shows:**
- Application form only
- No navigation
- No login links
- Submit button

**Who sees it:** Candidates from social media

---

### 3. Login Page (`/login`)
**Purpose:** Staff authentication  
**Shows:**
- Email and password fields
- Login button
- No link to application form

**Who sees it:** Staff members

---

### 4. Admin Dashboard (`/admin`)
**Purpose:** Full system management  
**Shows:**
- All resumes
- Onboarded candidates
- Advanced filters
- JD matching

**Who sees it:** Admins only (after login)

---

### 5. Recruiter Dashboard (`/recruiter`)
**Purpose:** Recruiter operations  
**Shows:**
- Manual entry
- Bulk upload
- My resumes
- Social Media tab (HTML form submissions)

**Who sees it:** Recruiters only (after login)

---

## 🔄 How to Use

### For Candidates:
1. Get link from social media: `/apply.html`
2. Fill form
3. Upload resume
4. Submit
5. Done!

### For Recruiters:
1. Go to: `yourdomain.com/login`
2. Login with credentials
3. See dashboard
4. Check "Social Media" tab for HTML form submissions
5. Manage applications

### For Admins:
1. Go to: `yourdomain.com/login`
2. Login with admin credentials
3. See all resumes from all sources
4. Manage entire system

---

## 📝 Summary

### Three Separate Entry Points:

1. **`/apply.html`** (Social Media)
   - For candidates
   - No login link
   - Just application form

2. **`/`** (Landing Page)
   - For everyone
   - Shows both options
   - Professional welcome page

3. **`/login`** (Staff Login)
   - For staff only
   - Authentication required
   - Access to dashboards

### Key Benefits:

✅ **Clean Separation:** Candidates never see login  
✅ **Professional:** Landing page for branding  
✅ **Secure:** Protected staff access  
✅ **Integrated:** All data in one system  
✅ **Flexible:** Multiple entry points for different users

---

## 🚀 Testing

### Test Social Media Link:
```bash
# Open in browser
http://localhost:5000/apply.html

# Should see:
- Application form only
- No login link
- No navigation
```

### Test Staff Access:
```bash
# Open in browser
http://localhost:5000/

# Should see:
- Landing page
- "Apply Now" button
- "Staff Login" button
```

### Test Login:
```bash
# Open in browser
http://localhost:5000/login

# Should see:
- Login form
- No link to application form
```

---

**Perfect Separation Achieved! ✅**

Candidates and staff have completely separate entry points with no cross-contamination.
