# Cloudinary Setup Guide - Fix 401 Upload Errors

## Problem
Getting **HTTP 401 errors** when trying to parse resumes uploaded to Cloudinary because files are not publicly accessible.

## Solution: Use Cloudinary Upload Preset

Upload presets allow you to configure upload settings directly in Cloudinary's dashboard, making files publicly accessible without code changes.

---

## Step 1: Create Upload Preset in Cloudinary Dashboard

### 1.1 Login to Cloudinary
- Go to: https://cloudinary.com/console
- Login with your credentials

### 1.2 Navigate to Upload Presets
- Click **Settings** (gear icon) in the top right
- Click **Upload** tab on the left
- Scroll down to **Upload presets** section
- Click **Add upload preset** button

### 1.3 Configure Upload Preset

**Basic Settings:**
- **Upload preset name:** `recruitment_uploads` (or any name you prefer)
- **Signing mode:** Select **Unsigned**
  - ✅ This allows direct uploads without authentication
  - ✅ Perfect for server-side uploads

**Folder & Public ID:**
- **Asset folder:** `recruitment-uploads` (optional)
- **Disallow public ID:** Leave unchecked
- **Generated public ID:** Select "Auto-generate an unguessable public ID value"

**Access Control:**
- **Access mode:** Make sure it's set to **Public** (NOT Authenticated)
  - This is the KEY setting that fixes the 401 error!

**Resource Type:**
- **Resource type:** Auto-detect or Raw
  - Raw is for PDFs, DOCX files

### 1.4 Save the Preset
- Click **Save** at the bottom
- Copy the **Upload preset name** (you'll need this for Step 2)

---

## Step 2: Add Upload Preset to Render Environment Variables

### 2.1 Go to Render Dashboard
- Open your Render dashboard
- Click on your web service

### 2.2 Add Environment Variable
- Click **Environment** tab on the left
- Click **Add Environment Variable**
- Add the following:

```
Key: CLOUDINARY_UPLOAD_PRESET
Value: recruitment_uploads
```

(Use the exact name you created in Step 1.3)

### 2.3 Save Changes
- Click **Save Changes**
- Render will automatically redeploy your app

---

## Step 3: Verify Configuration

### 3.1 Check Environment Variables in Render Shell
```bash
echo $CLOUDINARY_UPLOAD_PRESET
```

Should output: `recruitment_uploads`

### 3.2 Test Upload
- Upload a new resume via your app (social media form or manual entry)
- Check if it appears in Cloudinary dashboard under `recruitment-uploads` folder

### 3.3 Test Parsing
```bash
node test-render-parsing.js
```

Expected output:
```
📥 Downloading PDF from URL: https://res.cloudinary.com/...
✅ Downloaded 245678 bytes
📖 Parsing PDF...
✅ Extracted 1234 characters from PDF
✓ Found name: John Smith
✓ Found email: john@gmail.com
✓ Found phone: 9876543210
✓ Found location: Hyderabad, India
```

---

## How It Works

### Without Upload Preset (Old Way - ❌ Causes 401 errors)
```javascript
// Files uploaded as private by default
resource_type: 'raw'
// Result: 401 Unauthorized when trying to download
```

### With Upload Preset (New Way - ✅ Works!)
```javascript
// Upload preset configured in Cloudinary dashboard
upload_preset: 'recruitment_uploads'
access_mode: 'public'  // Set in preset
// Result: Files are publicly accessible, no 401 errors
```

---

## Benefits of Using Upload Preset

✅ **Centralized Configuration** - All upload settings in one place (Cloudinary dashboard)
✅ **No Code Changes** - Just update environment variable
✅ **Easy to Update** - Change settings in dashboard without redeploying
✅ **Better Security** - Unsigned presets are secure for server-side uploads
✅ **Consistent Uploads** - All files follow the same rules
✅ **Public Access** - Files are accessible for parsing and downloading

---

## Troubleshooting

### Still Getting 401 Errors?

**Check 1: Verify Upload Preset Exists**
```bash
# In Render shell
echo $CLOUDINARY_UPLOAD_PRESET
```

**Check 2: Verify Preset is Unsigned**
- Go to Cloudinary dashboard → Settings → Upload → Upload presets
- Find your preset
- Make sure **Signing mode** is **Unsigned**

**Check 3: Verify Access Mode is Public**
- In the same preset settings
- Make sure **Access mode** is **Public** (not Authenticated)

**Check 4: Test with New Upload**
- Old files uploaded before the fix may still be private
- Upload a new resume to test
- New uploads should work immediately

**Check 5: Use Signed URL Fallback**
- The code already has automatic fallback for old private files
- If you get 401, it will automatically generate a signed URL and retry
- This works for both old and new files

---

## Alternative: Make Existing Files Public

If you want to make **old uploaded files** public:

### Option 1: Via Cloudinary Dashboard
1. Go to Media Library
2. Select the files
3. Click **Manage** → **Access Control**
4. Change to **Public**

### Option 2: Via Cloudinary API (Bulk Update)
```javascript
// Run this script once to make all existing files public
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Update all files in recruitment-uploads folder
cloudinary.api.resources({
  type: 'upload',
  prefix: 'recruitment-uploads',
  max_results: 500
}, (error, result) => {
  result.resources.forEach(resource => {
    cloudinary.uploader.explicit(resource.public_id, {
      type: 'upload',
      access_mode: 'public'
    });
  });
});
```

---

## Summary

1. ✅ Create **unsigned upload preset** in Cloudinary dashboard
2. ✅ Set **access mode to public** in preset settings
3. ✅ Add `CLOUDINARY_UPLOAD_PRESET` environment variable in Render
4. ✅ Redeploy (automatic in Render)
5. ✅ Test with new upload

**Result:** No more 401 errors! All new uploads will be publicly accessible and parseable. 🚀
