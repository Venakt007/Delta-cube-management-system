# How to Access Render Shell and View Credentials

## 🎯 Accessing Render Shell

### Method 1: Via Render Dashboard (Easiest)

1. **Go to Render Dashboard:**
   ```
   https://dashboard.render.com
   ```

2. **Select your service:**
   - Click on `recruitment-app` (or your service name)

3. **Open Shell:**
   - Click **"Shell"** tab in the left menu
   - Or click the terminal icon (⌘) at the top

4. **Wait for shell to connect:**
   - You'll see: `Connecting to shell...`
   - Then: `root@srv-xxxxx:~/project#`

---

## 📋 View All Environment Variables

### In Render Shell:

```bash
# View all environment variables
printenv

# Or
env

# View sorted
printenv | sort

# View specific variable
echo $DATABASE_URL
echo $CLOUDINARY_CLOUD_NAME
echo $JWT_SECRET
```

### View Only Your Custom Variables:

```bash
# View Cloudinary credentials
echo "Cloud Name: $CLOUDINARY_CLOUD_NAME"
echo "API Key: $CLOUDINARY_API_KEY"
echo "API Secret: $CLOUDINARY_API_SECRET"

# View Database
echo "Database: $DATABASE_URL"

# View JWT Secret
echo "JWT Secret: $JWT_SECRET"

# View Node Environment
echo "Environment: $NODE_ENV"
echo "Port: $PORT"
```

---

## 🔍 Check Specific Credentials

### 1. Check if Cloudinary is Configured:

```bash
# In Render Shell
if [ -z "$CLOUDINARY_CLOUD_NAME" ]; then
    echo "❌ Cloudinary NOT configured"
else
    echo "✅ Cloudinary configured: $CLOUDINARY_CLOUD_NAME"
fi
```

### 2. Check Database Connection:

```bash
# View database URL (masked)
echo $DATABASE_URL | sed 's/:[^@]*@/:****@/'

# Test database connection
psql $DATABASE_URL -c "SELECT version();"
```

### 3. Check All Required Variables:

```bash
# Create a check script
cat > check-env.sh << 'EOF'
#!/bin/bash
echo "=== Environment Variables Check ==="
echo ""

# Check Cloudinary
echo "Cloudinary:"
[ -n "$CLOUDINARY_CLOUD_NAME" ] && echo "  ✅ CLOUDINARY_CLOUD_NAME: $CLOUDINARY_CLOUD_NAME" || echo "  ❌ CLOUDINARY_CLOUD_NAME: Not set"
[ -n "$CLOUDINARY_API_KEY" ] && echo "  ✅ CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY:0:5}..." || echo "  ❌ CLOUDINARY_API_KEY: Not set"
[ -n "$CLOUDINARY_API_SECRET" ] && echo "  ✅ CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET:0:5}..." || echo "  ❌ CLOUDINARY_API_SECRET: Not set"
echo ""

# Check Database
echo "Database:"
[ -n "$DATABASE_URL" ] && echo "  ✅ DATABASE_URL: Set" || echo "  ❌ DATABASE_URL: Not set"
echo ""

# Check JWT
echo "JWT:"
[ -n "$JWT_SECRET" ] && echo "  ✅ JWT_SECRET: Set" || echo "  ❌ JWT_SECRET: Not set"
echo ""

# Check Node
echo "Node:"
echo "  NODE_ENV: $NODE_ENV"
echo "  PORT: $PORT"
echo ""

echo "=== Check Complete ==="
EOF

chmod +x check-env.sh
./check-env.sh
```

---

## 🛠️ Useful Shell Commands

### Check Application Status:

```bash
# Check if app is running
ps aux | grep node

# Check Node version
node --version

# Check npm version
npm --version

# Check installed packages
npm list --depth=0

# Check if Cloudinary package is installed
npm list cloudinary
npm list multer-storage-cloudinary
```

### Check Files and Directories:

```bash
# List project files
ls -la

# Check if uploads directory exists (local)
ls -la uploads/

# Check middleware
ls -la middleware/

# View upload middleware
cat middleware/upload.js
cat middleware/upload-cloudinary.js
```

### Check Logs:

```bash
# View recent logs
tail -f /var/log/render.log

# Or check application logs in Render Dashboard → Logs tab
```

### Test Database Connection:

```bash
# Connect to database
psql $DATABASE_URL

# Once connected, run:
\dt                          # List tables
\d applications              # Describe applications table
SELECT COUNT(*) FROM users;  # Count users
\q                          # Quit
```

---

## 📊 View Environment Variables in Dashboard

### Method 2: Via Dashboard (No Shell Needed)

1. **Go to Render Dashboard**
2. **Select your service:** `recruitment-app`
3. **Click "Environment"** (left menu)
4. **You'll see all variables:**
   ```
   CLOUDINARY_CLOUD_NAME = your_cloud_name
   CLOUDINARY_API_KEY = 123456789012345
   CLOUDINARY_API_SECRET = ••••••••••••••• (click eye icon to reveal)
   DATABASE_URL = postgres://... (click eye icon to reveal)
   JWT_SECRET = ••••••••••••••• (click eye icon to reveal)
   NODE_ENV = production
   PORT = 10000
   ```

5. **Click the "eye" icon** to reveal hidden values

---

## 🔐 Security Best Practices

### DO:
- ✅ Use Render Shell to check if variables are set
- ✅ Use masked output when sharing logs
- ✅ Use environment variables for secrets

### DON'T:
- ❌ Share full credentials in public logs
- ❌ Commit credentials to Git
- ❌ Share screenshots with visible secrets

### Safe Way to Share Credentials:

```bash
# Mask sensitive parts
echo $CLOUDINARY_API_KEY | sed 's/\(.\{5\}\).*/\1.../'
# Output: 12345...

echo $DATABASE_URL | sed 's/:[^@]*@/:****@/'
# Output: postgres://user:****@host/db
```

---

## 🧪 Test Cloudinary Connection

### In Render Shell:

```bash
# Create test script
cat > test-cloudinary.js << 'EOF'
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Testing Cloudinary connection...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.api.ping()
  .then(result => {
    console.log('✅ Cloudinary connection successful!');
    console.log('Status:', result.status);
  })
  .catch(error => {
    console.log('❌ Cloudinary connection failed!');
    console.log('Error:', error.message);
  });
EOF

# Run test
node test-cloudinary.js
```

---

## 📝 Quick Reference Commands

### View All Variables:
```bash
printenv | grep -E "CLOUDINARY|DATABASE|JWT|NODE_ENV|PORT"
```

### Check Specific Variable:
```bash
echo $CLOUDINARY_CLOUD_NAME
```

### Check if Variable is Set:
```bash
[ -n "$CLOUDINARY_CLOUD_NAME" ] && echo "Set" || echo "Not set"
```

### View Masked Database URL:
```bash
echo $DATABASE_URL | sed 's/:[^@]*@/:****@/'
```

### List All Environment Variables (Sorted):
```bash
printenv | sort | less
```

### Search for Specific Variable:
```bash
printenv | grep CLOUDINARY
```

---

## 🎯 Common Tasks

### 1. Verify Cloudinary Setup:

```bash
# In Render Shell
echo "Checking Cloudinary setup..."
echo "Cloud Name: $CLOUDINARY_CLOUD_NAME"
echo "API Key: ${CLOUDINARY_API_KEY:0:5}..."
echo "API Secret: ${CLOUDINARY_API_SECRET:0:5}..."

if [ -n "$CLOUDINARY_CLOUD_NAME" ] && [ -n "$CLOUDINARY_API_KEY" ] && [ -n "$CLOUDINARY_API_SECRET" ]; then
    echo "✅ All Cloudinary variables are set!"
else
    echo "❌ Some Cloudinary variables are missing!"
fi
```

### 2. Check Database Tables:

```bash
# Connect and check
psql $DATABASE_URL -c "\dt"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM applications;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### 3. Check Recent Uploads:

```bash
# Check database for recent uploads
psql $DATABASE_URL -c "SELECT id, name, resume_url FROM applications ORDER BY created_at DESC LIMIT 5;"
```

---

## 🐛 Troubleshooting

### Issue: "Command not found"

Some commands might not be available in Render's shell.

**Available commands:**
- `ls`, `cat`, `echo`, `grep`, `sed`
- `node`, `npm`, `psql`
- `printenv`, `env`

**Not available:**
- `vim`, `nano` (use `cat` to view files)
- `wget`, `curl` (use `node` scripts instead)

### Issue: "Permission denied"

You're running as a limited user. Some system commands won't work.

**Solution:** Use Node.js scripts instead:
```bash
node -e "console.log(process.env.CLOUDINARY_CLOUD_NAME)"
```

### Issue: Can't see environment variables

**Check:**
1. Variables are set in Render Dashboard → Environment
2. Service has been redeployed after adding variables
3. You're in the correct service

---

## 📋 Complete Diagnostic Script

Save this to run in Render Shell:

```bash
#!/bin/bash
echo "=== Render Environment Diagnostic ==="
echo ""
echo "1. Node Environment:"
echo "   Node: $(node --version)"
echo "   npm: $(npm --version)"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"
echo ""

echo "2. Cloudinary Configuration:"
if [ -n "$CLOUDINARY_CLOUD_NAME" ]; then
    echo "   ✅ Cloud Name: $CLOUDINARY_CLOUD_NAME"
else
    echo "   ❌ Cloud Name: NOT SET"
fi

if [ -n "$CLOUDINARY_API_KEY" ]; then
    echo "   ✅ API Key: ${CLOUDINARY_API_KEY:0:5}..."
else
    echo "   ❌ API Key: NOT SET"
fi

if [ -n "$CLOUDINARY_API_SECRET" ]; then
    echo "   ✅ API Secret: ${CLOUDINARY_API_SECRET:0:5}..."
else
    echo "   ❌ API Secret: NOT SET"
fi
echo ""

echo "3. Database:"
if [ -n "$DATABASE_URL" ]; then
    echo "   ✅ Database URL: Set"
    echo "   Testing connection..."
    psql $DATABASE_URL -c "SELECT 1;" > /dev/null 2>&1 && echo "   ✅ Connection successful" || echo "   ❌ Connection failed"
else
    echo "   ❌ Database URL: NOT SET"
fi
echo ""

echo "4. JWT:"
if [ -n "$JWT_SECRET" ]; then
    echo "   ✅ JWT Secret: Set"
else
    echo "   ❌ JWT Secret: NOT SET"
fi
echo ""

echo "5. Installed Packages:"
npm list cloudinary --depth=0 2>/dev/null && echo "   ✅ cloudinary installed" || echo "   ❌ cloudinary NOT installed"
npm list multer-storage-cloudinary --depth=0 2>/dev/null && echo "   ✅ multer-storage-cloudinary installed" || echo "   ❌ multer-storage-cloudinary NOT installed"
echo ""

echo "=== Diagnostic Complete ==="
```

---

## 🎉 Summary

**To view all credentials in Render:**

1. **Dashboard Method (Easiest):**
   - Render Dashboard → Your Service → Environment
   - Click eye icons to reveal values

2. **Shell Method:**
   - Render Dashboard → Your Service → Shell
   - Run: `printenv | grep -E "CLOUDINARY|DATABASE|JWT"`

3. **Check Specific Variable:**
   ```bash
   echo $CLOUDINARY_CLOUD_NAME
   ```

**Most useful command:**
```bash
printenv | sort
```

This shows ALL environment variables in alphabetical order!
