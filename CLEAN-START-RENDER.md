# Clean Start: Remove All Old Resumes and Start Fresh

## 🎯 Goal

Remove all old resumes from the database and start uploading fresh with Cloudinary.

---

## ⚠️ WARNING

**This will DELETE ALL resume data!** Make sure you:
- Have backups if needed
- Are okay losing all current resume data
- Want to start completely fresh

---

## ✅ Complete Clean Start (3 Steps)

### Step 1: Backup Current Data (Optional but Recommended)

**In Render Shell:**

```bash
# Backup to CSV file
psql $DATABASE_URL -c "\COPY applications TO '/tmp/applications_backup.csv' CSV HEADER;"

# Or just count what you have
psql $DATABASE_URL -c "SELECT COUNT(*) FROM applications;"
```

---

### Step 2: Delete All Applications

**In Render Shell:**

```bash
# Connect to database
psql $DATABASE_URL

# See current count
SELECT COUNT(*) FROM applications;

# DELETE ALL APPLICATIONS
DELETE FROM applications;

# Verify it's empty
SELECT COUNT(*) FROM applications;
-- Should show: 0

# Exit
\q
```

**Or one-line command:**

```bash
psql $DATABASE_URL -c "DELETE FROM applications;"
```

---

### Step 3: Verify Cloudinary is Configured

```bash
# Check environment variables
echo "Cloud Name: $CLOUDINARY_CLOUD_NAME"
echo "API Key: $CLOUDINARY_API_KEY"
echo "API Secret: $CLOUDINARY_API_SECRET"
```

**All 3 must show values!**

If empty, add them:
1. Render Dashboard → Your Service → Environment
2. Add the 3 Cloudinary variables
3. Wait for redeploy

---

## 🎉 Now Start Fresh!

### Upload New Resumes:

1. **Login to your Render app**
2. **Go to Recruiter Dashboard**
3. **Upload resumes** (Manual Entry or Bulk Upload)
4. **All new uploads will use Cloudinary**
5. **Downloads will work everywhere!**

---

## 🔍 Verify New Uploads Use Cloudinary

After uploading a resume:

```bash
# Check the latest upload
psql $DATABASE_URL -c "SELECT id, name, resume_url FROM applications ORDER BY created_at DESC LIMIT 1;"
```

**Should show:**
```
https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/recruitment-uploads/resumes/resume-xxx.pdf
```

**✅ Perfect!** This will work everywhere.

---

## 📋 Alternative: Keep Candidate Data, Remove Only URLs

If you want to keep candidate information but just remove the broken file URLs:

```bash
# Keep all data, just clear file URLs
psql $DATABASE_URL << 'EOF'
UPDATE applications 
SET resume_url = NULL, 
    edited_resume_url = NULL, 
    id_proof_url = NULL 
WHERE resume_url LIKE '/uploads/%' 
   OR edited_resume_url LIKE '/uploads/%' 
   OR id_proof_url LIKE '/uploads/%';
EOF
```

**This keeps:**
- ✅ Candidate names
- ✅ Email addresses
- ✅ Skills
- ✅ Experience
- ✅ All other data

**This removes:**
- ❌ Old broken file URLs

**Then you can:**
- Re-upload resumes for existing candidates
- New uploads will use Cloudinary

---

## 🎯 Recommended Approach

### Option 1: Complete Fresh Start (Recommended if testing)

```bash
# Delete everything
psql $DATABASE_URL -c "DELETE FROM applications;"
```

**Then:**
- Upload all resumes fresh
- Everything uses Cloudinary
- Clean database

### Option 2: Keep Data, Clear URLs (Recommended if production)

```bash
# Keep candidate data, clear file URLs
psql $DATABASE_URL -c "UPDATE applications SET resume_url = NULL, edited_resume_url = NULL, id_proof_url = NULL WHERE resume_url LIKE '/uploads/%' OR edited_resume_url LIKE '/uploads/%' OR id_proof_url LIKE '/uploads/%';"
```

**Then:**
- Candidate data preserved
- Re-upload files for important candidates
- New uploads use Cloudinary

---

## 🔧 Complete Clean Start Script

**In Render Shell:**

```bash
cat > clean-start.js << 'EOF'
const pool = require('./config/db');

async function cleanStart() {
  try {
    console.log('🧹 Starting clean database reset...\n');
    
    // Count current applications
    const countBefore = await pool.query('SELECT COUNT(*) FROM applications');
    console.log(`Current applications: ${countBefore.rows[0].count}\n`);
    
    // Ask for confirmation (auto-yes in script)
    console.log('⚠️  This will DELETE ALL applications!');
    console.log('Proceeding in 3 seconds...\n');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Delete all applications
    const result = await pool.query('DELETE FROM applications RETURNING id');
    console.log(`✅ Deleted ${result.rows.length} applications\n`);
    
    // Verify
    const countAfter = await pool.query('SELECT COUNT(*) FROM applications');
    console.log(`Remaining applications: ${countAfter.rows[0].count}\n`);
    
    console.log('✅ Clean start complete!');
    console.log('You can now upload fresh resumes with Cloudinary.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanStart();
EOF

# Run the script
node clean-start.js
```

---

## ✅ After Clean Start

### What You Should Do:

1. **Verify database is empty:**
   ```bash
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM applications;"
   # Should show: 0
   ```

2. **Push the code fix:**
   ```bash
   git add .
   git commit -m "Fix Cloudinary URL handling in download button"
   git push origin main
   ```

3. **Wait for Render to deploy**

4. **Upload test resume:**
   - Login as recruiter
   - Upload a resume
   - Check it uses Cloudinary URL

5. **Test download:**
   - View candidate details
   - Click Download Resume
   - Should work!

---

## 🎉 Benefits of Clean Start

- ✅ No old broken URLs
- ✅ All resumes use Cloudinary
- ✅ Downloads work everywhere
- ✅ Files persist across restarts
- ✅ Fast CDN delivery
- ✅ Clean database

---

## 📊 Verification Checklist

After clean start and first upload:

- [ ] Database is empty or URLs are cleared
- [ ] Cloudinary environment variables are set
- [ ] Code fix is deployed
- [ ] New upload creates Cloudinary URL
- [ ] Download button appears
- [ ] Download works in all dashboards
- [ ] File persists after Render restart

---

## 🆘 If Something Goes Wrong

### Restore from Backup:

If you made a backup:

```bash
# Restore from CSV
psql $DATABASE_URL -c "\COPY applications FROM '/tmp/applications_backup.csv' CSV HEADER;"
```

### Start Over:

```bash
# Re-run database setup
node setup-database.js

# Re-run migrations
node migrations/add-super-admin-role.js
node migrations/add-edited-resume-field.js

# Create users again
node create-super-admin-auto.js
```

---

## 💡 Summary

**Quick Clean Start:**

```bash
# 1. Delete all applications
psql $DATABASE_URL -c "DELETE FROM applications;"

# 2. Verify empty
psql $DATABASE_URL -c "SELECT COUNT(*) FROM applications;"

# 3. Upload fresh resumes with Cloudinary
# Done!
```

**Your database is now clean and ready for fresh uploads with Cloudinary!** 🚀
