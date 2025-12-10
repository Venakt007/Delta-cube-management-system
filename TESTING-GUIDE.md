# 🧪 Resume Parsing Testing Guide

## 📋 Pre-Testing Checklist

1. ✅ Wait for Render deploy to complete (2-3 minutes)
2. ✅ Have 3-5 test resumes ready (different formats)
3. ✅ Open Render logs in separate tab
4. ✅ Login to your app as recruiter

---

## 🎯 Testing Steps

### Step 1: Upload Test Resumes

1. **Go to:** https://delta-cube-management-system.onrender.com/login
2. **Login as recruiter:**
   - Email: `recruiter@example.com`
   - Password: `recruiter123`
3. **Click "Bulk Upload"**
4. **Upload 3-5 test resumes**
5. **Wait for upload to complete**

### Step 2: Check Render Logs

1. **Go to Render Dashboard:** https://dashboard.render.com
2. **Select:** `delta-cube-management-system`
3. **Click "Logs" tab**
4. **Look for parsing output:**

```
📄 Parsing resume: https://res.cloudinary.com/.../resume.pdf
📥 Downloading PDF from URL: ...
✅ Downloaded 245678 bytes
📖 Parsing PDF...
✅ Extracted 1234 characters from PDF
🔍 Tier 2: Using basic regex parsing
   ✓ Found email: john@example.com
   ✓ Found phone: 9876543210 (10 digits)
   ✓ Found name: John Doe
✅ Tier 2 parsing successful!
```

### Step 3: Verify in Dashboard

Check each uploaded resume:

**✅ Good Parsing:**
- Name is correct (not "Unknown")
- Email is present
- Phone is present (10 digits)
- Skills are detected

**❌ Failed Parsing:**
- Name shows "Unknown" or filename
- Email is missing (-)
- Phone is missing (-)
- Yellow "⚠️ Check" badge appears

### Step 4: Check Specific Cases

Test these scenarios:

#### Test Case 1: Standard Resume
- **Expected:** All fields detected
- **Check:** Name, email, phone, skills

#### Test Case 2: Resume with Unusual Format
- **Expected:** At least email and phone detected
- **Check:** Logs show which tier was used

#### Test Case 3: Scanned PDF (Image-based)
- **Expected:** May fail (no text to extract)
- **Check:** Logs show "Extracted 0 characters"

#### Test Case 4: DOCX Resume
- **Expected:** Should work like PDF
- **Check:** All fields detected

---

## 📊 What to Look For

### In Render Logs:

**Good Signs:**
```
✅ Downloaded X bytes
✅ Extracted X characters from PDF
✓ Found email: ...
✓ Found phone: ...
✓ Found name: ...
✅ Tier 2 parsing successful!
```

**Warning Signs:**
```
✗ No valid email found in text
✗ No valid 10-digit phone found
✗ No valid name found
Text sample: [shows extracted text]
```

**Error Signs:**
```
❌ PDF extraction error: ...
❌ Parsing failed for ...
```

### In Dashboard:

**Good Parsing:**
- ✅ Real name (not filename)
- ✅ Valid email address
- ✅ 10-digit phone number
- ✅ Skills detected (1-2 shown)
- ✅ Experience years > 0

**Failed Parsing:**
- ❌ Name = filename or "Unknown"
- ❌ Email = "-"
- ❌ Phone = "-"
- ❌ Yellow "⚠️ Check" badge
- ❌ "No skills"

---

## 🔍 Debugging Failed Parsing

If parsing fails, check logs for:

### 1. Text Extraction Failed
```
✅ Extracted 0 characters from PDF
```
**Cause:** Scanned image PDF (no text layer)  
**Solution:** Resume needs OCR or is not parseable

### 2. Email Not Found
```
✗ No valid email found in text
Text sample: [check if email is visible]
```
**Cause:** Email format unusual or not present  
**Solution:** Check if email exists in text sample

### 3. Phone Not Found
```
✗ No valid 10-digit phone found in text
```
**Cause:** Phone format unusual or not 10 digits  
**Solution:** Check phone format in resume

### 4. Name Not Found
```
✗ No valid name found
First 5 lines: [check what's in first lines]
```
**Cause:** Name not in first 15 lines or unusual format  
**Solution:** Check resume structure

---

## 📝 Testing Checklist

Use this checklist for each resume:

```
Resume: _________________

□ Uploaded successfully
□ Cloudinary URL saved (starts with https://res.cloudinary.com/)
□ Name detected correctly
□ Email detected correctly
□ Phone detected correctly (10 digits)
□ Skills detected (at least 1)
□ Experience years detected
□ Download button works
□ Can view details in modal

Parsing Tier Used: □ Tier 1  □ Tier 2  □ Tier 3 (AI)

Notes:
_________________________________
_________________________________
```

---

## 🧹 After Testing: Cleanup

### Option 1: Delete All Test Resumes (Recommended)

**In Render Shell:**
```bash
node clean-start.js
```

This will:
- Delete ALL applications
- Reset database to clean state
- Prepare for production use

### Option 2: Delete Specific Test Resumes

**In Dashboard:**
1. Select test resumes (checkboxes)
2. Click "Delete Selected"
3. Confirm deletion

### Option 3: Delete via Database (Advanced)

**In Render Shell:**
```bash
# Delete resumes uploaded in last hour (test resumes)
psql $DATABASE_URL << 'EOF'
DELETE FROM applications 
WHERE created_at > NOW() - INTERVAL '1 hour'
AND source = 'dashboard';
EOF
```

---

## ✅ Success Criteria

Parsing is working well if:

- ✅ **80%+ of resumes** have name, email, phone detected
- ✅ **Logs show detailed parsing output** for each resume
- ✅ **Skills are detected** for most resumes
- ✅ **Download works** for all resumes
- ✅ **No 502 errors** during upload

---

## 🆘 If Parsing Still Fails

### Check These:

1. **Resume Quality:**
   - Is it a scanned image? (Won't work without OCR)
   - Is text selectable in PDF? (Should be)
   - Is format very unusual? (May need AI tier)

2. **Cloudinary:**
   - Are URLs being saved correctly?
   - Can you download the file directly?
   - Is file size reasonable (< 10MB)?

3. **Server:**
   - Any errors in Render logs?
   - Is server running out of memory?
   - Are timeouts occurring?

### Share These with Me:

If you need help, share:
1. **Render logs** (last 50 lines when uploading)
2. **Screenshot** of failed resume in dashboard
3. **Resume format** (PDF/DOCX, file size)
4. **Text sample** from logs (if available)

---

## 📊 Expected Results

### Typical Parsing Success Rates:

- **Well-formatted PDFs:** 90-95% success
- **Standard DOCX:** 85-90% success
- **Unusual formats:** 60-70% success
- **Scanned images:** 0% success (no text layer)

### Parsing Tiers:

- **Tier 1 (Structured):** 20-30% of resumes
- **Tier 2 (Regex):** 60-70% of resumes
- **Tier 3 (AI):** 10-20% of resumes (if OpenAI key configured)

---

**Good luck with testing!** 🚀

After testing, run `node clean-start.js` in Render Shell to clean up test data.
