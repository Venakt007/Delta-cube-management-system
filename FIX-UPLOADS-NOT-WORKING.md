# Fix: Cannot GET /uploads/resume-xxx.pdf

## 🔴 Problem

When trying to download resumes, you get:
```
Cannot GET /uploads/resume-1764765248073-581430404.pdf
```

This means uploaded files cannot be accessed.

---

## ✅ Quick Fix (Choose Your Scenario)

### Scenario 1: Running Locally (Development)

#### Step 1: Check Uploads Directory
```bash
# In your project folder
ls -la uploads/

# If doesn't exist, create it:
mkdir uploads
```

#### Step 2: Restart Server
```bash
# Stop server (Ctrl+C)
# Start again:
npm start
```

#### Step 3: Test Upload
1. Go to recruiter dashboard
2. Upload a resume
3. Check if file appears in `uploads/` folder
4. Try to download it

---

### Scenario 2: Running on AWS/Server (Production)

#### Step 1: SSH into Server
```bash
ssh -i your-key.pem ubuntu@your-server-ip
cd /home/ubuntu/app/Delta-cube-management-system
```

#### Step 2: Check Uploads Directory
```bash
# Check if exists
ls -la uploads/

# If doesn't exist, create it:
mkdir -p uploads
chmod 755 uploads

# Check if any files are there
ls -la uploads/
```

#### Step 3: Check Nginx Configuration

Your Nginx config should have this location block:

```bash
sudo nano /etc/nginx/sites-available/recruitment
```

Make sure this section exists:
```nginx
# Serve uploaded files
location /uploads {
    alias /home/ubuntu/app/Delta-cube-management-system/uploads;
}
```

**If it's missing, add it!**

#### Step 4: Test Nginx Configuration
```bash
sudo nginx -t
# Should say: test is successful

# If successful, restart Nginx
sudo systemctl restart nginx
```

#### Step 5: Restart Application
```bash
pm2 restart recruitment-app
pm2 logs recruitment-app
```

#### Step 6: Test File Access
```bash
# Upload a test file first through the app
# Then test direct access:
curl http://localhost/uploads/resume-xxxxx.pdf

# Should return file content or download
```

---

## 🐛 Detailed Troubleshooting

### Issue 1: Files Upload But Can't Be Downloaded

**Symptoms:**
- Files appear in `uploads/` folder
- But browser shows "Cannot GET /uploads/..."

**Solution:**

#### For Local Development:
```bash
# Check server.js has this line:
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

# Restart server
npm start
```

#### For Production (Nginx):
```bash
# Check Nginx config
sudo nano /etc/nginx/sites-available/recruitment

# Add or verify this location block:
location /uploads {
    alias /home/ubuntu/app/Delta-cube-management-system/uploads;
}

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

---

### Issue 2: Files Don't Upload At All

**Check 1: Uploads directory permissions**
```bash
# Set correct permissions
chmod 755 uploads/

# If on server, make sure ubuntu user owns it
sudo chown -R ubuntu:ubuntu uploads/
```

**Check 2: Disk space**
```bash
# Check available space
df -h

# If disk is full, clean up:
sudo apt-get clean
pm2 flush  # Clear PM2 logs
```

**Check 3: File size limit**
```bash
# Check middleware/upload.js
# Should have: limits: { fileSize: 5 * 1024 * 1024 } // 5MB

# If uploading larger files, increase the limit
```

---

### Issue 3: Wrong File Path in Database

**Check database:**
```bash
# Connect to database
psql -h your-rds-endpoint -U postgres -d recruitment_db

# Check resume URLs
SELECT id, name, resume_url FROM applications LIMIT 5;

# Should show: /uploads/resume-xxxxx.pdf
# NOT: uploads/resume-xxxxx.pdf (missing leading slash)
```

**If paths are wrong, they should start with `/uploads/`**

---

### Issue 4: Nginx Not Serving Files

**Test Nginx directly:**
```bash
# Create a test file
echo "test" > /home/ubuntu/app/Delta-cube-management-system/uploads/test.txt

# Try to access it
curl http://localhost/uploads/test.txt

# Should return: test
```

**If it doesn't work:**
```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Common issues:
# 1. Wrong alias path
# 2. Permission denied
# 3. SELinux blocking (if enabled)
```

---

## 🔧 Complete Fix Script

Run this script to fix everything:

```bash
#!/bin/bash

echo "=== Fixing Uploads Issue ==="

# Step 1: Create uploads directory
echo "Creating uploads directory..."
mkdir -p uploads
chmod 755 uploads

# Step 2: Check if files exist
echo "Checking for uploaded files..."
ls -la uploads/

# Step 3: Test server.js configuration
echo "Checking server.js..."
grep "app.use('/uploads'" server.js

# Step 4: Restart application
echo "Restarting application..."
if command -v pm2 &> /dev/null; then
    pm2 restart recruitment-app
    pm2 logs recruitment-app --lines 20
else
    echo "PM2 not found. Please restart manually with: npm start"
fi

# Step 5: Test Nginx (if on server)
if command -v nginx &> /dev/null; then
    echo "Testing Nginx configuration..."
    sudo nginx -t
    if [ $? -eq 0 ]; then
        echo "Restarting Nginx..."
        sudo systemctl restart nginx
    fi
fi

echo "=== Fix Complete ==="
echo "Try uploading a file now!"
```

Save as `fix-uploads.sh` and run:
```bash
chmod +x fix-uploads.sh
./fix-uploads.sh
```

---

## ✅ Verification Steps

### 1. Upload a Test File
1. Login as recruiter
2. Go to Manual Entry
3. Upload a resume
4. Note the filename shown in logs

### 2. Check File Exists
```bash
ls -la uploads/
# Should see: resume-xxxxx.pdf
```

### 3. Test Direct Access

**Local:**
```
http://localhost:5000/uploads/resume-xxxxx.pdf
```

**Server:**
```
http://your-server-ip/uploads/resume-xxxxx.pdf
```

### 4. Test Through Application
1. View candidate details
2. Click "Download Resume"
3. File should download

---

## 📋 Checklist

- [ ] Uploads directory exists
- [ ] Uploads directory has correct permissions (755)
- [ ] Server.js has uploads static middleware
- [ ] Nginx config has uploads location block (if using Nginx)
- [ ] Application restarted
- [ ] Nginx restarted (if applicable)
- [ ] Test file upload works
- [ ] Test file download works
- [ ] Files visible in uploads/ folder

---

## 🆘 Still Not Working?

### Get Debug Information:

```bash
# 1. Check uploads directory
ls -la uploads/
pwd  # Show current directory

# 2. Check server logs
pm2 logs recruitment-app --lines 50

# 3. Check Nginx logs (if applicable)
sudo tail -f /var/log/nginx/error.log

# 4. Test file permissions
touch uploads/test.txt
cat uploads/test.txt
rm uploads/test.txt

# 5. Check disk space
df -h
```

### Share This Information:
1. Output of `ls -la uploads/`
2. Output of `pwd`
3. Server logs showing upload attempt
4. Nginx error logs (if applicable)
5. Browser console errors (F12 → Console)

---

## 💡 Common Causes Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| Cannot GET /uploads | Nginx not configured | Add location block |
| Cannot GET /uploads | Directory doesn't exist | `mkdir uploads` |
| Cannot GET /uploads | Wrong permissions | `chmod 755 uploads` |
| Files don't upload | Disk full | Clean up space |
| Files don't upload | Size limit exceeded | Increase limit in middleware |
| Wrong path in DB | Missing leading slash | Should be `/uploads/` not `uploads/` |

---

## ✅ Expected Behavior

**After fix:**
1. ✅ Upload resume → File saved to `uploads/` folder
2. ✅ File has correct name: `resume-timestamp-random.pdf`
3. ✅ Database stores: `/uploads/resume-timestamp-random.pdf`
4. ✅ Click download → File downloads successfully
5. ✅ Direct URL access works: `http://server/uploads/file.pdf`

---

**Most common fix:** Just restart your server! 🔄

```bash
# Development
npm start

# Production
pm2 restart recruitment-app
```
