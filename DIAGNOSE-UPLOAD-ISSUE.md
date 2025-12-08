# Diagnose: Upload Issue - File Not Found

## 🔴 Your Specific Problem

**File trying to access:** `resume-1764765544730-187796841.pdf`  
**Error:** Cannot GET /uploads/resume-1764765544730-187796841.pdf

## 🔍 Diagnosis Results

### ✅ What's Working:
- Uploads folder exists
- Previous files uploaded successfully (50+ files in folder)
- Upload middleware is configured correctly

### ❌ What's NOT Working:
- **The specific file `resume-1764765544730-187796841.pdf` does NOT exist in uploads folder**
- This means the upload failed or didn't complete

## 🎯 Root Cause

The file upload is failing for one of these reasons:

### 1. Server Not Running
**Most likely cause!**

Check if server is running:
```powershell
# Windows PowerShell
Get-Process -Name node

# If nothing shows, server is NOT running!
```

**Fix:**
```bash
# Start the server
npm start
```

### 2. Upload Failed Due to Error

The upload might be failing silently. Check for errors.

---

## ✅ Complete Fix (Step by Step)

### Step 1: Check if Server is Running

```powershell
# Check for Node process
Get-Process -Name node

# If you see nothing, server is NOT running
```

### Step 2: Start the Server

```bash
# Make sure you're in the project directory
cd C:\Users\Sainathreddy\OneDrive\文件\new projcet-11

# Start the server
npm start
```

**You should see:**
```
Server running on port 5000
Database connected successfully
```

### Step 3: Check Server Logs

Watch for any errors when uploading:
```
Look for lines like:
✅ File uploaded: resume-xxxxx.pdf
❌ Error uploading file: ...
```

### Step 4: Test Upload Again

1. Go to your application
2. Try uploading a resume
3. Watch the terminal for logs
4. Check if file appears in uploads folder:
   ```powershell
   Get-ChildItem uploads/ | Sort-Object LastWriteTime -Descending | Select-Object -First 5
   ```

---

## 🐛 Common Issues & Fixes

### Issue 1: Disk Full

**Check disk space:**
```powershell
Get-PSDrive C | Select-Object Used,Free
```

**If disk is full:**
```powershell
# Clean up old uploads (be careful!)
# First, backup important files
# Then delete old test files
Remove-Item uploads/resumes-* -Force
```

### Issue 2: Permission Denied

**Check folder permissions:**
```powershell
Get-Acl uploads/
```

**Fix permissions:**
```powershell
# Give full control to current user
$acl = Get-Acl uploads/
$permission = "$env:USERNAME","FullControl","Allow"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
$acl.SetAccessRule($accessRule)
Set-Acl uploads/ $acl
```

### Issue 3: File Size Too Large

**Check file size limit in middleware/upload.js:**
```javascript
limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
```

**If your file is larger than 5MB, increase the limit:**
```javascript
limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
```

### Issue 4: Antivirus Blocking

Some antivirus software blocks file uploads.

**Temporary fix:**
- Disable antivirus temporarily
- Try upload again
- If it works, add exception for your project folder

---

## 🔧 Quick Diagnostic Script

Run this in PowerShell:

```powershell
Write-Host "=== Upload Diagnostic ===" -ForegroundColor Cyan

# Check if server is running
Write-Host "`n1. Checking if server is running..." -ForegroundColor Yellow
$nodeProcess = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcess) {
    Write-Host "✅ Server is running (PID: $($nodeProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ Server is NOT running!" -ForegroundColor Red
    Write-Host "   Fix: Run 'npm start'" -ForegroundColor Yellow
}

# Check uploads folder
Write-Host "`n2. Checking uploads folder..." -ForegroundColor Yellow
if (Test-Path uploads/) {
    $fileCount = (Get-ChildItem uploads/).Count
    Write-Host "✅ Uploads folder exists with $fileCount files" -ForegroundColor Green
    
    # Show recent files
    Write-Host "`n   Recent uploads:" -ForegroundColor Cyan
    Get-ChildItem uploads/ | Sort-Object LastWriteTime -Descending | Select-Object -First 5 | ForEach-Object {
        Write-Host "   - $($_.Name) ($([math]::Round($_.Length/1KB, 2)) KB)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Uploads folder does NOT exist!" -ForegroundColor Red
    Write-Host "   Fix: Run 'mkdir uploads'" -ForegroundColor Yellow
}

# Check disk space
Write-Host "`n3. Checking disk space..." -ForegroundColor Yellow
$drive = Get-PSDrive C
$freeGB = [math]::Round($drive.Free / 1GB, 2)
$usedGB = [math]::Round($drive.Used / 1GB, 2)
Write-Host "   Used: $usedGB GB | Free: $freeGB GB" -ForegroundColor Gray
if ($freeGB -lt 1) {
    Write-Host "⚠️  Low disk space! ($freeGB GB free)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Disk space OK" -ForegroundColor Green
}

# Check if .env exists
Write-Host "`n4. Checking configuration..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "❌ .env file missing!" -ForegroundColor Red
}

Write-Host "`n=== Diagnostic Complete ===" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. If server is not running: npm start" -ForegroundColor White
Write-Host "2. Try uploading a file again" -ForegroundColor White
Write-Host "3. Watch terminal for errors" -ForegroundColor White
```

Save as `diagnose.ps1` and run:
```powershell
.\diagnose.ps1
```

---

## 📋 Troubleshooting Checklist

- [ ] Server is running (`npm start`)
- [ ] No errors in terminal
- [ ] Uploads folder exists
- [ ] Uploads folder has write permissions
- [ ] Disk has free space (>1GB)
- [ ] File size is under 5MB (or limit increased)
- [ ] .env file exists
- [ ] Database is connected

---

## 🎯 Most Likely Fix

Based on your issue, **the server is probably not running**.

**Quick fix:**
```bash
# 1. Open terminal in project folder
cd C:\Users\Sainathreddy\OneDrive\文件\new projcet-11

# 2. Start server
npm start

# 3. Keep terminal open and watch for logs

# 4. Try upload again in browser
```

---

## 📊 Expected Behavior

**When upload works correctly:**

1. **In terminal, you see:**
   ```
   POST /api/applications/manual-entry 200
   File uploaded: resume-1764765544730-187796841.pdf
   ```

2. **File appears in folder:**
   ```powershell
   Get-ChildItem uploads/ | Where-Object {$_.Name -like "*1764765544730*"}
   # Should show the file
   ```

3. **Download works:**
   ```
   http://localhost:5000/uploads/resume-1764765544730-187796841.pdf
   # Should download the file
   ```

---

## 🆘 Still Not Working?

### Collect Debug Info:

```powershell
# 1. Check server status
Get-Process -Name node

# 2. Check recent uploads
Get-ChildItem uploads/ | Sort-Object LastWriteTime -Descending | Select-Object -First 10

# 3. Check disk space
Get-PSDrive C

# 4. Try manual file creation
New-Item -Path uploads/test.txt -ItemType File -Value "test"
Get-Content uploads/test.txt
Remove-Item uploads/test.txt
```

### Share This Info:
1. Is server running? (yes/no)
2. Any errors in terminal?
3. Disk space available?
4. Can you create files manually in uploads/?
5. Screenshot of terminal when uploading

---

## ✅ Summary

**Your issue:** File upload is failing, file never gets created

**Most likely cause:** Server not running

**Quick fix:**
```bash
npm start
```

**Then try upload again!**
