# 🚀 Production Deployment Checklist

Use this checklist to ensure a smooth deployment of your Recruitment Management System.

---

## ✅ Pre-Deployment (Do This First!)

### 1. Code Preparation
- [ ] All features tested locally
- [ ] No console.log statements in production code
- [ ] All dependencies up to date (`npm audit fix`)
- [ ] Git repository clean (no uncommitted changes)
- [ ] `.gitignore` includes `.env` and `node_modules`

### 2. Environment Setup
- [ ] Create production `.env` file
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong JWT_SECRET: `openssl rand -base64 32`
- [ ] Add valid OPENAI_API_KEY
- [ ] Configure production DATABASE_URL
- [ ] Set PORT (default: 5000)

### 3. Database Preparation
- [ ] PostgreSQL installed and running
- [ ] Create database: `CREATE DATABASE recruitment_db;`
- [ ] Test database connection
- [ ] Backup any existing data

---

## 🔧 Deployment Steps

### Step 1: Server Setup (VPS/Cloud)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install -y nginx
```

- [ ] System updated
- [ ] Node.js installed (verify: `node --version`)
- [ ] PostgreSQL installed (verify: `psql --version`)
- [ ] PM2 installed (verify: `pm2 --version`)

### Step 2: Application Deployment
```bash
# Clone repository
git clone <your-repo-url>
cd recruitment-system

# Install dependencies
npm install --production

# Build frontend
cd client
npm install
npm run build
cd ..

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Copy environment file
cp .env.example .env
nano .env  # Edit with production values
```

- [ ] Repository cloned
- [ ] Backend dependencies installed
- [ ] Frontend built successfully
- [ ] Uploads directory created
- [ ] `.env` file configured

### Step 3: Database Setup
```bash
# Run database setup
node setup-database.js

# Create default users
node create-default-users.js

# Verify setup
node verify-database.js

# Test operations
node test-database-operations.js
```

- [ ] Database tables created
- [ ] Default users created
- [ ] Database verified
- [ ] Test operations passed

### Step 4: Start Application
```bash
# Start with PM2
pm2 start server.js --name recruitment-app --max-memory-restart 500M

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Follow the command it gives you

# Check status
pm2 status
pm2 logs recruitment-app
```

- [ ] Application started with PM2
- [ ] PM2 configuration saved
- [ ] PM2 startup configured
- [ ] Application running without errors

### Step 5: Configure Nginx (Optional but Recommended)
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/recruitment-app
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

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
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/recruitment-app /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

- [ ] Nginx configured
- [ ] Configuration tested
- [ ] Nginx restarted
- [ ] Site accessible via domain

### Step 6: SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] HTTPS working
- [ ] Auto-renewal configured

---

## 🔐 Security Hardening

### Firewall Configuration
```bash
# Enable UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Check status
sudo ufw status
```

- [ ] Firewall enabled
- [ ] Only necessary ports open
- [ ] SSH access working

### Change Default Passwords
```bash
# Login to application
# Go to each user account and change password
```

- [ ] Admin passwords changed
- [ ] Recruiter passwords changed
- [ ] Test login with new passwords

### File Permissions
```bash
# Set proper permissions
chmod 755 uploads
chown -R $USER:$USER uploads
chmod 600 .env
```

- [ ] Uploads folder permissions set
- [ ] .env file secured
- [ ] Application files owned by correct user

---

## 📊 Post-Deployment Verification

### Test All Features
- [ ] Login as Admin
- [ ] Login as Recruiter
- [ ] Upload resume (single)
- [ ] Upload resumes (bulk)
- [ ] Manual entry with all fields
- [ ] Edit existing resume
- [ ] Update recruitment status
- [ ] Update placement status
- [ ] View Details modal
- [ ] Download resume
- [ ] Advanced filter
- [ ] JD matching
- [ ] Technology dropdown
- [ ] Location autocomplete
- [ ] Bulk delete

### Performance Tests
```bash
# Check response time
curl -w "@curl-format.txt" -o /dev/null -s http://yourdomain.com/health

# Monitor resources
pm2 monit

# Check logs
pm2 logs recruitment-app --lines 100
```

- [ ] Health check responding
- [ ] Response time acceptable (<500ms)
- [ ] Memory usage normal (<500MB)
- [ ] No errors in logs

---

## 🔄 Backup Configuration

### Database Backup Script
```bash
# Create backup directory
mkdir -p ~/backups

# Create backup script
cat > ~/backup-recruitment-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump recruitment_db > $BACKUP_DIR/recruitment_db_$DATE.sql
find $BACKUP_DIR -name "recruitment_db_*.sql" -mtime +30 -delete
echo "Backup completed: recruitment_db_$DATE.sql"
EOF

chmod +x ~/backup-recruitment-db.sh

# Test backup
~/backup-recruitment-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add this line:
# 0 2 * * * /home/yourusername/backup-recruitment-db.sh >> /home/yourusername/backup.log 2>&1
```

- [ ] Backup script created
- [ ] Backup tested successfully
- [ ] Cron job configured
- [ ] Backup directory has space

### Uploads Backup
```bash
# Backup uploads folder
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Or use rsync for incremental backups
rsync -av uploads/ ~/backups/uploads/
```

- [ ] Uploads backup tested
- [ ] Backup location has sufficient space

---

## 📈 Monitoring Setup

### PM2 Monitoring
```bash
# Install PM2 log rotation
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# View logs
pm2 logs recruitment-app
```

- [ ] Log rotation configured
- [ ] Logs accessible
- [ ] Old logs being cleaned up

### Health Monitoring
```bash
# Create health check script
cat > ~/check-health.sh << 'EOF'
#!/bin/bash
RESPONSE=$(curl -s http://localhost:5000/health)
if [[ $RESPONSE == *"ok"* ]]; then
    echo "$(date): Application is healthy"
else
    echo "$(date): Application is DOWN! Restarting..."
    pm2 restart recruitment-app
fi
EOF

chmod +x ~/check-health.sh

# Add to crontab (every 5 minutes)
# */5 * * * * /home/yourusername/check-health.sh >> /home/yourusername/health.log 2>&1
```

- [ ] Health check script created
- [ ] Cron job configured
- [ ] Auto-restart working

---

## 📝 Documentation

### Update Documentation
- [ ] Update README.md with production URL
- [ ] Document any custom configurations
- [ ] Create user guide for team
- [ ] Document backup/restore procedures
- [ ] Create troubleshooting guide

### Team Training
- [ ] Train admins on system features
- [ ] Train recruiters on system features
- [ ] Provide login credentials securely
- [ ] Share documentation
- [ ] Schedule follow-up support session

---

## 🎯 Final Checks

### Before Going Live
- [ ] All checklist items completed
- [ ] Staging environment tested
- [ ] Load testing performed
- [ ] Security audit completed
- [ ] Backup system verified
- [ ] Monitoring configured
- [ ] Team trained
- [ ] Documentation complete
- [ ] Rollback plan ready
- [ ] Support contact established

### Go Live!
- [ ] Announce to team
- [ ] Monitor for first 24 hours
- [ ] Check logs regularly
- [ ] Respond to user feedback
- [ ] Document any issues

---

## 🆘 Emergency Contacts

**System Administrator:** _______________  
**Database Administrator:** _______________  
**Development Team:** _______________  
**Hosting Provider Support:** _______________  

---

## 📞 Quick Commands Reference

```bash
# View logs
pm2 logs recruitment-app --lines 100

# Restart application
pm2 restart recruitment-app

# Check status
pm2 status

# Monitor resources
pm2 monit

# Database backup
pg_dump recruitment_db > backup.sql

# Database restore
psql recruitment_db < backup.sql

# Check disk space
df -h

# Check memory
free -m

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

## 🎉 Congratulations!

Your Recruitment Management System is now live in production!

Remember to:
- Monitor regularly
- Keep backups current
- Update dependencies monthly
- Review logs weekly
- Respond to user feedback

For support, refer to DEPLOYMENT.md and FINAL-UPDATES-SUMMARY.md
