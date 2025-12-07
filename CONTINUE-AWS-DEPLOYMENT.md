# Continue AWS Deployment - Where You Left Off

## 🎯 Current Status Check

Let me help you continue from where you are. First, let's check what you've completed:

### ✅ Already Done:
- [x] Code pushed to GitHub (with Super Admin & Edited Resume features)
- [x] AWS account created (assumed)
- [x] Trying to setup RDS security group

### 📍 You Are Here:
**Issue:** RDS Security Group inbound rule not working

---

## 🚀 Let's Continue - Step by Step

### Step 1: Fix RDS Security Group (5 minutes)

#### Option A: Use Security Group ID (Recommended)

1. **Open two browser tabs:**
   - Tab 1: EC2 → Security Groups
   - Tab 2: EC2 → Security Groups

2. **In Tab 1 - Get EC2 Security Group ID:**
   ```
   Search for: recruitment-sg
   Click on it
   Copy the Security Group ID: sg-xxxxxxxxxxxxxxxxx
   ```
   **Write it here:** sg-_______________________

3. **In Tab 2 - Add Rule to RDS Security Group:**
   ```
   Search for: recruitment-rds-sg
   Click on it
   Click "Inbound rules" tab
   Click "Edit inbound rules"
   Click "Add rule"
   
   Fill in:
   Type: PostgreSQL
   Port: 5432 (auto-filled)
   Source: Custom
   Paste: sg-_______________________ (your EC2 SG ID)
   Description: Allow EC2 to RDS
   
   Click "Save rules"
   ```

#### Option B: Use IP Address (If Option A doesn't work)

1. **Get EC2 Private IP:**
   ```
   EC2 Console → Instances
   Select your instance
   Copy: Private IPv4 address (e.g., 172.31.45.67)
   ```
   **Write it here:** 172.31.___.___

2. **Add Rule:**
   ```
   Type: PostgreSQL
   Port: 5432
   Source: Custom
   Value: 172.31.___.___/32 (your IP with /32)
   Description: Allow EC2 IP
   
   Click "Save rules"
   ```

**✅ Checkpoint:** Rule should now appear in the inbound rules table.

---

### Step 2: Verify RDS is Ready (2 minutes)

1. **Go to RDS Console:**
   ```
   Services → RDS → Databases
   ```

2. **Check your database status:**
   ```
   Database: recruitment-db
   Status: Should be "Available" (not "Creating")
   ```

3. **If status is "Creating":**
   - Wait 5-10 minutes
   - Refresh the page
   - Continue when status is "Available"

4. **Get RDS Endpoint:**
   ```
   Click on: recruitment-db
   Tab: Connectivity & security
   Copy: Endpoint
   ```
   **Write it here:** _________________________________.rds.amazonaws.com

---

### Step 3: Connect to Your EC2 Instance (5 minutes)

#### For Windows (PowerShell):

```powershell
# Navigate to where your key is
cd C:\Users\YourName\.ssh

# Connect
ssh -i recruitment-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

#### For Mac/Linux:

```bash
# Set correct permissions
chmod 400 ~/.ssh/recruitment-key.pem

# Connect
ssh -i ~/.ssh/recruitment-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

**Replace YOUR_EC2_PUBLIC_IP with your actual IP!**

**✅ Checkpoint:** You should see Ubuntu welcome message.

---

### Step 4: Verify EC2 Setup (3 minutes)

Once connected to EC2, run these commands:

```bash
# Check if setup script ran
cat /home/ubuntu/setup-complete.txt
# Should show: "Setup complete!"

# Verify Node.js
node --version
# Should show: v18.x.x

# Verify npm
npm --version
# Should show: 9.x.x or 10.x.x

# Verify Git
git --version
# Should show: git version 2.x.x

# Verify PM2
pm2 --version
# Should show: 5.x.x

# Verify Nginx
nginx -v
# Should show: nginx version
```

**If any command fails:**
```bash
# Install missing packages
sudo apt-get update
sudo apt-get install -y nodejs npm git nginx

# Install PM2
sudo npm install -g pm2
```

---

### Step 5: Clone Your Repository (5 minutes)

```bash
# Create app directory
cd /home/ubuntu
mkdir -p app
cd app

# Clone your repository
git clone https://github.com/Venakt007/Delta-cube-management-system.git

# Enter the directory
cd Delta-cube-management-system

# Check if files are there
ls -la
# Should see: client, routes, server.js, package.json, etc.
```

**✅ Checkpoint:** Repository cloned successfully.

---

### Step 6: Create Environment File (5 minutes)

```bash
# Create .env file
nano .env
```

**Paste this (replace with YOUR actual values):**

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:YOUR_RDS_PASSWORD@YOUR_RDS_ENDPOINT:5432/recruitment_db

# Example:
# DATABASE_URL=postgresql://postgres:MyPassword123@recruitment-db.abc123.us-east-1.rds.amazonaws.com:5432/recruitment_db

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random

# Server Configuration
PORT=5000
NODE_ENV=production

# OpenAI API Key (optional - leave empty if you don't have one)
OPENAI_API_KEY=
```

**Important:** Replace these:
- `YOUR_RDS_PASSWORD` → Your actual RDS password
- `YOUR_RDS_ENDPOINT` → Your actual RDS endpoint (from Step 2)
- `JWT_SECRET` → Any random long string

**Save and exit:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

**Verify it was created:**
```bash
cat .env
# Should show your configuration
```

---

### Step 7: Install Dependencies (10 minutes)

```bash
# Install backend dependencies
npm install

# This will take 2-3 minutes
# You'll see a progress bar

# Install frontend dependencies
cd client
npm install

# This will take 3-5 minutes
# You'll see a progress bar

# Go back to root
cd ..
```

**✅ Checkpoint:** Both `node_modules` folders created.

---

### Step 8: Build Frontend (5 minutes)

```bash
# Build React app for production
cd client
npm run build

# This will take 2-3 minutes
# You'll see: "Creating an optimized production build..."

# Verify build folder was created
ls -la build/
# Should see: index.html, static/, etc.

# Go back to root
cd ..
```

**✅ Checkpoint:** `client/build` folder exists.

---

### Step 9: Setup Database (5 minutes)

```bash
# Run database setup
node setup-database.js

# You should see:
# 🚀 Setting up database tables...
# ✅ Users table created
# ✅ Applications table created
# ✅ Technologies table created
# ✅ Database setup completed successfully!
```

**If you see connection error:**
```bash
# Test database connection first
psql -h YOUR_RDS_ENDPOINT -U postgres -d recruitment_db

# Enter your RDS password when prompted
# If it connects, database is accessible
# Type \q to exit

# If connection fails, check:
# 1. RDS security group has the rule
# 2. RDS endpoint is correct in .env
# 3. Password is correct in .env
```

---

### Step 10: Run Migrations (3 minutes)

```bash
# Add super admin role
node migrations/add-super-admin-role.js

# Should see:
# ✅ Migration completed successfully!

# Add edited resume field
node migrations/add-edited-resume-field.js

# Should see:
# ✅ Migration completed successfully!
```

---

### Step 11: Create Super Admin User (2 minutes)

```bash
# Create super admin automatically
node create-super-admin-auto.js

# You'll see:
# ✅ Super Admin created successfully!
# 
# 🔑 Login Credentials:
#   Email: superadmin@example.com
#   Password: SuperAdmin123!
```

**⚠️ IMPORTANT: Write down these credentials!**
```
Email: superadmin@example.com
Password: SuperAdmin123!
```

---

### Step 12: Start Application with PM2 (5 minutes)

```bash
# Start the application
pm2 start server.js --name recruitment-app

# You should see:
# [PM2] Starting server.js in fork_mode (1 instance)
# [PM2] Done.

# Check status
pm2 status

# Should show:
# │ recruitment-app │ online │

# View logs
pm2 logs recruitment-app --lines 20

# Should see:
# Server running on port 5000
# Database connected successfully

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Copy and run the command it shows
# It will look like:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

**✅ Checkpoint:** Application is running on port 5000.

---

### Step 13: Configure Nginx (10 minutes)

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/recruitment
```

**Paste this (replace YOUR_EC2_PUBLIC_IP):**

```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;  # Replace with your actual EC2 public IP

    # Serve static files from React build
    location / {
        root /home/ubuntu/app/Delta-cube-management-system/client/build;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Serve uploaded files
    location /uploads {
        alias /home/ubuntu/app/Delta-cube-management-system/uploads;
    }

    # Serve landing page
    location /landing.html {
        root /home/ubuntu/app/Delta-cube-management-system/client/public;
    }

    # Serve application form
    location /apply.html {
        root /home/ubuntu/app/Delta-cube-management-system/client/public;
    }
}
```

**Save and exit** (Ctrl+X, Y, Enter)

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/recruitment /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Should show:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx

# Should show: active (running)

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

---

### Step 14: Create Uploads Directory (2 minutes)

```bash
# Create uploads directory
mkdir -p /home/ubuntu/app/Delta-cube-management-system/uploads

# Set permissions
chmod 755 /home/ubuntu/app/Delta-cube-management-system/uploads

# Verify
ls -la /home/ubuntu/app/Delta-cube-management-system/
# Should see: uploads directory
```

---

### Step 15: Test Your Deployment! (5 minutes)

#### Test 1: Backend Health Check

```bash
# From EC2 terminal
curl http://localhost:5000/health

# Should return:
# {"status":"ok","message":"Server is running",...}
```

#### Test 2: Frontend in Browser

**Open your browser and go to:**
```
http://YOUR_EC2_PUBLIC_IP/
```

**You should see your application!**

#### Test 3: All URLs

Test these URLs in your browser:

- [ ] Landing page: `http://YOUR_IP/landing.html`
- [ ] Application form: `http://YOUR_IP/apply.html`
- [ ] Login page: `http://YOUR_IP/login`

#### Test 4: Login as Super Admin

1. Go to: `http://YOUR_IP/login`
2. Enter:
   - Email: `superadmin@example.com`
   - Password: `SuperAdmin123!`
3. Click Login
4. Should redirect to: `/super-admin`
5. You should see 5 tabs:
   - Recruiter Uploads
   - Social Media
   - Onboarded
   - JD Search
   - User Management

---

## 🎉 Congratulations!

Your application is now live on AWS!

### 📝 Save These Details:

```
=== YOUR DEPLOYMENT INFO ===

Application URL: http://___.___.___.___ 

Super Admin Login:
Email: superadmin@example.com
Password: SuperAdmin123!

SSH Command:
ssh -i ~/.ssh/recruitment-key.pem ubuntu@___.___.___.___ 

RDS Endpoint: _________________________________.rds.amazonaws.com
RDS Password: _________________ 

=== END ===
```

---

## 🔄 Next Steps:

### 1. Change Super Admin Password (Important!)

1. Login as super admin
2. Go to User Management tab
3. Click Edit on your account
4. Change password
5. Save

### 2. Create Additional Users

1. Go to User Management tab
2. Click "+ Add User"
3. Create admin and recruiter accounts

### 3. Test All Features

- [ ] Upload resume as recruiter
- [ ] Upload edited resume
- [ ] View resumes as admin
- [ ] Download edited resume
- [ ] Test JD matching
- [ ] Test all status updates

---

## 🐛 Troubleshooting

### Application won't start:
```bash
pm2 logs recruitment-app
# Check for errors
```

### Can't connect to database:
```bash
# Test connection
psql -h YOUR_RDS_ENDPOINT -U postgres -d recruitment_db
```

### Nginx shows error:
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Page not loading:
```bash
# Check if app is running
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check firewall
sudo ufw status
```

---

## 📞 Need Help?

If you're stuck at any step:

1. Check the error message
2. Look at the logs: `pm2 logs recruitment-app`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Verify security groups in AWS Console
5. Test database connection from EC2

---

**You're doing great! Keep going!** 🚀
