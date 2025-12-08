Write-Host "=== Upload Diagnostic Tool ===" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "1. Checking if server is running..." -ForegroundColor Yellow
$nodeProcess = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcess) {
    Write-Host "   ✅ Server is running (PID: $($nodeProcess.Id))" -ForegroundColor Green
    Write-Host "   Started: $($nodeProcess.StartTime)" -ForegroundColor Gray
} else {
    Write-Host "   ❌ Server is NOT running!" -ForegroundColor Red
    Write-Host "   Fix: Run 'npm start' in your project folder" -ForegroundColor Yellow
}

Write-Host ""

# Check uploads folder
Write-Host "2. Checking uploads folder..." -ForegroundColor Yellow
if (Test-Path uploads/) {
    $fileCount = (Get-ChildItem uploads/).Count
    $totalSize = (Get-ChildItem uploads/ | Measure-Object -Property Length -Sum).Sum
    $totalSizeMB = [math]::Round($totalSize / 1MB, 2)
    
    Write-Host "   ✅ Uploads folder exists" -ForegroundColor Green
    Write-Host "   Files: $fileCount | Total size: $totalSizeMB MB" -ForegroundColor Gray
    
    # Show recent files
    Write-Host ""
    Write-Host "   Recent uploads:" -ForegroundColor Cyan
    Get-ChildItem uploads/ | Sort-Object LastWriteTime -Descending | Select-Object -First 5 | ForEach-Object {
        $sizeKB = [math]::Round($_.Length/1KB, 2)
        Write-Host "   - $($_.Name)" -ForegroundColor White
        Write-Host "     Size: $sizeKB KB | Date: $($_.LastWriteTime)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Uploads folder does NOT exist!" -ForegroundColor Red
    Write-Host "   Fix: Run 'mkdir uploads'" -ForegroundColor Yellow
}

Write-Host ""

# Check disk space
Write-Host "3. Checking disk space..." -ForegroundColor Yellow
$drive = Get-PSDrive C
$freeGB = [math]::Round($drive.Free / 1GB, 2)
$usedGB = [math]::Round($drive.Used / 1GB, 2)
$totalGB = [math]::Round(($drive.Used + $drive.Free) / 1GB, 2)
$percentUsed = [math]::Round(($drive.Used / ($drive.Used + $drive.Free)) * 100, 1)

Write-Host "   Total: $totalGB GB | Used: $usedGB GB ($percentUsed%) | Free: $freeGB GB" -ForegroundColor Gray

if ($freeGB -lt 1) {
    Write-Host "   ⚠️  WARNING: Low disk space! ($freeGB GB free)" -ForegroundColor Yellow
    Write-Host "   Recommendation: Clean up old files" -ForegroundColor Yellow
} elseif ($freeGB -lt 5) {
    Write-Host "   ⚠️  Disk space getting low ($freeGB GB free)" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Disk space OK" -ForegroundColor Green
}

Write-Host ""

# Check configuration files
Write-Host "4. Checking configuration..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "   ✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ .env file missing!" -ForegroundColor Red
    Write-Host "   Fix: Create .env file with database configuration" -ForegroundColor Yellow
}

if (Test-Path package.json) {
    Write-Host "   ✅ package.json exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ package.json missing!" -ForegroundColor Red
}

if (Test-Path server.js) {
    Write-Host "   ✅ server.js exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ server.js missing!" -ForegroundColor Red
}

Write-Host ""

# Check middleware
Write-Host "5. Checking upload middleware..." -ForegroundColor Yellow
if (Test-Path middleware/upload.js) {
    Write-Host "   ✅ Upload middleware exists" -ForegroundColor Green
    
    # Check file size limit
    $uploadContent = Get-Content middleware/upload.js -Raw
    if ($uploadContent -match 'fileSize:\s*(\d+)') {
        $sizeBytes = [int]$matches[1]
        $sizeMB = [math]::Round($sizeBytes / 1MB, 2)
        Write-Host "   File size limit: $sizeMB MB" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Upload middleware missing!" -ForegroundColor Red
}

Write-Host ""

# Test write permissions
Write-Host "6. Testing write permissions..." -ForegroundColor Yellow
try {
    $testFile = "uploads/test-$(Get-Date -Format 'yyyyMMddHHmmss').txt"
    "test" | Out-File -FilePath $testFile -ErrorAction Stop
    Remove-Item $testFile -ErrorAction Stop
    Write-Host "   ✅ Can write to uploads folder" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Cannot write to uploads folder!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Diagnostic Complete ===" -ForegroundColor Cyan
Write-Host ""

# Recommendations
Write-Host "📋 Recommendations:" -ForegroundColor Yellow
Write-Host ""

if (-not $nodeProcess) {
    Write-Host "🔴 CRITICAL: Server is not running!" -ForegroundColor Red
    Write-Host "   Action: Run 'npm start' to start the server" -ForegroundColor White
    Write-Host ""
}

if (-not (Test-Path uploads/)) {
    Write-Host "🔴 CRITICAL: Uploads folder missing!" -ForegroundColor Red
    Write-Host "   Action: Run 'mkdir uploads' to create it" -ForegroundColor White
    Write-Host ""
}

if ($freeGB -lt 1) {
    Write-Host "⚠️  WARNING: Very low disk space!" -ForegroundColor Yellow
    Write-Host "   Action: Clean up old files or increase disk space" -ForegroundColor White
    Write-Host ""
}

Write-Host "✅ Next Steps:" -ForegroundColor Green
Write-Host "1. Fix any critical issues above" -ForegroundColor White
Write-Host "2. Make sure server is running (npm start)" -ForegroundColor White
Write-Host "3. Try uploading a file" -ForegroundColor White
Write-Host "4. Watch terminal for errors" -ForegroundColor White
Write-Host "5. Check if file appears in uploads/ folder" -ForegroundColor White
Write-Host ""

# Offer to start server
if (-not $nodeProcess) {
    Write-Host "Would you like to start the server now? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq 'Y' -or $response -eq 'y') {
        Write-Host "Starting server..." -ForegroundColor Cyan
        Start-Process -FilePath "npm" -ArgumentList "start" -NoNewWindow
        Write-Host "Server starting... Check terminal for logs" -ForegroundColor Green
    }
}
