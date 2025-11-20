# Production Deployment Guide

Complete guide to deploy the Recruitment Management System to production.

## Pre-Deployment Checklist

- [ ] All tests pass (see TESTING_GUIDE.md)
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] Default passwords changed
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Documentation updated

## Deployment Options

### Option 1: Heroku (Easiest)
### Option 2: AWS (Most Scalable)
### Option 3: DigitalOcean (Cost-Effective)
### Option 4: VPS (Full Control)

---

## Option 1: Deploy to Heroku

### Prerequisites
- Heroku account (free tier available)
- Heroku CLI installed

### Steps

#### 1. Install Heroku CLI
```bash
# Windows
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Mac
brew tap heroku/brew && brew install heroku

# Verify
heroku --version
```

#### 2. Login to Heroku
```bash
heroku login
```

#### 3. Create Heroku App
```bash
heroku create your-recruitment-app
```

#### 4. Add PostgreSQL Database
```bash
heroku addons:create heroku-postgresql:mini
```

#### 5. Set Environment Variables
```bash
heroku config:set JWT_SECRET=your_random_secret_key
heroku config:set OPENAI_API_KEY=your_openai_key
heroku config:set NODE_ENV=production
```

#### 6. Deploy Code
```bash
git init
git add .
git commit -m "Initial deployment"
git push heroku main
```

#### 7. Run Database Migrations
```bash
heroku pg:psql < database.sql
```

#### 8. Open Application
```bash
heroku open
```

### Heroku Configuration

Create `Procfile` in root:
```
web: node server.js
```

Update `server.js` to serve frontend build:
```javascript
// Add after routes
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}
```

### Cost: Free tier available, ~$7/month for database

---

## Option 2: Deploy to AWS

### Services Needed
- EC2 (server)
- RDS (PostgreSQL)
- S3 (file storage)
- Route 53 (domain)
- Certificate Manager (SSL)

### Steps

#### 1. Create RDS PostgreSQL Database
1. Go to AWS RDS Console
2. Create database
3. Choose PostgreSQL
4. Select instance size (t3.micro for start)
5. Set master password
6. Enable public access (for setup)
7. Note the endpoint URL

#### 2. Create S3 Bucket for Files
1. Go to S3 Console
2. Create bucket
3. Enable public access for uploads folder
4. Note bucket name and region

#### 3. Launch EC2 Instance
1. Go to EC2 Console
2. Launch instance (Ubuntu 22.04)
3. Choose t2.micro (free tier)
4. Configure security group:
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
   - Port 5000 (Node.js)
5. Create/download key pair
6. Launch instance

#### 4. Connect to EC2
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### 5. Install Dependencies on EC2
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL client
sudo apt install -y postgresql-client

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

#### 6. Clone and Setup Application
```bash
# Clone repository
git clone your-repo-url
cd recruitment-management-system

# Install dependencies
npm install
cd client && npm install && npm run build && cd ..

# Create .env file
nano .env
```

Add to .env:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/recruitment_db
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_key
NODE_ENV=production
AWS_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1
```

#### 7. Setup Database
```bash
psql -h your-rds-endpoint -U postgres -d recruitment_db -f database.sql
```

#### 8. Start Application with PM2
```bash
pm2 start server.js --name recruitment-app
pm2 startup
pm2 save
```

#### 9. Setup Nginx (Optional)
```bash
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/recruitment
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/recruitment /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 10. Setup SSL with Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Cost: ~$30-50/month (EC2 + RDS + S3)

---

## Option 3: Deploy to DigitalOcean

### Steps

#### 1. Create Droplet
1. Go to DigitalOcean
2. Create Droplet
3. Choose Ubuntu 22.04
4. Select $6/month plan
5. Add SSH key
6. Create droplet

#### 2. Create Managed Database
1. Go to Databases
2. Create PostgreSQL database
3. Choose $15/month plan
4. Note connection details

#### 3. Setup Application
Follow same steps as AWS EC2 (steps 4-10)

### Cost: ~$20-30/month (Droplet + Database)

---

## Option 4: Deploy to VPS (Generic)

Works with: Linode, Vultr, Contabo, etc.

### Steps

1. Create VPS instance
2. SSH into server
3. Install Node.js, PostgreSQL, Nginx
4. Clone repository
5. Setup environment variables
6. Run database migrations
7. Start with PM2
8. Configure Nginx
9. Setup SSL

Follow AWS EC2 steps 4-10 above.

### Cost: ~$5-20/month depending on provider

---

## Environment Variables for Production

```env
# Server
PORT=5000
NODE_ENV=production

# Database (use connection string from your provider)
DATABASE_URL=postgresql://user:pass@host:5432/db?ssl=true

# Security
JWT_SECRET=very_long_random_string_min_32_characters

# OpenAI
OPENAI_API_KEY=sk-your-key-here

# File Storage (if using S3)
AWS_BUCKET_NAME=your-bucket
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Frontend URL (for CORS)
FRONTEND_URL=https://your-domain.com
```

---

## Update server.js for Production

Add this code to serve frontend build:

```javascript
const path = require('path');

// ... existing code ...

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}
```

---

## Update CORS for Production

In `server.js`:

```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};

app.use(cors(corsOptions));
```

---

## Database Migration

### Backup Current Database
```bash
pg_dump -U postgres recruitment_db > backup.sql
```

### Restore to Production
```bash
psql -h production-host -U username -d recruitment_db < backup.sql
```

---

## File Storage Options

### Option A: Local Storage (Simple)
- Files stored on server
- Create uploads folder
- Ensure proper permissions
- **Limitation:** Files lost if server crashes

### Option B: AWS S3 (Recommended)
- Reliable and scalable
- Install AWS SDK: `npm install aws-sdk`
- Update upload middleware to use S3
- Cost: ~$0.02/GB/month

### Option C: Cloudflare R2
- S3-compatible
- No egress fees
- Cost: ~$0.015/GB/month

---

## SSL Certificate Setup

### Option 1: Let's Encrypt (Free)
```bash
sudo certbot --nginx -d your-domain.com
```

### Option 2: Cloudflare (Free)
1. Add site to Cloudflare
2. Update nameservers
3. Enable SSL/TLS
4. Set to "Full" mode

---

## Monitoring & Logging

### Setup PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### View Logs
```bash
pm2 logs recruitment-app
pm2 logs recruitment-app --lines 100
```

### Setup Monitoring Service
- Use PM2 Plus (free tier)
- Or use services like:
  - Datadog
  - New Relic
  - Sentry (for error tracking)

---

## Performance Optimization

### 1. Enable Gzip Compression
```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Add Caching Headers
```javascript
app.use('/uploads', express.static('uploads', {
  maxAge: '1d'
}));
```

### 3. Database Indexing
Already included in database.sql

### 4. Connection Pooling
Already configured in config/db.js

### 5. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Security Hardening

### 1. Install Security Packages
```bash
npm install helmet express-rate-limit
```

### 2. Update server.js
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);
```

### 3. Environment Variables
- Never commit .env to git
- Use secrets manager in production
- Rotate keys regularly

### 4. Database Security
- Use SSL connections
- Restrict IP access
- Use strong passwords
- Regular backups

### 5. File Upload Security
- Validate file types
- Scan for malware
- Limit file sizes
- Use separate storage

---

## Backup Strategy

### Automated Database Backups
```bash
# Create backup script
nano backup.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h your-host -U username recruitment_db > backup_$DATE.sql
# Upload to S3 or other storage
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
# Keep only last 7 days
find . -name "backup_*.sql" -mtime +7 -delete
```

Make executable and schedule:
```bash
chmod +x backup.sh
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

---

## Domain Setup

### 1. Purchase Domain
- Namecheap
- GoDaddy
- Google Domains

### 2. Configure DNS
Point A record to your server IP:
```
Type: A
Name: @
Value: your-server-ip
TTL: 3600
```

For www subdomain:
```
Type: CNAME
Name: www
Value: your-domain.com
TTL: 3600
```

### 3. Wait for Propagation
- Usually 1-24 hours
- Check with: `nslookup your-domain.com`

---

## Post-Deployment Checklist

- [ ] Application accessible via domain
- [ ] SSL certificate working (https://)
- [ ] Database connected and working
- [ ] File uploads working
- [ ] Resume parsing working
- [ ] All features tested in production
- [ ] Admin login working
- [ ] Recruiter login working
- [ ] Public form working
- [ ] Monitoring setup
- [ ] Backups configured
- [ ] Error logging working
- [ ] Performance acceptable
- [ ] Security headers present
- [ ] CORS configured correctly

---

## Maintenance Tasks

### Daily
- Check error logs
- Monitor API usage (OpenAI)
- Check disk space

### Weekly
- Review application logs
- Check database size
- Test backups
- Review security alerts

### Monthly
- Update dependencies
- Review and rotate logs
- Performance analysis
- Cost optimization
- Security audit

---

## Scaling Considerations

### When to Scale
- Response time > 2 seconds
- CPU usage > 80%
- Memory usage > 80%
- Database connections maxed out

### Scaling Options
1. **Vertical Scaling:** Upgrade server size
2. **Horizontal Scaling:** Add more servers + load balancer
3. **Database Scaling:** Read replicas, connection pooling
4. **Caching:** Redis for session/data caching
5. **CDN:** CloudFlare for static assets

---

## Troubleshooting Production Issues

### Application Won't Start
```bash
# Check logs
pm2 logs recruitment-app

# Check environment variables
pm2 env 0

# Restart application
pm2 restart recruitment-app
```

### Database Connection Issues
```bash
# Test connection
psql -h your-host -U username -d recruitment_db

# Check firewall
sudo ufw status

# Check security groups (AWS)
```

### High Memory Usage
```bash
# Check memory
free -h

# Check processes
pm2 list

# Restart if needed
pm2 restart recruitment-app
```

### Slow Performance
```bash
# Check database queries
# Add logging to slow queries

# Check API response times
# Use monitoring tools

# Check server resources
htop
```

---

## Cost Optimization

### Reduce OpenAI Costs
- Cache parsed resumes
- Use GPT-3.5 instead of GPT-4
- Batch processing
- Implement retry logic

### Reduce Server Costs
- Use reserved instances (AWS)
- Right-size your instances
- Use spot instances for non-critical tasks
- Implement auto-scaling

### Reduce Storage Costs
- Compress files
- Delete old resumes
- Use lifecycle policies
- Choose right storage tier

---

## Support & Updates

### Updating Production
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install
cd client && npm install && npm run build && cd ..

# Restart application
pm2 restart recruitment-app
```

### Rolling Back
```bash
# Revert to previous commit
git revert HEAD

# Or checkout specific version
git checkout previous-commit-hash

# Rebuild and restart
npm install
cd client && npm install && npm run build && cd ..
pm2 restart recruitment-app
```

---

## Success Metrics

Track these in production:
- Uptime percentage (target: 99.9%)
- Average response time (target: < 1s)
- Error rate (target: < 0.1%)
- User satisfaction
- Cost per user
- Resume processing time

---

**Congratulations!** Your recruitment system is now live in production! 🎉
