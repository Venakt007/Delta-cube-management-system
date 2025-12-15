# Resume Parsing Troubleshooting Guide

## Current Issue
Parsing is failing with **401 error** and showing filenames as candidate names.

---

## Quick Fix Steps

### Step 1: Make Existing Files Public (Run in Render Shell)

```bash
node fix-cloudinary-access.js
```

This will make all existing uploaded files publicly accessible.

**Expected Output:**
```
🔍 Fetching all files from recruitment-uploads folder...
📦 Found 15 files
🔄 Updating: recruitment-uploads/resumes/resume-123.pdf
✅ Updated: recruitment-uploads/resumes/resume-123.pdf
...
📊 Summary:
   Total files: 15
   ✅ Updated: 15
   ❌ Failed: 0
✅ Done! All files should now be publicly accessible.
```

---

### Step 2: Setup Upload Preset for New Uploads

#### 2.1 Create Upload Preset in Cloudinary Dashboard

1. Go to: https://cloudinary.com/console
2. Click **Settings** → **Upload** → **Upload presets**
3. Click **Add upload preset**
4. Configure:
   - **Upload preset name:** `recruitment_uploads`
   - **Signing mode:** **Unsigned**
   - **Access mode:** **Public** ⚠️ IMPORTANT!
   - **Resource type:** Auto-detect or Raw
5. Click **Save**

#### 2.2 Add Environment Variable in Render

1. Go to Render dashboard → Your service → **Environment**
2. Add:
   ```
   Key: CLOUDINARY_UPLOAD_PRESET
   Value: recruitment_uploads
   ```
3. Click **Save Changes** (will auto-redeploy)

---

### Step 3: Verify Configuration

#### Check Environment Variables (Render Shell)
```bash
echo "Cloud Name: $CLOUDINARY_CLOUD_NAME"
echo "API Key: $CLOUDINARY_API_KEY"
echo "Upload Preset: $CLOUDINARY_UPLOAD_PRESET"
```

All should show values (not empty).

#### Test Parsing (Render Shell)
```bash
node test-render-parsing.js
```

**Expected Output (Success):**
```
📄 Parsing resume: https://res.cloudinary.com/...
📥 Downloading PDF from URL: https://res.cloudinary.com/...
✅ Downloaded 245678 bytes
📖 Parsing PDF...
✅ Extracted 1234 characters from PDF
✓ Found name: John Smith
✓ Found email: john@gmail.com
✓ Found phone: 9876543210
✓ Found location: Hyderabad, India
✓ Found 8 skills: React, Node.js, MongoDB...
```

**Bad Output (Still Failing):**
```
❌ Resume parsing error: Request failed with status code 401
```

If you still see 401, continue to Step 4.

---

### Step 4: Manual Fix for Specific Files

If specific files are still failing, you can manually update them:

#### Option A: Via Cloudinary Dashboard
1. Go to **Media Library**
2. Navigate to `recruitment-uploads/resumes`
3. Select the files
4. Click **Manage** → **Access Control**
5. Change to **Public**
6. Click **Save**

#### Option B: Via API (Single File)
```bash
node -e "const cloudinary = require('cloudinary').v2; cloudinary.config({cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET}); cloudinary.uploader.explicit('recruitment-uploads/resumes/resume-1765470892584-814756987.pdf', {type: 'upload', resource_type: 'raw', access_mode: 'public'}).then(r => console.log('✅ Updated:', r.public_id)).catch(e => console.error('❌ Error:', e.message));"
```

Replace the public_id with your actual file path.

---

## Common Issues & Solutions

### Issue 1: Still Getting 401 After Running fix-cloudinary-access.js

**Cause:** Upload preset not configured or environment variable missing

**Solution:**
1. Verify upload preset exists in Cloudinary dashboard
2. Verify `CLOUDINARY_UPLOAD_PRESET` is set in Render environment
3. Redeploy after adding environment variable

---

### Issue 2: Parsing Returns "Unknown" Name

**Cause:** PDF text extraction is working but name detection is failing

**Solution:**
Check the resume format. The parser looks for:
- Name in first 15 lines
- Name should be 1-5 words
- Name should not contain @ or 10-digit numbers
- Name should be mostly letters

**Debug:**
```bash
node -e "const {parseResume} = require('./utils/resumeParser'); parseResume('https://your-cloudinary-url.pdf').then(r => console.log(JSON.stringify(r, null, 2)));"
```

---

### Issue 3: Email/Phone Not Detected

**Cause:** Resume format doesn't match expected patterns

**Patterns Detected:**
- **Email:** `anything@domain.com`
- **Phone:** 
  - `+91 9876543210`
  - `9876543210` (10 digits starting with 6-9)
  - `123-456-7890`
  - `(123) 456-7890`

**Solution:** If resume has unusual format, the parser will still save the file but with empty email/phone. You can manually edit the candidate details in the dashboard.

---

### Issue 4: Skills Not Detected

**Cause:** Skills are not in the keyword database

**Solution:**
Skills are automatically added to the database when:
1. Entered in social media form
2. Entered in manual entry form
3. Detected in parsed resumes

The parser learns over time. First few resumes might have fewer skills detected.

**Check skill keywords:**
```bash
node check-skill-keywords.js
```

---

### Issue 5: Location Not Detected

**Cause:** Location is not in the keyword database

**Solution:**
Locations are automatically added when:
1. Selected from dropdown in forms
2. Added via "+ Add New Location"
3. Detected in parsed resumes

**Check location keywords:**
```bash
node -e "const pool = require('./config/db'); pool.query('SELECT DISTINCT location FROM applications WHERE location IS NOT NULL ORDER BY location').then(r => {console.log('Locations:', r.rows.length); r.rows.forEach(row => console.log('-', row.location)); pool.end();})"
```

---

## Testing Checklist

After completing all steps, test:

- [ ] Upload a new resume via bulk upload
- [ ] Check if name is detected (not filename)
- [ ] Check if email is detected
- [ ] Check if phone is detected
- [ ] Check if skills are detected
- [ ] Check if location is detected
- [ ] Try downloading the resume (should work)
- [ ] Try parsing the resume again (should work without 401)

---

## Emergency Fallback

If parsing is completely broken and you need to continue working:

### Disable Parsing Temporarily

Edit `routes/applications.js` line ~150:

```javascript
// Comment out parsing
// parsedData = await parseResume(parseTarget);
parsedData = null; // Skip parsing for now
```

This will:
- ✅ Still upload files successfully
- ✅ Still save to database
- ❌ Won't auto-fill name/email/phone/skills
- ⚠️ You'll need to manually enter details

**Remember to re-enable parsing after fixing Cloudinary access!**

---

## Need More Help?

### Check Logs in Render

1. Go to Render dashboard → Your service → **Logs**
2. Look for:
   - `❌ Resume parsing error: Request failed with status code 401`
   - `✅ Successfully parsed: [name]`
   - `⚠️ Parsing failed for [filename]`

### Test Locally

If you have the same Cloudinary credentials locally:

```bash
# Test parsing a specific URL
node -e "const {parseResume} = require('./utils/resumeParser'); parseResume('https://res.cloudinary.com/your-cloud/raw/upload/v123/recruitment-uploads/resumes/resume-123.pdf').then(r => console.log(r)).catch(e => console.error(e));"
```

---

## Summary

**Root Cause:** Cloudinary files uploaded as `resource_type: 'raw'` are private by default

**Solution:**
1. ✅ Make existing files public: `node fix-cloudinary-access.js`
2. ✅ Setup upload preset with public access
3. ✅ Add `CLOUDINARY_UPLOAD_PRESET` environment variable
4. ✅ Redeploy

**Result:** All new uploads will be public, parsing will work! 🚀
