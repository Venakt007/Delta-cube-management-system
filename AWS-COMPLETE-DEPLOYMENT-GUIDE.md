# Complete AWS Deployment Guide - Step by Step

## 📋 Overview

This guide will help you deploy your recruitment system on AWS from scratch.

**What you'll create:**
- ✅ EC2 instance (Ubuntu server)
- ✅ RDS PostgreSQL database
- ✅ Security groups for both
- ✅ Elastic IP (optional)
- ✅ Full application deployment

**Estimated Time:** 45-60 minutes  
**Estimated Cost:** $20-30/month

---

## 🎯 Phase 1: AWS Account Setup (5 minutes)

### Step 1.1: Create AWS Account
- [ ] Go to https://aws.amazon.com
- [ ] Click "Create an AWS Account"
- [ ] Enter email, password, account name
- [ ] Add payment method (credit card)
- [ ] Verify phone number
- [ ] Choose "Basic Support - Free"

### Step 1.2: Login to AWS Console
- [ ] Go to https://console.aws.amazon.com
- [ ] Login with your credentials
- [ ] Select region: **US East (N. Virginia)** or closest to you

---

## 🎯 Phase 2: Create Security Groups (10 minutes)

### Step 2.1: Create EC2 Security Group

1. **Navigate:**
   ```
   AWS Console → Services → EC2 → Security Groups (left menu)
   ```

2. **Click "Create security group"**

3. **Fill in details:**
   ```
   Security group name: recruitment-sg
   Description: Security group for recruitment EC2 instance
   VPC: (leave default)
   ```

4. **Add Inbound Rules:**
   
   Click "Add rule" for each:
   
   **Rule 1 - SSH:**
   ```
   Type: SSH
   Protocol: TCP
   Port: 22
   Source: My IP (auto-detects your IP)
   Description: SSH access
   ```
   
   **Rule 2 - HTTP:**
   ```
   Type: HTTP
   Protocol: TCP
   Port: 80
   Source: Anywhere-IPv4 (0.0.0.0/0)
   Description: HTTP access
   ```
   
   **Rule 3 - HTTPS:**
   ```
   Type: HTTPS
   Protocol: TCP
   Port: 443
   Source: Anywhere-IPv4 (0.0.0.0/0)
   Description: HTTPS access
   ```
   
   **Rule 4 - Node.js App:**
   ```
   Type: Custom TCP
   Protocol: TCP
   Port: 5000
   Source: Anywhere-IPv4 (0.0.0.0/0)
   Description: Node.js application
   ```

5. **Click "Create security group"**

6. **IMPORTANT: Copy the Security Group ID**
   ```
   Example: sg-0a1b2c3d4e5f6g7h8
   ```
   Save this! You'll need it for RDS.

### Step 2.2: Create RDS Security Group

1. **Click "Create security group"** again

2. **Fill in details:**
   ```
   Security group name: recruitment-rds-sg
   Description: Security group for recruitment RDS database
   VPC: (same as EC2 - should be default)
   ```

3. **Add Inbound Rule:**
   ```
   Type: PostgreSQL
   Protocol: TCP
   Port: 5432
   Source: Custom
   Source value: sg-0a1b2c3d4e5f6g7h8 (paste your EC2 security group ID)
   Description: Allow EC2 to connect to RDS
   ```

4. **Click "Create security group"**

**✅ Checkpoint:** You should now have 2 security groups:
- `recruitment-sg` (for EC2)
- `recruitment-rds-sg` (for RDS)

---

## 🎯 Phase 3: Create RDS Database (15 minutes)

### Step 3.1: Navigate to RDS

```
AWS Console → Services → RDS → Databases → Create database
```

### Step 3.2: Choose Database Creation Method

- [ ] Select: **Standard create**

### Step 3.3: Engine Options

```
Engine type: PostgreSQL
Engine version: PostgreSQL 15.x (latest)
```

### Step 3.4: Templates

- [ ] Select: **Free tier** (if available) or **Dev/Test**

### Step 3.5: Settings

```
DB instance identifier: recruitment-db
Master username: postgres
Master password: [Create a strong password]
Confirm password: [Same password]
```

**⚠️ IMPORTANT: Save your password!**
```
Database: recruitment-db
Username: postgres
Password: _________________ (write it down!)
```

### Step 3.6: Instance Configuration

```
DB instance class: db.t3.micro (Free tier eligible)
Storage type: General Purpose SSD (gp2)
Allocated storage: 20 GB
```

### Step 3.7: Connectivity

```
Virtual private cloud (VPC): (default)
Subnet group: (default)
Public access: No
VPC security group: Choose existing
Existing VPC security groups: recruitment-rds-sg (remove default)
Availability Zone: No preference
```

### Step 3.8: Database Authentication

```
Database authentication: Password authentication
```

### Step 3.9: Additional Configuration

**Click "Additional configuration" to expand**

```
Initial database name: recruitment_db
DB parameter group: (default)
Backup retention period: 7 days
Enable encryption: (optional, leave default)
Enable Enhanced monitoring: No (to save costs)
Enable auto minor version upgrade: Yes
```

### Step 3.10: Create Database

- [ ] Click **"Create database"**
- [ ] Wait 5-10 minutes for database to be created
- [ ] Status will change from "Creating" to "Available"

### Step 3.11: Get Database Endpoint

Once status is "Available":

1. Click on your database name: `recruitment-db`
2. Under "Connectivity & security" tab
3. Copy the **Endpoint**:
   ```
   Example: recruitment-db.abc123xyz.us-east-1.rds.amazonaws.com
   ```
4. **Save this endpoint!** You'll need it later.

**✅ Checkpoint:** Database is created and you have:
- Database endpoint
- Username: postgres
- Password: (your password)
- Database name: recruitment_db

---

## 🎯 Phase 4: Create EC2 Instance (15 minutes)

### Step 4.1: Navigate to EC2

```
AWS Console → Services → EC2 → Instances → Launch instances
```

### Step 4.2: Name and Tags

```
Name: recruitment-server
```

### Step 4.3: Application and OS Images

```
Amazon Machine Image (AMI): Ubuntu Server 22.04 LTS
Architecture: 64-bit (x86)
```

### Step 4.4: Instance Type

```
Instance type: t2.micro (Free tier eligible)
```

### Step 4.5: Key Pair (Login)

**If you don't have a key pair:**

1. Click "Create new key pair"
2. Fill in:
   ```
   Key pair name: recruitment-key
   Key pair type: RSA
   Private key file format: .pem (for Mac/Linux) or .ppk (for Windows/PuTTY)
   ```
3. Click "Create key pair"
4. **IMPORTANT:** Save the downloaded file! You can't download it again.
5. Move it to a safe location:
   ```bash
   # Mac/Linux
   mv ~/Downloads/recruitment-key.pem ~/.ssh/
   chmod 400 ~/.ssh/recruitment-key.pem
   
   # Windows
   Move to: C:\Users\YourName\.ssh\recruitment-key.pem
   ```

**If you already have a key pair:**
- Select your existing key pair

### Step 4.6: Network Settings

```
VPC: (default)
Subnet: (default)
Auto-assign public IP: Enable
Firewall (security groups): Select existing security group
Select: recruitment-sg
```

### Step 4.7: Configure Storage

```
Size: 20 GB
Volume type: gp3
```

### Step 4.8: Advanced Details

**Expand "Advanced details"**

Scroll to **User data** and paste:

```bash
#!/bin/bash
# Update system
apt-get update
apt-get upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install Git
apt-get install -y git

# Install PostgreSQL client
apt-get install -y postgresql-client

# Install PM2 globally
npm install -g pm2

# Install Nginx
apt-get install -y nginx

# Create app directory
mkdir -p /home/ubuntu/app
chown ubuntu:ubuntu /home/ubuntu/app

echo "Setup complete!" > /home/ubuntu/setup-complete.txt
```

### Step 4.9: Launch Instance

- [ ] Click **"Launch instance"**
- [ ] Wait 2-3 minutes for instance to start
- [ ] Status will change to "Running"

### Step 4.10: Get Instance Details

1. Go to EC2 → Instances
2. Select your instance: `recruitment-server`
3. Copy these details:

```
Instance ID: i-0123456789abcdef
Public IPv4 address: 54.123.45.67 (save this!)
Private IPv4 address: 172.31.x.x
```

**✅ Checkpoint:** EC2 instance is running and you have:
- Public IP address
- Private key file (.pem)
- Instance is accessible

---

## 🎯 Phase 5: Connect to EC2 and Setup (20 minutes)

### Step 5.1: Connect via SSH

**Mac/Linux:**
```bash
chmod 400 ~/.ssh/recruitment-key.pem
ssh -i ~/.ssh/recruitment-key.pem ubuntu@54.123.45.67
```

**Windows (PowerShell):**
```powershell
ssh -i C:\Users\YourName\.ssh\recruitment-key.pem ubuntu@54.123.45.67
```

**Windows (PuTTY):**
1. Open PuTTY
2. Host Name: ubuntu@54.123.45.67
3. Connection → SSH → Auth → Browse for .ppk file
4. Click Open

### Step 5.2: Verify Setup

Once connected, run:

```bash
# Check if setup script ran
cat /home/ubuntu/setup-complete.txt

# Verify installations
node --version    # Should show v18.x
npm --version     # Should show 9.x or 10.x
git --version     # Should show git version
pm2 --version     # Should show PM2 version
nginx -v          # Should show nginx version
```

### Step 5.3: Clone Your Repository

```bash
cd /home/ubuntu/app
git clone https://github.com/Venakt007/Delta-cube-management-system.git
cd Delta-cube-management-system
```

### Step 5.4: Create Environment File

```bash
nano .env
```

Paste this (replace with your actual values):

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:YOUR_RDS_PASSWORD@recruitment-db.abc123xyz.us-east-1.rds.amazonaws.com:5432/recruitment_db

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=production

# OpenAI API Key (optional, for AI features)
OPENAI_API_KEY=your-openai-api-key-if-you-have-one
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

### Step 5.5: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 5.6: Build Frontend

```bash
cd client
npm run build
cd ..
```

### Step 5.7: Setup Database

```bash
# Run database setup
node setup-database.js

# Run migrations
node migrations/add-super-admin-role.js
node migrations/add-edited-resume-field.js

# Create super admin user
node create-super-admin-auto.js
```

**Note the super admin credentials shown!**

### Step 5.8: Start Application with PM2

```bash
# Start the application
pm2 start server.js --name recruitment-app

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it shows

# Check status
pm2 status
pm2 logs recruitment-app
```

### Step 5.9: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/recruitment
```

Paste this:

```nginx
server {
    listen 80;
    server_name 54.123.45.67;  # Replace with your EC2 public IP

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

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

### Step 5.10: Create Uploads Directory

```bash
mkdir -p /home/ubuntu/app/Delta-cube-management-system/uploads
chmod 755 /home/ubuntu/app/Delta-cube-management-system/uploads
```

**✅ Checkpoint:** Application is running!

---

## 🎯 Phase 6: Test Your Deployment (5 minutes)

### Step 6.1: Test Backend

```bash
# From your EC2 terminal
curl http://localhost:5000/health

# Should return: {"status":"ok",...}
```

### Step 6.2: Test Frontend

Open your browser and go to:

```
http://54.123.45.67/
```

You should see your application!

### Step 6.3: Test All URLs

- [ ] Landing page: `http://54.123.45.67/landing.html`
- [ ] Application form: `http://54.123.45.67/apply.html`
- [ ] Login: `http://54.123.45.67/login`
- [ ] After login: Should redirect to appropriate dashboard

### Step 6.4: Test Database Connection

```bash
# From EC2 terminal
psql -h recruitment-db.abc123xyz.us-east-1.rds.amazonaws.com -U postgres -d recruitment_db

# Enter your RDS password when prompted
# If it connects, database is working!

# Check tables
\dt

# Exit
\q
```

**✅ Checkpoint:** Everything is working!

---

## 🎯 Phase 7: Optional - Setup Domain Name (15 minutes)

### Step 7.1: Get Elastic IP (Recommended)

Your EC2 public IP changes when you restart. Get a permanent IP:

1. Go to EC2 → Elastic IPs (left menu)
2. Click "Allocate Elastic IP address"
3. Click "Allocate"
4. Select the new IP
5. Click "Actions" → "Associate Elastic IP address"
6. Select your instance: `recruitment-server`
7. Click "Associate"

**Your new permanent IP:** 54.234.56.78

### Step 7.2: Update Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/recruitment

# Change server_name to your new Elastic IP
server_name 54.234.56.78;

# Save and restart
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7.3: Setup Domain (Optional)

If you have a domain name:

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add an A record:
   ```
   Type: A
   Name: @ (or recruitment)
   Value: 54.234.56.78 (your Elastic IP)
   TTL: 3600
   ```
3. Wait 5-60 minutes for DNS propagation
4. Update Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/recruitment
   # Change server_name to: yourdomain.com
   sudo systemctl restart nginx
   ```

---

## 🎯 Phase 8: Security Hardening (10 minutes)

### Step 8.1: Setup Firewall

```bash
# Enable UFW firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5000/tcp  # Node.js (optional, Nginx proxies)
sudo ufw enable

# Check status
sudo ufw status
```

### Step 8.2: Secure SSH

```bash
# Disable password authentication
sudo nano /etc/ssh/sshd_config

# Find and change these lines:
PasswordAuthentication no
PermitRootLogin no

# Save and restart SSH
sudo systemctl restart sshd
```

### Step 8.3: Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate (only if you have a domain)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is setup automatically
```

---

## 🎯 Phase 9: Monitoring and Maintenance

### Daily Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs recruitment-app

# Restart application
pm2 restart recruitment-app

# Check Nginx status
sudo systemctl status nginx

# Check disk space
df -h

# Check memory
free -h
```

### Update Application

```bash
cd /home/ubuntu/app/Delta-cube-management-system

# Pull latest code
git pull origin main

# Install new dependencies
npm install
cd client && npm install && cd ..

# Rebuild frontend
cd client && npm run build && cd ..

# Run new migrations (if any)
node migrations/add-new-migration.js

# Restart application
pm2 restart recruitment-app
```

---

## ✅ Final Checklist

- [ ] EC2 instance running
- [ ] RDS database created and accessible
- [ ] Security groups configured correctly
- [ ] Application code deployed
- [ ] Database setup complete
- [ ] Super admin user created
- [ ] PM2 running application
- [ ] Nginx configured and running
- [ ] Can access application via browser
- [ ] Can login and use all features
- [ ] Uploads directory working
- [ ] Database connections working

---

## 📊 Your Deployment Details

Fill this in for your records:

```
=== AWS DEPLOYMENT DETAILS ===

EC2 Instance:
- Instance ID: i-_______________
- Public IP: ___.___.___.___ (or Elastic IP)
- Private IP: 172.31.___.___ 
- Key Pair: recruitment-key.pem
- Security Group: recruitment-sg (sg-_______________)

RDS Database:
- Endpoint: recruitment-db.____________.rds.amazonaws.com
- Port: 5432
- Database: recruitment_db
- Username: postgres
- Password: _________________ (keep secret!)
- Security Group: recruitment-rds-sg (sg-_______________)

Application:
- URL: http://___.___.___.___ 
- Super Admin Email: superadmin@example.com
- Super Admin Password: SuperAdmin123! (change this!)

SSH Command:
ssh -i ~/.ssh/recruitment-key.pem ubuntu@___.___.___.___ 

=== END ===
```

---

## 🆘 Troubleshooting

### Application won't start
```bash
pm2 logs recruitment-app
# Check for errors
```

### Can't connect to database
```bash
# Test from EC2
telnet recruitment-db.abc123.rds.amazonaws.com 5432
# Should connect

# Check security group allows EC2 SG
```

### Nginx shows error
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Out of disk space
```bash
# Check space
df -h

# Clean up
sudo apt-get clean
pm2 flush  # Clear PM2 logs
```

---

## 💰 Cost Estimate

**Monthly costs (approximate):**
- EC2 t2.micro: $8-10/month
- RDS db.t3.micro: $15-20/month
- Data transfer: $1-5/month
- **Total: ~$25-35/month**

**Free tier (first 12 months):**
- EC2: 750 hours/month free
- RDS: 750 hours/month free
- **Total: ~$0-5/month**

---

## 🎉 Congratulations!

Your recruitment system is now live on AWS!

**Access your application:**
- Landing: http://your-ip/landing.html
- Apply: http://your-ip/apply.html
- Login: http://your-ip/login

**Next steps:**
1. Change super admin password
2. Create recruiter and admin users
3. Test all features
4. Setup domain name (optional)
5. Setup SSL certificate (recommended)
6. Configure backups
7. Setup monitoring

---

**Need help?** Check the other guides:
- `AWS-RDS-SECURITY-GROUP-FIX.md` - RDS connection issues
- `SUPER-ADMIN-GUIDE.md` - Super admin features
- `DEPLOYMENT-GUIDE.md` - General deployment info
