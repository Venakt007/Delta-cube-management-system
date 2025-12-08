# 🔍 Check Render Logs for 502 Error

## The 502 error means the server is crashing. Let's find out why.

---

## Step 1: Check Render Logs

1. **Go to Render Dashboard:**
   - https://dashboard.render.com
   - Select: `delta-cube-management-system`

2. **Click "Logs" tab**

3. **Look for errors** when you try to upload:
   - Red error messages
   - "Error:", "Failed:", "Cannot find module"
   - Stack traces

---

## Step 2: Common Issues to Check

### Issue 1: Cloudinary Credentials Missing

**In Render Logs, look for:**
```
Error: Must supply cloud_name
Error: Must supply api_key
```

**Fix:**
1. Go to Render Dashboard → Environment
2. Check these variables exist:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. If missing, add them and redeploy

---

### Issue 2: Missing Dependencies

**In Render Logs, look for:**
```
Cannot find module 'multer-storage-cloudinary'
Cannot find module 'cloudinary'
```

**Fix:**
Run in Render Shell:
```bash
npm install
```

---

### Issue 3: Database Connection

**In Render Logs, look for:**
```
Error: Connection terminated
ECONNREFUSED
```

**Fix:**
Check `DATABASE_URL` environment variable is set correctly.

---

### Issue 4: Memory/Timeout

**In Render Logs, look for:**
```
SIGKILL
Out of memory
Request timeout
```

**Fix:**
This is why we disabled parsing. If still happening, might need to upgrade Render plan.

---

## Step 3: Test with Simple Upload

Try uploading a **small PDF** (< 1MB) to see if size is the issue.

---

## Step 4: Check Current Deploy Status

In Render Dashboard:
- **Events tab** - Is deploy successful?
- **Logs tab** - Any startup errors?

---

## Step 5: Manual Test in Render Shell

```bash
# Check Cloudinary config
echo "Cloud Name: $CLOUDINARY_CLOUD_NAME"
echo "API Key: $CLOUDINARY_API_KEY"
echo "API Secret: ${CLOUDINARY_API_SECRET:0:5}..."

# Check if modules are installed
node -e "console.log(require('cloudinary').v2)"
node -e "console.log(require('multer-storage-cloudinary'))"
```

---

## 📋 What to Share

If still not working, share:
1. **Last 20 lines from Render Logs** (when you try to upload)
2. **Environment variables** (names only, not values)
3. **Deploy status** (successful or failed?)

---

## 🎯 Quick Fix Options

### Option A: Use Local Storage Instead

If Cloudinary keeps failing, we can switch back to local storage temporarily:

**In Render Environment:**
- Remove or comment out: `CLOUDINARY_CLOUD_NAME`
- This will make it use local storage (files won't persist across restarts)

### Option B: Try Different Cloudinary Settings

We can try:
- Different resource_type
- Different upload preset
- Direct upload instead of storage

---

## 🆘 Emergency: Disable File Upload

If you need the app working NOW without uploads:

**In Render Shell:**
```bash
# Temporarily disable Cloudinary
export CLOUDINARY_CLOUD_NAME=""
pm2 restart all
```

This will make uploads use local storage (temporary but working).

---

## ✅ After Fix

Once working:
1. Upload a test PDF
2. Check it appears in dashboard
3. Try downloading it
4. Verify URL starts with `https://res.cloudinary.com/`

---

**Check the Render logs and let me know what errors you see!** 🔍
