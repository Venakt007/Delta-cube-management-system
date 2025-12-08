# Fix: Resume Download Not Working on Render

## 🔴 Problem

- ✅ Downloads work in Super Admin
- ❌ Downloads don't work in Recruiter dashboard
- ❌ Downloads don't work in Admin dashboard

## 🎯 Root Cause

**Old resumes** in database have URLs like:
```
/uploads/resume-123.pdf
```

These don't work on Render because:
1. Render has ephemeral storage (files deleted on restart)
2. Old files were uploaded before Cloudinary was configured

**New resumes** (after Cloudinary setup) have URLs like:
```
https://res.cloudinary.com/your-cloud/image/upload/v123/recruitment-uploads/resumes/resume-456.pdf
```

These work fine!

---

## ✅ Solution: Multiple Options

### Option 1: Re-upload Old Resumes (Recommended)

**For each old resume:**
1. Download the resume locally (if you have it)
2. Edit the candidate in recruiter dashboard
3. Upload the resume again
4. Save

The new upload will use Cloudinary and work everywhere.

---

### Option 2: Update Database URLs Manually

If you have the files stored somewhere, upload them to Cloudinary and update the database.

**In Render Shell:**

```bash
# Connect to database
psql $DATABASE_URL

# Check resumes with local URLs
SELECT id, name, resume_url FROM applications WHERE resume_url LIKE '/uploads/%' LIMIT 10;

# If you want to clear old local URLs (they won't work anyway)
UPDATE applications SET resume_url = NULL WHERE resume_url LIKE '/uploads/%';

# Exit
\q
```

---

### Option 3: Add Fallback Message in UI

Update the UI to show a message when resume URL is local (not Cloudinary).

**This tells users the file is not available instead of showing a broken download.**

---

## 🔧 Quick Fix: Clear Old URLs

Since old `/uploads/` files don't exist on Render anyway, clear them:

**In Render Shell:**

```bash
# Connect to database
psql $DATABASE_URL

# See how many old URLs exist
SELECT COUNT(*) FROM applications WHERE resume_url LIKE '/uploads/%';

# Clear old local URLs (they don't work on Render anyway)
UPDATE applications SET resume_url = NULL WHERE resume_url LIKE '/uploads/%';

# Verify
SELECT COUNT(*) FROM applications WHERE resume_url IS NULL;

# Exit
\q
```

**After this:**
- Old resumes will show "No resume" instead of broken download
- Users can re-upload resumes
- New uploads will use Cloudinary and work

---

## 🎯 Verify Cloudinary is Working

### Check if new uploads use Cloudinary:

**In Render Shell:**

```bash
# Check recent uploads
psql $DATABASE_URL -c "SELECT id, name, resume_url FROM applications ORDER BY created_at DESC LIMIT 5;"
```

**New uploads should show:**
```
https://res.cloudinary.com/your-cloud-name/...
```

**NOT:**
```
/uploads/resume-xxx.pdf
```

### If still showing `/uploads/`:

**Cloudinary is not configured!** Check:

1. **Environment variables are set:**
   ```bash
   echo $CLOUDINARY_CLOUD_NAME
   echo $CLOUDINARY_API_KEY
   echo $CLOUDINARY_API_SECRET
   ```

2. **All should show values, not empty**

3. **If empty, add them in Render Dashboard:**
   - Go to: Render Dashboard → Your Service → Environment
   - Add the 3 Cloudinary variables
   - Service will auto-redeploy

---

## 📋 Complete Fix Steps

### Step 1: Verify Cloudinary Setup

```bash
# In Render Shell
echo "Cloudinary Cloud Name: $CLOUDINARY_CLOUD_NAME"
echo "Cloudinary API Key: $CLOUDINARY_API_KEY"
echo "Cloudinary API Secret: $CLOUDINARY_API_SECRET"
```

**All 3 should show values!**

If not, add them in Render Dashboard → Environment.

### Step 2: Clear Old Local URLs

```bash
# Connect to database
psql $DATABASE_URL

# Clear old URLs that don't work
UPDATE applications SET resume_url = NULL WHERE resume_url LIKE '/uploads/%';

# Also clear old edited resume URLs
UPDATE applications SET edited_resume_url = NULL WHERE edited_resume_url LIKE '/uploads/%';

# Exit
\q
```

### Step 3: Test New Upload

1. Login as recruiter
2. Upload a new resume
3. Check the URL in database:
   ```bash
   psql $DATABASE_URL -c "SELECT resume_url FROM applications ORDER BY created_at DESC LIMIT 1;"
   ```
4. Should show Cloudinary URL!

### Step 4: Test Download

1. Go to admin or recruiter dashboard
2. Click "View Details" on the newly uploaded resume
3. Click "Download Resume"
4. Should download successfully!

---

## 🐛 Troubleshooting

### Issue: New uploads still use `/uploads/`

**Cloudinary not configured properly.**

**Fix:**

1. Check environment variables in Render
2. Make sure all 3 are set:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Redeploy service
4. Try upload again

### Issue: Upload fails with Cloudinary error

**Check Render logs:**

```
Render Dashboard → Your Service → Logs
```

Look for errors like:
- "Invalid credentials" → Check API key/secret
- "Upload failed" → Check file size/format
- "Cloudinary not found" → Packages not installed

**Fix:**

```bash
# In Render Shell
npm list cloudinary
npm list multer-storage-cloudinary

# If not installed:
npm install cloudinary multer-storage-cloudinary
```

### Issue: Some downloads work, some don't

**Mixed URLs in database.**

**Check:**

```bash
psql $DATABASE_URL -c "SELECT id, name, resume_url FROM applications WHERE resume_url IS NOT NULL ORDER BY created_at DESC LIMIT 10;"
```

**You'll see:**
- Old: `/uploads/resume-xxx.pdf` ❌ (won't work)
- New: `https://res.cloudinary.com/...` ✅ (works)

**Solution:** Clear old URLs or re-upload those resumes.

---

## 🎯 Expected Behavior After Fix

### Before Fix:
- Old resumes: `/uploads/resume-xxx.pdf` → ❌ Download fails
- New resumes: `/uploads/resume-xxx.pdf` → ❌ Download fails

### After Fix:
- Old resumes: `NULL` → Shows "No resume available"
- New resumes: `https://res.cloudinary.com/...` → ✅ Download works!

---

## 📊 Check Your Database

### See all resume URLs:

```bash
psql $DATABASE_URL << 'EOF'
SELECT 
  id,
  name,
  CASE 
    WHEN resume_url LIKE 'https://res.cloudinary.com/%' THEN 'Cloudinary ✅'
    WHEN resume_url LIKE '/uploads/%' THEN 'Local (broken) ❌'
    WHEN resume_url IS NULL THEN 'No resume'
    ELSE 'Unknown'
  END as url_type,
  created_at
FROM applications
ORDER BY created_at DESC
LIMIT 20;
EOF
```

---

## 🔄 Migration Script to Clear Old URLs

Create this script to clean up:

**In Render Shell:**

```bash
cat > cleanup-old-urls.js << 'EOF'
const pool = require('./config/db');

async function cleanupOldUrls() {
  try {
    console.log('🧹 Cleaning up old local URLs...\n');
    
    // Count old URLs
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM applications WHERE resume_url LIKE '/uploads/%' OR edited_resume_url LIKE '/uploads/%'"
    );
    console.log(`Found ${countResult.rows[0].count} resumes with old local URLs\n`);
    
    // Clear resume URLs
    const resumeResult = await pool.query(
      "UPDATE applications SET resume_url = NULL WHERE resume_url LIKE '/uploads/%' RETURNING id, name"
    );
    console.log(`✅ Cleared ${resumeResult.rows.length} resume URLs`);
    
    // Clear edited resume URLs
    const editedResult = await pool.query(
      "UPDATE applications SET edited_resume_url = NULL WHERE edited_resume_url LIKE '/uploads/%' RETURNING id, name"
    );
    console.log(`✅ Cleared ${editedResult.rows.length} edited resume URLs`);
    
    console.log('\n✅ Cleanup complete!');
    console.log('Users can now re-upload resumes, which will use Cloudinary.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupOldUrls();
EOF

# Run the cleanup
node cleanup-old-urls.js
```

---

## ✅ Verification Checklist

After fix:

- [ ] Cloudinary environment variables are set
- [ ] Old local URLs are cleared from database
- [ ] New uploads use Cloudinary URLs
- [ ] Downloads work in Super Admin
- [ ] Downloads work in Admin dashboard
- [ ] Downloads work in Recruiter dashboard
- [ ] No "Cannot GET /uploads" errors

---

## 💡 Prevention

**To prevent this in the future:**

1. ✅ Always use Cloudinary in production (already configured)
2. ✅ Test uploads after deployment
3. ✅ Check database URLs are Cloudinary URLs
4. ✅ Don't use local storage on Render

---

## 🎉 Summary

**Problem:** Old resumes have local URLs that don't work on Render

**Solution:**
1. Clear old local URLs from database
2. Verify Cloudinary is configured
3. Re-upload resumes (they'll use Cloudinary)
4. Downloads will work everywhere!

**Quick fix command:**
```bash
psql $DATABASE_URL -c "UPDATE applications SET resume_url = NULL WHERE resume_url LIKE '/uploads/%';"
```

---

**After this fix, all new uploads will work perfectly!** 🚀
