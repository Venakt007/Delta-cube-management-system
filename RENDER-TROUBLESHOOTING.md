# Render Troubleshooting Guide

## 🚀 Commands to Run in Render Shell

### 1. Add Technology Column (Run Once)
```bash
node migrations/run-technology-migration.js
```

### 2. Check Skill Keywords System
```bash
node check-skill-keywords.js
```

**What it shows:**
- All unique skills in database
- Hardcoded keywords in parser
- Test skill extraction
- Recent resume skills
- Parsed data statistics

### 3. Test Resume Parsing
```bash
node test-render-parsing.js
```

**What it shows:**
- Environment configuration
- Latest resume details
- Parsing test results
- URL type analysis
- Recommendations for fixes

### 4. View All Skills in Database
```bash
node -e "const {pool} = require('./config/database'); pool.query('SELECT DISTINCT TRIM(UNNEST(STRING_TO_ARRAY(primary_skill, \\',\\'))) as skill FROM applications WHERE primary_skill IS NOT NULL UNION SELECT DISTINCT TRIM(UNNEST(STRING_TO_ARRAY(secondary_skill, \\',\\'))) as skill FROM applications WHERE secondary_skill IS NOT NULL ORDER BY skill').then(r => {console.log('Total skills:', r.rows.length); r.rows.forEach((s, i) => console.log((i+1) + '.', s.skill)); pool.end();})"
```

### 5. Check Latest Resume
```bash
node -e "const {pool} = require('./config/database'); pool.query('SELECT id, name, email, phone, primary_skill, technology, resume_url, created_at FROM applications ORDER BY created_at DESC LIMIT 1').then(r => {console.log('Latest resume:'); console.log(r.rows[0]); pool.end();})"
```

---

## 🐛 Issue 1: Parsing Not Working on Render

### Symptoms:
- Names showing as filenames (e.g., `resume_1765214957207_924629252`)
- Missing email or phone
- No skills detected

### Causes:
1. **Cloudinary URL not accessible** - Parser can't download PDF
2. **PDF is scanned image** - No extractable text
3. **Timeout** - Parsing takes too long
4. **Missing dependencies** - pdf-parse or mammoth not installed

### Solutions:

#### A. Check if PDF is accessible:
```bash
node -e "const axios = require('axios'); const {pool} = require('./config/database'); pool.query('SELECT resume_url FROM applications ORDER BY created_at DESC LIMIT 1').then(async r => {const url = r.rows[0].resume_url; console.log('Testing URL:', url); try {const response = await axios.head(url); console.log('✅ URL accessible:', response.status);} catch(e) {console.log('❌ URL not accessible:', e.message);} pool.end();})"
```

#### B. Re-parse a specific resume:
```bash
node -e "const {pool} = require('./config/database'); const {parseResume} = require('./utils/resumeParser'); pool.query('SELECT id, resume_url FROM applications WHERE id = 123').then(async r => {const resume = r.rows[0]; console.log('Parsing resume', resume.id); const parsed = await parseResume(resume.resume_url); console.log('Result:', parsed); await pool.query('UPDATE applications SET parsed_data = $1, name = $2, email = $3, phone = $4 WHERE id = $5', [JSON.stringify(parsed), parsed.name, parsed.email, parsed.phone, resume.id]); console.log('✅ Updated'); pool.end();})"
```
*Replace `123` with actual resume ID*

#### C. Check dependencies:
```bash
npm list pdf-parse mammoth axios
```

---

## 🐛 Issue 2: Skill Keywords Not Updating

### How It Works:
1. User enters skill in manual entry or social media form
2. `addSkillKeyword()` function is called
3. Skill is added to in-memory array
4. Next resume parsing uses updated keywords

### Verify It's Working:

#### Check if skills are being saved:
```bash
node check-skill-keywords.js
```

#### Manually add a test skill:
```bash
node -e "const {addSkillKeyword} = require('./utils/resumeParser'); addSkillKeyword('TestSkill123'); console.log('✅ Skill added'); setTimeout(() => process.exit(0), 1000);"
```

#### Test skill extraction with new skill:
```bash
node -e "const {extractSkills} = require('./utils/jd-matcher'); extractSkills('Looking for TestSkill123 developer').then(skills => {console.log('Found skills:', skills); process.exit(0);})"
```

### Important Notes:
- **In-memory storage**: Skills are stored in memory, reset on server restart
- **Database loading**: Skills load from database every 5 minutes
- **Persistence**: Skills persist in database via `primary_skill` and `secondary_skill` columns

---

## 🐛 Issue 3: Bulk Download Fails (Zip Empty)

### Symptoms:
- After downloading 5-6 resumes, zip file only has metadata
- No actual PDF files in zip

### Likely Causes:
1. **Memory limit** - Too many files loaded at once
2. **Cloudinary URLs** - Not downloading actual files
3. **Timeout** - Taking too long to create zip

### Solution: Implement Proper Bulk Download

The current implementation might be missing. Here's what needs to be added:

#### Backend Endpoint (routes/applications.js):
```javascript
router.post('/download-bulk', auth, isRecruiterOrAdmin, async (req, res) => {
  const { resumeIds } = req.body;
  
  // Limit to 10 at a time
  if (resumeIds.length > 10) {
    return res.status(400).json({ error: 'Maximum 10 resumes at a time' });
  }
  
  // Get resume URLs
  const resumes = await pool.query(
    'SELECT id, name, resume_url FROM applications WHERE id = ANY($1)',
    [resumeIds]
  );
  
  // Download and zip files
  // ... implementation needed
});
```

---

## 🐛 Issue 4: Location Dropdown

### Status: ✅ FIXED

The location field now has:
- Dropdown with common locations
- "+ Add New" button to add custom locations
- Locations persist in session

### Default Locations:
- Bangalore, India
- Hyderabad, India
- Mumbai, India
- Delhi, India
- Pune, India
- Chennai, India
- Remote
- USA
- UK
- Canada

---

## 📊 Monitoring Commands

### Check System Health:
```bash
# Total resumes
node -e "const {pool} = require('./config/database'); pool.query('SELECT COUNT(*) FROM applications').then(r => {console.log('Total:', r.rows[0].count); pool.end();})"

# Resumes without parsed_data
node -e "const {pool} = require('./config/database'); pool.query('SELECT COUNT(*) FROM applications WHERE parsed_data IS NULL').then(r => {console.log('Need parsing:', r.rows[0].count); pool.end();})"

# Resumes with filename as name
node -e "const {pool} = require('./config/database'); pool.query('SELECT COUNT(*) FROM applications WHERE name LIKE \\'resume_%\\'').then(r => {console.log('Bad names:', r.rows[0].count); pool.end();})"
```

### View Backend Logs:
```bash
# In Render dashboard, go to Logs tab
# Filter by "Parsing" or "Error" to see parsing issues
```

---

## 🔧 Quick Fixes

### Fix All Resumes with Filename as Name:
```bash
node -e "const {pool} = require('./config/database'); const {parseResume} = require('./utils/resumeParser'); pool.query('SELECT id, resume_url FROM applications WHERE name LIKE \\'resume_%\\' LIMIT 10').then(async r => {for(const row of r.rows) {console.log('Re-parsing:', row.id); try {const parsed = await parseResume(row.resume_url); if(parsed && parsed.name && !parsed.name.includes('resume_')) {await pool.query('UPDATE applications SET parsed_data = $1, name = $2, email = $3, phone = $4 WHERE id = $5', [JSON.stringify(parsed), parsed.name, parsed.email || '', parsed.phone || '', row.id]); console.log('  ✅', parsed.name);} else {console.log('  ⚠️  Still filename');}} catch(e) {console.log('  ❌', e.message);}} pool.end();})"
```

### Clear All Parsed Data (Force Re-parse):
```bash
node -e "const {pool} = require('./config/database'); pool.query('UPDATE applications SET parsed_data = NULL WHERE parsed_data IS NOT NULL').then(r => {console.log('Cleared:', r.rowCount, 'resumes'); pool.end();})"
```

---

## ✅ Verification Checklist

After running migrations and fixes:

- [ ] Technology column exists
- [ ] Skills are being saved to database
- [ ] New uploads extract actual names (not filenames)
- [ ] Email and phone are detected
- [ ] Skills are detected from resumes
- [ ] JD matching extracts multiple skills
- [ ] Location dropdown works with "Add New"
- [ ] Individual resume downloads work

---

## 🆘 Still Having Issues?

1. **Check Render logs** for errors during upload
2. **Test with a simple PDF** (not scanned image)
3. **Verify Cloudinary URLs** are accessible
4. **Check database** for actual data
5. **Run test scripts** to isolate the issue

---

## 📝 Notes

- **Parser improvements** only apply to NEW uploads
- **Old resumes** need to be re-parsed manually
- **Skill keywords** load from database every 5 minutes
- **Server restart** clears in-memory skill keywords (but reloads from DB)
