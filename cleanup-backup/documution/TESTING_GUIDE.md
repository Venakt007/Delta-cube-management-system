# Testing Guide

Complete guide to test all features of the Recruitment Management System.

## Prerequisites

- System is installed and running
- Backend running on http://localhost:5000
- Frontend running on http://localhost:3000
- Database is set up with schema
- OpenAI API key is configured

## Test 1: Public Application Form ✅

### Steps:
1. Open http://localhost:3000
2. Fill out the form:
   - Name: John Doe
   - Email: john@example.com
   - Phone: +1234567890
   - LinkedIn: https://linkedin.com/in/johndoe
   - Technology: Web Development
   - Primary Skill: React
   - Secondary Skill: Node.js
   - Location: New York
   - Experience: 3
3. Upload a test resume (PDF)
4. Upload a test ID proof (JPG or PDF)
5. Click "Submit Application"

### Expected Results:
- ✅ Form validates all required fields
- ✅ Files upload successfully
- ✅ Success message appears
- ✅ Form resets after submission
- ✅ Resume is parsed by AI (check backend logs)

### Verify in Database:
```sql
SELECT * FROM applications WHERE email = 'john@example.com';
```
Should show the application with source='html_form' and parsed_data populated.

---

## Test 2: Admin Login ✅

### Steps:
1. Go to http://localhost:3000/login
2. Enter credentials:
   - Email: admin@recruitment.com
   - Password: admin123
3. Click "Login"

### Expected Results:
- ✅ Redirects to /admin
- ✅ Shows "Admin Dashboard" header
- ✅ Shows welcome message with admin name
- ✅ Shows three tabs: All Resumes, Advanced Filter, JD Matching

---

## Test 3: View All Resumes (Admin) ✅

### Steps:
1. Login as admin
2. Click "All Resumes" tab
3. Review the table

### Expected Results:
- ✅ Shows the application submitted in Test 1
- ✅ Displays: name, email, skills, experience, source, uploader
- ✅ Source shows "Form" badge (green)
- ✅ Uploader shows "Public"
- ✅ Skills are displayed as tags
- ✅ "Download" link works

### Verify:
- Click download link
- Resume file should download/open

---

## Test 4: Create Recruiter Account ✅

### Option A: Using Script
```bash
npm run create-users
```

### Option B: Using API
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recruiter@test.com",
    "password": "recruiter123",
    "name": "Test Recruiter",
    "role": "recruiter"
  }'
```

### Expected Results:
- ✅ Returns user object and token
- ✅ User created in database

---

## Test 5: Recruiter Login ✅

### Steps:
1. Logout from admin account
2. Go to http://localhost:3000/login
3. Enter recruiter credentials:
   - Email: recruiter@test.com
   - Password: recruiter123
4. Click "Login"

### Expected Results:
- ✅ Redirects to /recruiter
- ✅ Shows "Recruiter Dashboard" header
- ✅ Shows welcome message with recruiter name
- ✅ Shows bulk upload section
- ✅ Shows search section
- ✅ Shows "My Uploaded Resumes" table (empty initially)

---

## Test 6: Bulk Resume Upload (Recruiter) ✅

### Steps:
1. Login as recruiter
2. Prepare 2-3 test resume files (PDF or DOCX)
3. Click "Choose Files" in bulk upload section
4. Select multiple resume files
5. Wait for upload and parsing

### Expected Results:
- ✅ Shows "Uploading..." or loading state
- ✅ Success message shows number of uploaded resumes
- ✅ Resumes appear in "My Uploaded Resumes" table
- ✅ Each resume shows parsed data (name, email, skills)
- ✅ Backend logs show AI parsing activity

### Verify:
- Check that skills are extracted correctly
- Check that experience years are detected
- Check that email and phone are extracted

---

## Test 7: Search Own Resumes (Recruiter) ✅

### Steps:
1. In recruiter dashboard
2. Enter a skill in search box (e.g., "JavaScript")
3. Click "Search"

### Expected Results:
- ✅ Table filters to show only matching resumes
- ✅ Resumes with "JavaScript" in skills are shown
- ✅ Other resumes are hidden

### Test Reset:
1. Click "Reset" button
2. All resumes should appear again

---

## Test 8: Recruiter Isolation ✅

### Steps:
1. Create a second recruiter account
2. Login as second recruiter
3. Upload some resumes
4. Logout and login as first recruiter

### Expected Results:
- ✅ First recruiter sees only their own uploads
- ✅ Second recruiter's uploads are NOT visible
- ✅ Each recruiter has separate resume list

---

## Test 9: Admin Views All Resumes ✅

### Steps:
1. Logout from recruiter
2. Login as admin
3. Go to "All Resumes" tab

### Expected Results:
- ✅ Shows form submissions (from Test 1)
- ✅ Shows recruiter 1's uploads
- ✅ Shows recruiter 2's uploads
- ✅ Each resume shows correct source badge
- ✅ Each resume shows uploader name
- ✅ Admin can download any resume

---

## Test 10: Advanced Filtering (Admin) ✅

### Steps:
1. Login as admin
2. Click "Advanced Filter" tab
3. Test each filter:

#### Test A: Skills Filter
- Enter: "React, JavaScript"
- Click "Apply Filters"
- Should show only resumes with React OR JavaScript

#### Test B: Experience Filter
- Min Experience: 2
- Max Experience: 5
- Click "Apply Filters"
- Should show only resumes with 2-5 years experience

#### Test C: Location Filter
- Enter: "New York"
- Click "Apply Filters"
- Should show only resumes from New York

#### Test D: Combined Filters
- Skills: "Python"
- Min Experience: 3
- Location: "San Francisco"
- Click "Apply Filters"
- Should show resumes matching ALL criteria

### Expected Results:
- ✅ Each filter works independently
- ✅ Combined filters work together (AND logic)
- ✅ Results update immediately
- ✅ "Reset" button clears all filters

---

## Test 11: Job Description Matching (Admin) ✅

### Steps:
1. Login as admin
2. Click "JD Matching" tab
3. Paste this sample job description:

```
Senior Full Stack Developer

Requirements:
- 5+ years of experience in web development
- Strong proficiency in React and Node.js
- Experience with PostgreSQL databases
- Knowledge of REST APIs
- Excellent problem-solving skills
- Bachelor's degree in Computer Science

Preferred:
- Experience with AWS
- Knowledge of Docker
- TypeScript experience

Location: Remote
Type: Full-time
```

4. Click "Find Matching Candidates"
5. Wait for AI analysis

### Expected Results:
- ✅ Shows "Analyzing..." loading state
- ✅ Returns list of matched candidates
- ✅ Each candidate has match percentage (0-100%)
- ✅ Candidates sorted by match % (highest first)
- ✅ Shows matching skills (green tags)
- ✅ Shows missing skills (red tags)
- ✅ Shows experience match status
- ✅ Shows uploader information
- ✅ Download links work

### Verify Match Quality:
- Candidates with React + Node.js should have high match %
- Candidates with more required skills should rank higher
- Experience matching should affect score
- Missing critical skills should lower score

---

## Test 12: Download Resumes ✅

### Steps:
1. From any dashboard (recruiter or admin)
2. Click "Download" link on any resume

### Expected Results:
- ✅ File downloads or opens in new tab
- ✅ File is the correct resume
- ✅ File is readable (PDF/DOCX)

---

## Test 13: Logout Functionality ✅

### Steps:
1. Login as any user
2. Click "Logout" button

### Expected Results:
- ✅ Redirects to /login
- ✅ Cannot access protected routes
- ✅ Token removed from localStorage
- ✅ Must login again to access dashboards

---

## Test 14: Route Protection ✅

### Steps:
1. Logout completely
2. Try to access these URLs directly:
   - http://localhost:3000/recruiter
   - http://localhost:3000/admin

### Expected Results:
- ✅ Both redirect to /login
- ✅ Cannot access without authentication

### Test Role Protection:
1. Login as recruiter
2. Try to access: http://localhost:3000/admin

### Expected Results:
- ✅ Redirects to /login or shows error
- ✅ Recruiter cannot access admin panel

---

## Test 15: Form Validation ✅

### Steps:
1. Go to public form
2. Try to submit without filling required fields
3. Try to upload wrong file types
4. Try to upload files > 5MB

### Expected Results:
- ✅ Required fields show validation errors
- ✅ Email field validates email format
- ✅ Phone field accepts only numbers
- ✅ Wrong file types are rejected
- ✅ Large files are rejected
- ✅ Form doesn't submit with errors

---

## Test 16: API Error Handling ✅

### Test A: Invalid Login
1. Go to login page
2. Enter wrong credentials
3. Click login

**Expected:** Error message "Invalid credentials"

### Test B: Duplicate Email
1. Try to register with existing email

**Expected:** Error message "User already exists"

### Test C: Invalid Token
1. Manually edit token in localStorage
2. Try to access protected route

**Expected:** Redirects to login

---

## Test 17: Resume Parsing Accuracy ✅

### Steps:
1. Upload resumes with different formats:
   - Traditional format
   - Modern design
   - Two-column layout
   - PDF and DOCX

### Verify Extraction:
- ✅ Name extracted correctly
- ✅ Email extracted correctly
- ✅ Phone extracted correctly
- ✅ Skills list is comprehensive
- ✅ Experience years calculated correctly
- ✅ Education captured
- ✅ Location identified

### Check Backend Logs:
Look for parsing results in console

---

## Test 18: Performance Testing ✅

### Test A: Bulk Upload Performance
1. Upload 10 resumes at once
2. Measure time taken

**Expected:** 
- Completes within 2-3 minutes
- No timeouts
- All resumes parsed

### Test B: Large Database
1. Add 100+ resumes to database
2. Test filtering and searching

**Expected:**
- Queries return quickly (< 2 seconds)
- UI remains responsive
- Pagination works (if implemented)

---

## Test 19: Mobile Responsiveness ✅

### Steps:
1. Open application on mobile device or use browser dev tools
2. Test all pages:
   - Application form
   - Login page
   - Recruiter dashboard
   - Admin dashboard

### Expected Results:
- ✅ All pages are mobile-friendly
- ✅ Forms are usable on small screens
- ✅ Tables scroll horizontally if needed
- ✅ Buttons are touch-friendly
- ✅ Text is readable

---

## Test 20: Database Integrity ✅

### Verify Data:
```sql
-- Check all users
SELECT * FROM users;

-- Check all applications
SELECT * FROM applications;

-- Check parsed data
SELECT name, parsed_data FROM applications WHERE parsed_data IS NOT NULL;

-- Check relationships
SELECT a.name, u.name as uploader 
FROM applications a 
LEFT JOIN users u ON a.uploaded_by = u.id;

-- Check sources
SELECT source, COUNT(*) FROM applications GROUP BY source;
```

### Expected Results:
- ✅ No NULL values in required fields
- ✅ Foreign keys are valid
- ✅ Parsed data is valid JSON
- ✅ Timestamps are correct

---

## Automated Testing Checklist

### Backend API Tests
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@recruitment.com","password":"admin123"}'

# Test protected endpoint (use token from login)
curl http://localhost:5000/api/admin/resumes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Performance Benchmarks

### Expected Response Times:
- Login: < 500ms
- Get resumes: < 1s
- Upload single resume: < 5s
- Bulk upload (10 files): < 60s
- JD matching: < 10s
- Filtering: < 2s

### OpenAI API:
- Resume parsing: 2-5 seconds per resume
- JD analysis: 3-7 seconds

---

## Bug Reporting Template

If you find issues, document them:

```
**Bug Title:** Brief description

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Browser: Chrome/Firefox/Safari
- OS: Windows/Mac/Linux
- Node version: 
- Database version:

**Screenshots:**
Attach if applicable

**Console Errors:**
Copy any error messages
```

---

## Success Criteria

All tests should pass with these results:
- ✅ All features work as expected
- ✅ No console errors
- ✅ No database errors
- ✅ AI parsing works accurately
- ✅ Security measures are effective
- ✅ Performance is acceptable
- ✅ UI is responsive and user-friendly

---

## Next Steps After Testing

1. **If all tests pass:**
   - System is ready for production
   - Deploy to hosting platform
   - Share with real users

2. **If tests fail:**
   - Document the failures
   - Check configuration (.env)
   - Review error logs
   - Fix issues and retest

3. **Ongoing testing:**
   - Test after each code change
   - Monitor production errors
   - Collect user feedback
   - Iterate and improve

---

**Remember:** Testing is ongoing! Always test after making changes.
