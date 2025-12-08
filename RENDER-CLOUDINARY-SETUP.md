# Quick Setup: Cloudinary for Render

## 🎯 Problem Solved

Your uploads on Render disappear because Render free tier has ephemeral storage. This setup uses Cloudinary (free cloud storage) to fix it.

---

## ⚡ Quick Setup (15 minutes)

### Step 1: Sign Up for Cloudinary (2 minutes)

1. Go to: https://cloudinary.com/users/register/free
2. Sign up with email
3. Verify email
4. Login to dashboard

### Step 2: Get Your Credentials (1 minute)

In Cloudinary Dashboard:
1. Click "Dashboard" (top left)
2. You'll see:
   ```
   Cloud Name: your_cloud_name
   API Key: 123456789012345
   API Secret: abc123xyz456 (click "eye" icon to reveal)
   ```
3. **Copy these three values!**

### Step 3: Add to Render (3 minutes)

1. Go to: https://dashboard.render.com
2. Select your service: `recruitment-app`
3. Click "Environment" (left menu)
4. Click "Add Environment Variable"
5. Add these three variables:

```
Key: CLOUDINARY_CLOUD_NAME
Value: your_cloud_name

Key: CLOUDINARY_API_KEY
Value: 123456789012345

Key: CLOUDINARY_API_SECRET
Value: abc123xyz456
```

6. Click "Save Changes"

### Step 4: Deploy (5 minutes)

Render will automatically redeploy when you push to GitHub.

**Your code is already pushed!** Just wait for Render to deploy.

Check deployment status:
1. Go to Render Dashboard
2. Click your service
3. Click "Events" tab
4. Wait for "Deploy succeeded" ✅

### Step 5: Test (2 minutes)

1. Go to your Render URL
2. Login as recruiter
3. Upload a resume
4. Check if it works!
5. **Restart your Render service** (to test persistence)
6. Try downloading the resume again - it should still work!

---

## ✅ Verification

### Check if Cloudinary is Working:

1. **Upload a file** through your app
2. **Check database:**
   - Go to Render Dashboard → Your database
   - Connect and run:
     ```sql
     SELECT resume_url FROM applications ORDER BY created_at DESC LIMIT 1;
     ```
3. **URL should look like:**
   ```
   https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/recruitment-uploads/resumes/resume-xxx.pdf
   ```
4. **NOT like:**
   ```
   /uploads/resume-xxx.pdf
   ```

### If URL is still `/uploads/...`:

Cloudinary is not being used. Check:
1. Environment variables are set in Render
2. Render has redeployed after you added variables
3. `NODE_ENV=production` is set in Render

---

## 🐛 Troubleshooting

### Issue: "Cloudinary credentials not found"

**Fix:**
1. Check environment variables in Render Dashboard
2. Make sure all 3 variables are set:
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
3. Redeploy service

### Issue: Upload fails with error

**Check Render logs:**
1. Render Dashboard → Your service
2. Click "Logs" tab
3. Look for error messages
4. Common errors:
   - "Invalid credentials" → Check API key/secret
   - "File too large" → File over 10MB
   - "Invalid format" → File type not allowed

### Issue: Still using local storage

**Check:**
1. `NODE_ENV=production` in Render environment
2. Cloudinary variables are set
3. Service has redeployed after changes

---

## 📊 What Changed

### Before (Local Storage):
```javascript
// middleware/upload.js
storage: multer.diskStorage({
  destination: './uploads',  // ❌ Ephemeral on Render
  filename: ...
})
```

### After (Cloudinary):
```javascript
// middleware/upload-cloudinary.js
storage: new CloudinaryStorage({
  cloudinary: cloudinary,  // ✅ Persistent cloud storage
  params: {
    folder: 'recruitment-uploads/resumes',
    resource_type: 'auto'
  }
})
```

### Routes Updated:
```javascript
// routes/applications.js
const upload = process.env.NODE_ENV === 'production' && process.env.CLOUDINARY_CLOUD_NAME
  ? require('../middleware/upload-cloudinary')  // Use Cloudinary in production
  : require('../middleware/upload');             // Use local in development
```

---

## 💰 Cloudinary Free Tier

**Included:**
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ 25,000 transformations/month
- ✅ CDN delivery
- ✅ Automatic backups

**More than enough for your recruitment system!**

---

## 🎉 Success Indicators

After setup, you should see:

1. ✅ Files upload successfully
2. ✅ URLs start with `https://res.cloudinary.com/...`
3. ✅ Files persist after Render restart
4. ✅ Download works from any device
5. ✅ Fast CDN delivery

---

## 📝 Summary

**What you did:**
1. ✅ Signed up for Cloudinary (free)
2. ✅ Got credentials
3. ✅ Added to Render environment
4. ✅ Code already pushed to GitHub
5. ✅ Render auto-deployed

**What happens now:**
- All file uploads go to Cloudinary
- Files persist forever
- Fast CDN delivery
- No more "Cannot GET /uploads" errors!

---

## 🔗 Useful Links

- **Cloudinary Dashboard:** https://cloudinary.com/console
- **Render Dashboard:** https://dashboard.render.com
- **Your GitHub Repo:** https://github.com/Venakt007/Delta-cube-management-system

---

## 🆘 Need Help?

**Check:**
1. Render deployment logs
2. Cloudinary dashboard (see uploaded files)
3. Browser console (F12) for errors

**Common fixes:**
- Redeploy Render service
- Check environment variables
- Verify Cloudinary credentials

---

**Your uploads will work perfectly now!** 🚀

Just add the 3 environment variables to Render and wait for deployment!
