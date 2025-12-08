# Fix: Uploads Not Working on Render

## 🔴 The Problem

On Render deployment, you get:
```
Cannot GET /uploads/resume-1764765544730-187796841.pdf
```

## ⚠️ Root Cause: Ephemeral Storage

**Render's free tier uses ephemeral storage**, which means:
- ✅ Files upload successfully
- ❌ Files are deleted when service restarts (every ~15 minutes on free tier)
- ❌ Files are not shared across instances
- ❌ Files disappear after deployment

**This is NOT a bug - it's how Render works!**

---

## ✅ Solutions (Choose One)

### Solution 1: Use Cloud Storage (Recommended for Production)

Use AWS S3, Cloudinary, or similar service to store files permanently.

#### Option A: AWS S3 (Most Common)

**Step 1: Install AWS SDK**
```bash
npm install aws-sdk multer-s3
```

**Step 2: Create S3 Bucket**
1. Go to AWS Console → S3
2. Create bucket: `recruitment-uploads`
3. Set permissions: Public read access
4. Get credentials: Access Key ID & Secret Access Key

**Step 3: Update middleware/upload.js**

```javascript
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');

// Configure S3
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Use S3 storage in production, local storage in development
const storage = process.env.NODE_ENV === 'production' 
  ? multerS3({
      s3: s3,
      bucket: process.env.S3_BUCKET_NAME || 'recruitment-uploads',
      acl: 'public-read',
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    })
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, './uploads');
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
```

**Step 4: Add Environment Variables to Render**

In Render Dashboard:
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=recruitment-uploads
```

**Step 5: Update File URLs**

Files will now have URLs like:
```
https://recruitment-uploads.s3.amazonaws.com/resume-xxx.pdf
```

---

#### Option B: Cloudinary (Easier, Free Tier Available)

**Step 1: Install Cloudinary**
```bash
npm install cloudinary multer-storage-cloudinary
```

**Step 2: Sign up for Cloudinary**
- Go to https://cloudinary.com
- Sign up for free account
- Get: Cloud Name, API Key, API Secret

**Step 3: Update middleware/upload.js**

```javascript
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use Cloudinary in production, local storage in development
const storage = process.env.NODE_ENV === 'production'
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'recruitment-uploads',
        allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
        resource_type: 'auto'
      }
    })
  : multer.diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
```

**Step 4: Add Environment Variables to Render**

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

### Solution 2: Use Render Disk (Paid Plan Only)

**Cost:** $7/month for persistent disk

**Steps:**
1. Upgrade to Render Starter plan
2. Add persistent disk in Render Dashboard
3. Mount disk to `/data/uploads`
4. Update upload path to use `/data/uploads`

**Not recommended for free tier!**

---

### Solution 3: Store Files in Database (Not Recommended)

Store files as base64 in PostgreSQL. **Not recommended** due to:
- Large database size
- Slow performance
- Expensive database storage

---

## 🎯 Recommended Solution: Cloudinary

**Why Cloudinary?**
- ✅ Free tier: 25GB storage, 25GB bandwidth
- ✅ Easy to set up
- ✅ Automatic image optimization
- ✅ CDN included
- ✅ No AWS complexity

### Quick Setup with Cloudinary

**1. Sign up:**
```
https://cloudinary.com/users/register/free
```

**2. Get credentials:**
```
Dashboard → Account Details
- Cloud Name: your_cloud_name
- API Key: 123456789012345
- API Secret: your_secret
```

**3. Install package:**
```bash
npm install cloudinary multer-storage-cloudinary
```

**4. Create new upload middleware:**

Create `middleware/upload-cloudinary.js`:

```javascript
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder and format based on field name
    let folder = 'recruitment-uploads';
    let format = file.mimetype.split('/')[1];
    
    if (file.fieldname === 'resume' || file.fieldname === 'resumes') {
      folder = 'recruitment-uploads/resumes';
    } else if (file.fieldname === 'id_proof') {
      folder = 'recruitment-uploads/id-proofs';
    } else if (file.fieldname === 'edited_resume') {
      folder = 'recruitment-uploads/edited-resumes';
    }
    
    return {
      folder: folder,
      allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
      resource_type: 'auto',
      public_id: `${file.fieldname}-${Date.now()}`
    };
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = upload;
```

**5. Update routes to use new middleware:**

In `routes/applications.js`, change:
```javascript
// Old
const upload = require('../middleware/upload');

// New
const upload = process.env.NODE_ENV === 'production' 
  ? require('../middleware/upload-cloudinary')
  : require('../middleware/upload');
```

**6. Add environment variables to Render:**

Go to Render Dashboard → Your Service → Environment:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**7. Deploy:**
```bash
git add .
git commit -m "Add Cloudinary for file uploads"
git push origin main
```

Render will auto-deploy.

**8. Test:**
- Upload a resume
- File URL will be: `https://res.cloudinary.com/your_cloud_name/...`
- File persists across restarts!

---

## 🔧 Quick Fix Script

Create `setup-cloudinary.sh`:

```bash
#!/bin/bash

echo "=== Setting up Cloudinary for Render ==="

# Install dependencies
echo "Installing Cloudinary packages..."
npm install cloudinary multer-storage-cloudinary

# Create middleware file
echo "Creating Cloudinary upload middleware..."
cat > middleware/upload-cloudinary.js << 'EOF'
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'recruitment-uploads',
    allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto'
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = upload;
EOF

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Sign up at https://cloudinary.com"
echo "2. Get your credentials from Dashboard"
echo "3. Add to Render environment variables:"
echo "   - CLOUDINARY_CLOUD_NAME"
echo "   - CLOUDINARY_API_KEY"
echo "   - CLOUDINARY_API_SECRET"
echo "4. Update routes to use upload-cloudinary in production"
echo "5. Commit and push to deploy"
```

Run:
```bash
chmod +x setup-cloudinary.sh
./setup-cloudinary.sh
```

---

## 📋 Comparison of Solutions

| Solution | Cost | Setup | Pros | Cons |
|----------|------|-------|------|------|
| **Cloudinary** | Free (25GB) | Easy | CDN, optimization, simple | Limited free tier |
| **AWS S3** | ~$0.023/GB | Medium | Unlimited, cheap | Complex setup |
| **Render Disk** | $7/month | Easy | Simple | Expensive for storage |
| **Database** | Free | Easy | No external service | Slow, not scalable |

**Recommendation:** Use Cloudinary for free tier, AWS S3 for production.

---

## ✅ Verification

After setup, verify:

1. **Upload a file**
2. **Check URL in database:**
   ```sql
   SELECT resume_url FROM applications ORDER BY created_at DESC LIMIT 1;
   ```
3. **Should show:**
   ```
   https://res.cloudinary.com/your_cloud_name/...
   ```
4. **Click download** - should work!
5. **Restart Render service** - file still accessible!

---

## 🆘 Troubleshooting

### Issue: "Cloudinary credentials not found"

**Fix:** Add environment variables in Render Dashboard

### Issue: "Upload failed"

**Check:**
1. Cloudinary credentials are correct
2. File size under 10MB
3. File format is allowed
4. Cloudinary free tier not exceeded

### Issue: "Cannot access uploaded file"

**Check:**
1. Cloudinary upload mode is set to public
2. URL is correct in database
3. Cloudinary account is active

---

## 📊 Expected Behavior

**Before (Ephemeral Storage):**
- ❌ Upload works
- ❌ File disappears after restart
- ❌ Cannot download

**After (Cloudinary):**
- ✅ Upload works
- ✅ File persists forever
- ✅ Download works
- ✅ Fast CDN delivery

---

## 💡 Summary

**Problem:** Render free tier has ephemeral storage

**Solution:** Use cloud storage (Cloudinary recommended)

**Steps:**
1. Sign up for Cloudinary (free)
2. Install packages
3. Create upload-cloudinary.js middleware
4. Add environment variables to Render
5. Update routes to use new middleware
6. Deploy

**Time:** 15-20 minutes

**Cost:** Free (Cloudinary free tier)

---

**Your uploads will work perfectly after this!** 🚀
