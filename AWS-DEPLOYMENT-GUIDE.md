# ☁️ AWS Deployment Guide - Delta Cube Recruitment System

**Complete step-by-step guide to deploy your recruitment management system on AWS.**

This guide is written for beginners - no AWS experience needed! Follow each step carefully.

---

## 📖 What You'll Learn

1. How to set up AWS account
2. How to create a database in the cloud
3. How to deploy your Node.js application
4. How to set up file storage for resumes
5. How to get a secure HTTPS website
6. How to monitor and maintain your system

**Total Time:** 2-3 hours  
**Difficulty:** Beginner-friendly  
**Cost:** $30-50/month to start

---

## 🎯 What We're Building

```
Your Users → Your Domain (https://yourcompany.com)
                    ↓
            AWS Load Balancer (handles HTTPS)
                    ↓
            EC2 Server (runs your Node.js app)
                    ↓
            ┌───────┴───────┐
            ↓               ↓
    RDS Database    S3 Storage (or Cloudinary)
    (PostgreSQL)    (Resume files)
```
z
- **Load Balancer:** Handles web traffic, provides HTTPS security
- **EC2 Server:** Runs your recruitment application
- **RDS Database:** Stores candidate data, users, applications
- **S3/Cloudinary:** Stores uploaded resume files

---

## 💰 Cost Breakdown (Monthly)

### Starter Setup (~$30-50/month)
- **EC2 t3.small:** $15/month (your application server)
- **RDS db.t3.micro:** $15/month (your database)
- **S3 Storage:** $1-5/month (resume files)
- **Load Balancer:** $16/month (HTTPS and traffic management)
- **Data Transfer:** $0-5/month (depends on traffic)

### What You Get:
- ✅ 24/7 uptime
- ✅ Automatic backups
- ✅ HTTPS security
- ✅ Can handle 100-500 users
- ✅ Professional setup

**Note:** You can use Cloudinary (free tier) instead of S3 to save $1-5/month!

### Option 2: Scalable & Production-Ready
```
Internet → Route 53 → CloudFront → Application Load Balancer
                                           ↓
                                    Auto Scaling Group
                                    (2-4 EC2 instances)
                                           ↓
                                    RDS PostgreSQL (Multi-AZ)
                                           ↓
                                    S3 Bucket + CloudFront
```

**Monthly Cost:** ~$100-200

---

## 🛠️ AWS Services You'll Use

### 1. **EC2 (Elastic Compute Cloud)** - Application Server
**Purpose:** Run your Node.js application  
**Recommended Instance:** t3.small or t3.medium  
**Why:** Runs your backend and serves frontend

### 2. **RDS (Relational Database Service)** - PostgreSQL Database
**Purpose:** Managed PostgreSQL database  
**Recommended Instance:** db.t3.micro or db.t3.small  
**Why:** Automatic backups, easy scaling, managed updates

### 3. **S3 (Simple Storage Service)** - File Storage
**Purpose:** Store resume files and ID proofs  
**Why:** Unlimited storage, cheaper than EC2 disk, CDN-ready

### 4. **Application Load Balancer (ALB)** - Traffic Distribution
**Purpose:** HTTPS termination, load balancing  
**Why:** SSL certificate management, health checks, auto-scaling

### 5. **Route 53** - DNS Management
**Purpose:** Domain name management  
**Why:** Fast DNS, health checks, routing policies

### 6. **CloudFront (Optional)** - CDN
**Purpose:** Fast content delivery worldwide  
**Why:** Cache static files, reduce latency

### 7. **Certificate Manager (ACM)** - SSL Certificates
**Purpose:** Free SSL certificates  
**Why:** HTTPS for your domain, auto-renewal

### 8. **CloudWatch** - Monitoring & Logs
**Purpose:** Application monitoring and logging  
**Why:** Track performance, errors, and usage

### 9. **IAM** - Access Management
**Purpose:** Security and permissions  
**Why:** Secure access to AWS resources

---

## 📋 Step-by-Step AWS Deployment

### Phase 1: Initial Setup (30 minutes)

#### Step 1: Create AWS Account
1. Go to https://aws.amazon.com
2. Create account (requires credit card)
3. Enable MFA for root account
4. Create IAM admin user (don't use root!) 001092882087

#### Step 2: Set Up VPC (Virtual Private Cloud)
```bash
# Use default VPC or create new one
# Ensure you have:
- Public subnet (for ALB)
- Private subnet (for RDS)
- Internet Gateway
- Security Groups
```

#### Step 3: Create RDS PostgreSQL Database
1. Go to RDS Console
2. Click "Create database"
3. Choose PostgreSQL
4. Select "Free tier" or "Production" template
5. Configure:
   ```
   DB Instance: db.t3.micro (free tier) or db.t3.small
   DB Name: recruitment_db
   Master username: postgres
   Master password: [strong password]
   Storage: 20GB (auto-scaling enabled)
   Backup retention: 7 days
   Multi-AZ: No (for cost) or Yes (for production)
   Public access: No
   VPC Security Group: Create new (allow port 5432)
   ```
6. Click "Create database"
7. Wait 5-10 minutes for creation
8. Note the endpoint URL

**Security Group Rules for RDS:**
```
Inbound:
- Type: PostgreSQL
- Port: 5432
- Source: EC2 Security Group
```

#### Step 4: Create S3 Bucket for Resumes
1. Go to S3 Console
2. Click "Create bucket"
3. Configure:
   ```
   Bucket name: recruitment-resumes-[your-unique-id]
   Region: Same as EC2
   Block all public access: Yes (we'll use signed URLs)
   Versioning: Enabled (optional)
   Encryption: Enabled
   ```
4. Create bucket
5. Create IAM policy for EC2 to access S3

**S3 Bucket Policy (for EC2 access):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::recruitment-resumes-[your-id]/*"
    }
  ]
}
```

---

### Phase 2: EC2 Setup (45 minutes)

#### Step 1: Launch EC2 Instance
1. Go to EC2 Console
2. Click "Launch Instance"
3. Configure:
   ```
   Name: recruitment-app-server
   AMI: Ubuntu Server 22.04 LTS
   Instance type: t3.small (2 vCPU, 2GB RAM)
   Key pair: Create new or use existing
   Network: Default VPC
   Subnet: Public subnet
   Auto-assign public IP: Enable
   Storage: 20GB gp3
   ```

**Security Group for EC2:**
```
Inbound Rules:
- SSH (22) from Your IP
- HTTP (80) from Anywhere (0.0.0.0/0)
- HTTPS (443) from Anywhere (0.0.0.0/0)
- Custom TCP (5000) from ALB Security Group

Outbound Rules:
- All traffic to Anywhere
```

4. Launch instance
5. Download key pair (.pem file)
6. Connect to instance

#### Step 2: Connect to EC2
```bash
# Set permissions for key
chmod 400 your-key.pem

# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

#### Step 3: Install Dependencies on EC2
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Verify installations
node --version
npm --version
pm2 --version
nginx -v
```

#### Step 4: Clone and Setup Application
```bash
# Clone repository
cd /home/ubuntu
git clone <your-repo-url> recruitment-system
cd recruitment-system

# Install dependencies
npm install --production

# Build frontend
cd client
npm install
npm run build
cd ..

# Create uploads directory (or configure S3)
mkdir -p uploads
chmod 755 uploads
```

#### Step 5: Configure Environment Variables
```bash
# Create .env file
nano .env
```

Add this configuration:
```env
NODE_ENV=production
PORT=5000

# RDS Database URL (use your RDS endpoint)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@your-rds-endpoint.rds.amazonaws.com:5432/recruitment_db

# Security
JWT_SECRET=your_super_secure_jwt_secret_32_chars_minimum

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key

# AWS S3 (if using S3 for uploads)
AWS_REGION=us-east-1
AWS_S3_BUCKET=recruitment-resumes-your-id

# Optional
GOOGLE_PLACES_API_KEY=your_google_places_key
```

Save and secure:
```bash
chmod 600 .env
```

#### Step 6: Setup Database
```bash
# Run database setup
node setup-database.js

# Create default users
node create-default-users.js

# Verify setup
node verify-database.js
```

#### Step 7: Start Application with PM2
```bash
# Start application
pm2 start server.js --name recruitment-app --max-memory-restart 500M

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it gives you (starts with sudo)

# Check status
pm2 status
pm2 logs recruitment-app
```

#### Step 8: Configure Nginx
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/recruitment-app
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/recruitment-app /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

### Phase 3: Load Balancer & SSL (30 minutes)

#### Step 1: Create Application Load Balancer
1. Go to EC2 → Load Balancers
2. Click "Create Load Balancer"
3. Choose "Application Load Balancer"
4. Configure:
   ```
   Name: recruitment-app-alb
   Scheme: Internet-facing
   IP address type: IPv4
   VPC: Default VPC
   Availability Zones: Select 2+ zones
   Security Group: Create new
     - Allow HTTP (80) from Anywhere
     - Allow HTTPS (443) from Anywhere
   ```

#### Step 2: Create Target Group
1. Create new target group
2. Configure:
   ```
   Target type: Instances
   Name: recruitment-app-targets
   Protocol: HTTP
   Port: 80
   VPC: Default VPC
   Health check path: /health
   ```
3. Register EC2 instance as target

#### Step 3: Request SSL Certificate (ACM)
1. Go to Certificate Manager
2. Click "Request certificate"
3. Choose "Request a public certificate"
4. Add domain names:
   ```
   yourdomain.com
   www.yourdomain.com
   ```
5. Choose DNS validation
6. Request certificate
7. Add CNAME records to your DNS (Route 53 or domain provider)
8. Wait for validation (5-30 minutes)

#### Step 4: Add HTTPS Listener to ALB
1. Go back to Load Balancer
2. Add listener:
   ```
   Protocol: HTTPS
   Port: 443
   Default action: Forward to target group
   SSL certificate: Choose your ACM certificate
   ```
3. Modify HTTP listener to redirect to HTTPS

---

### Phase 4: Domain & DNS (15 minutes)

#### Option 1: Using Route 53
1. Go to Route 53
2. Create hosted zone for your domain
3. Create A record:
   ```
   Name: yourdomain.com
   Type: A - IPv4 address
   Alias: Yes
   Alias target: Your ALB
   ```
4. Create CNAME for www:
   ```
   Name: www.yourdomain.com
   Type: CNAME
   Value: yourdomain.com
   ```
5. Update nameservers at your domain registrar

#### Option 2: Using External DNS
1. Get ALB DNS name from AWS Console
2. Create A record or CNAME at your DNS provider:
   ```
   Type: CNAME
   Name: @
   Value: your-alb-dns-name.elb.amazonaws.com
   ```

---

### Phase 5: S3 Integration (Optional but Recommended)

#### Update Application to Use S3

Install AWS SDK:
```bash
npm install aws-sdk
```

Create `utils/s3Upload.js`:
```javascript
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

// Upload file to S3
async function uploadToS3(filePath, fileName) {
  const fileContent = fs.readFileSync(filePath);
  
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `resumes/${Date.now()}-${fileName}`,
    Body: fileContent,
    ContentType: 'application/pdf'
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location; // S3 URL
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
}

// Get signed URL for download
function getSignedUrl(key) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Expires: 3600 // URL expires in 1 hour
  };
  
  return s3.getSignedUrl('getObject', params);
}

// Delete file from S3
async function deleteFromS3(key) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  };
  
  try {
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    throw error;
  }
}

module.exports = { uploadToS3, getSignedUrl, deleteFromS3 };
```

Update `middleware/upload.js` to use S3 after local upload.

---

## 🔐 Security Best Practices

### 1. IAM Roles for EC2
Create IAM role with these policies:
- AmazonS3FullAccess (or custom S3 policy)
- CloudWatchLogsFullAccess
- AmazonRDSReadOnlyAccess

Attach role to EC2 instance.

### 2. Security Groups
```
RDS Security Group:
- Inbound: PostgreSQL (5432) from EC2 Security Group only

EC2 Security Group:
- Inbound: SSH (22) from Your IP only
- Inbound: HTTP (80) from ALB Security Group
- Inbound: HTTPS (443) from ALB Security Group

ALB Security Group:
- Inbound: HTTP (80) from 0.0.0.0/0
- Inbound: HTTPS (443) from 0.0.0.0/0
```

### 3. Secrets Management
Use AWS Secrets Manager for sensitive data:
```bash
# Store database password
aws secretsmanager create-secret \
  --name recruitment/db-password \
  --secret-string "your-db-password"

# Store JWT secret
aws secretsmanager create-secret \
  --name recruitment/jwt-secret \
  --secret-string "your-jwt-secret"
```

---

## 📊 Monitoring & Logging

### CloudWatch Setup
```bash
# Install CloudWatch agent on EC2
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configure CloudWatch
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### PM2 Monitoring
```bash
# Install PM2 CloudWatch integration
pm2 install pm2-cloudwatch

# Configure
pm2 set pm2-cloudwatch:aws_region us-east-1
pm2 set pm2-cloudwatch:log_group_name recruitment-app-logs
```

---

## 💰 Cost Optimization

### 1. Use Reserved Instances
Save 30-70% by committing to 1-3 years:
- EC2 Reserved Instance
- RDS Reserved Instance

### 2. Use Spot Instances (for non-critical)
Save up to 90% for development/testing environments.

### 3. Enable S3 Lifecycle Policies
Move old resumes to cheaper storage:
```
0-30 days: S3 Standard
30-90 days: S3 Intelligent-Tiering
90+ days: S3 Glacier
```

### 4. Use CloudFront for Static Assets
Reduce data transfer costs.

### 5. Set Up Billing Alerts
1. Go to CloudWatch
2. Create billing alarm
3. Set threshold (e.g., $50/month)
4. Get email notifications

---

## 🔄 Backup Strategy

### Automated RDS Backups
Already enabled by default:
- Daily automated backups
- 7-day retention (configurable)
- Point-in-time recovery

### Manual Snapshots
```bash
# Create snapshot
aws rds create-db-snapshot \
  --db-instance-identifier recruitment-db \
  --db-snapshot-identifier recruitment-backup-$(date +%Y%m%d)
```

### S3 Versioning
Enable versioning on S3 bucket for resume protection.

---

## 📈 Scaling Strategy

### Vertical Scaling (Increase Instance Size)
```bash
# Stop application
pm2 stop recruitment-app

# In AWS Console:
# 1. Stop EC2 instance
# 2. Change instance type (t3.small → t3.medium)
# 3. Start instance

# Start application
pm2 start recruitment-app
```

### Horizontal Scaling (Auto Scaling Group)
1. Create AMI from current EC2 instance
2. Create Launch Template
3. Create Auto Scaling Group
4. Configure scaling policies:
   ```
   Min: 2 instances
   Max: 4 instances
   Target: CPU 70%
   ```

---

## 🆘 Troubleshooting

### Cannot Connect to RDS
```bash
# Test connection from EC2
psql -h your-rds-endpoint.rds.amazonaws.com -U postgres -d recruitment_db

# Check security group allows EC2
# Check RDS is in same VPC
```

### Application Not Accessible
```bash
# Check EC2 instance
pm2 status
pm2 logs recruitment-app

# Check ALB health checks
# Go to Target Groups → Check health status

# Check security groups
# Ensure ALB can reach EC2 on port 80
```

### High Costs
```bash
# Check Cost Explorer
# Look for:
- Data transfer costs
- Unused resources
- Over-provisioned instances
```

---

## 📞 AWS Support

- **Documentation:** https://docs.aws.amazon.com
- **Support Plans:** Basic (free), Developer ($29/mo), Business ($100/mo)
- **Forums:** https://forums.aws.amazon.com
- **Status:** https://status.aws.amazon.com

---

## ✅ Deployment Checklist

- [ ] AWS account created
- [ ] RDS PostgreSQL created
- [ ] S3 bucket created
- [ ] EC2 instance launched
- [ ] Application deployed
- [ ] Database setup completed
- [ ] PM2 configured
- [ ] Nginx configured
- [ ] ALB created
- [ ] SSL certificate obtained
- [ ] Domain configured
- [ ] Security groups configured
- [ ] IAM roles assigned
- [ ] CloudWatch monitoring enabled
- [ ] Backups configured
- [ ] Billing alerts set
- [ ] All features tested
- [ ] Default passwords changed

---

**Estimated Total Monthly Cost:**
- **Starter:** $30-50/month (t3.small + db.t3.micro)
- **Production:** $100-200/month (t3.medium + db.t3.small + Multi-AZ)
- **Enterprise:** $300-500/month (Auto Scaling + Multi-AZ + CloudFront)

**Deployment Time:** 2-3 hours for first time

Your recruitment system is now running on AWS! 🎉
