# AWS Deployment Checklist

## Quick Reference - Check off as you complete each step

### ☐ Phase 1: AWS Account (5 min)
- [ ] Create AWS account
- [ ] Login to AWS Console
- [ ] Select region (US East recommended)

### ☐ Phase 2: Security Groups (10 min)
- [ ] Create `recruitment-sg` (EC2 security group)
  - [ ] Add SSH rule (port 22)
  - [ ] Add HTTP rule (port 80)
  - [ ] Add HTTPS rule (port 443)
  - [ ] Add Custom TCP rule (port 5000)
  - [ ] **Copy Security Group ID:** sg-________________

- [ ] Create `recruitment-rds-sg` (RDS security group)
  - [ ] Add PostgreSQL rule (port 5432)
  - [ ] Source: EC2 security group ID (sg-________________)

### ☐ Phase 3: RDS Database (15 min)
- [ ] Navigate to RDS → Create database
- [ ] Choose PostgreSQL
- [ ] Select Free tier template
- [ ] Set DB identifier: `recruitment-db`
- [ ] Set master username: `postgres`
- [ ] Set master password: _________________ (save this!)
- [ ] Choose db.t3.micro instance
- [ ] Set initial database name: `recruitment_db`
- [ ] Select `recruitment-rds-sg` security group
- [ ] Public access: No
- [ ] Click Create database
- [ ] Wait for status: Available
- [ ] **Copy endpoint:** _________________________________.rds.amazonaws.com

### ☐ Phase 4: EC2 Instance (15 min)
- [ ] Navigate to EC2 → Launch instance
- [ ] Name: `recruitment-server`
- [ ] Choose Ubuntu Server 22.04 LTS
- [ ] Choose t2.micro instance type
- [ ] Create/select key pair: `recruitment-key`
- [ ] **Download and save .pem file**
- [ ] Select `recruitment-sg` security group
- [ ] Add user data script (from guide)
- [ ] Launch instance
- [ ] Wait for status: Running
- [ ] **Copy public IP:** ___.___.___.___ 

### ☐ Phase 5: Connect and Setup (20 min)
- [ ] SSH into EC2: `ssh -i recruitment-key.pem ubuntu@YOUR_IP`
- [ ] Verify installations (node, npm, git, pm2, nginx)
- [ ] Clone repository
- [ ] Create `.env` file with:
  - [ ] DATABASE_URL (use RDS endpoint)
  - [ ] JWT_SECRET
  - [ ] PORT=5000
  - [ ] NODE_ENV=production
- [ ] Install dependencies: `npm install`
- [ ] Install client dependencies: `cd client && npm install`
- [ ] Build frontend: `npm run build`
- [ ] Run database setup: `node setup-database.js`
- [ ] Run migrations:
  - [ ] `node migrations/add-super-admin-role.js`
  - [ ] `node migrations/add-edited-resume-field.js`
- [ ] Create super admin: `node create-super-admin-auto.js`
- [ ] **Save super admin credentials**
- [ ] Start with PM2: `pm2 start server.js --name recruitment-app`
- [ ] Save PM2: `pm2 save`
- [ ] Setup PM2 startup: `pm2 startup` (run the command it shows)
- [ ] Configure Nginx (copy config from guide)
- [ ] Enable Nginx site
- [ ] Restart Nginx: `sudo systemctl restart nginx`
- [ ] Create uploads directory

### ☐ Phase 6: Testing (5 min)
- [ ] Test backend: `curl http://localhost:5000/health`
- [ ] Test frontend: Open `http://YOUR_IP/` in browser
- [ ] Test landing page: `http://YOUR_IP/landing.html`
- [ ] Test application form: `http://YOUR_IP/apply.html`
- [ ] Test login: `http://YOUR_IP/login`
- [ ] Test database connection from EC2
- [ ] Login as super admin
- [ ] Test all dashboard features

### ☐ Phase 7: Optional - Domain & SSL (15 min)
- [ ] Allocate Elastic IP
- [ ] Associate Elastic IP with EC2
- [ ] Update Nginx config with new IP
- [ ] Setup domain A record (if you have domain)
- [ ] Install Certbot
- [ ] Get SSL certificate: `sudo certbot --nginx -d yourdomain.com`

### ☐ Phase 8: Security (10 min)
- [ ] Setup UFW firewall
- [ ] Disable SSH password authentication
- [ ] Test SSH still works with key
- [ ] Setup SSL certificate (if domain)

### ☐ Phase 9: Documentation (5 min)
- [ ] Save all credentials securely
- [ ] Document EC2 IP address
- [ ] Document RDS endpoint
- [ ] Document super admin credentials
- [ ] Save SSH key in safe location
- [ ] Test SSH connection one more time

---

## 📝 Your Deployment Info

**Fill this in:**

```
EC2 Public IP: ___.___.___.___ 
EC2 Security Group ID: sg-________________
RDS Endpoint: _________________________________.rds.amazonaws.com
RDS Password: _________________ 
Super Admin Email: superadmin@example.com
Super Admin Password: _________________ 
SSH Command: ssh -i ~/.ssh/recruitment-key.pem ubuntu@___.___.___.___ 
```

---

## ✅ Final Verification

- [ ] Application loads in browser
- [ ] Can login as super admin
- [ ] Can create users
- [ ] Can upload resumes
- [ ] Can view all dashboards
- [ ] Database is working
- [ ] File uploads work
- [ ] All features functional

---

## 🎉 Deployment Complete!

**Your application is live at:** http://___.___.___.___ 

**Next steps:**
1. Change super admin password
2. Create admin and recruiter users
3. Test all features thoroughly
4. Setup regular backups
5. Monitor application logs

---

**Estimated Total Time:** 60-90 minutes  
**Estimated Monthly Cost:** $25-35 (or $0-5 with free tier)

---

**Need detailed instructions?** See `AWS-COMPLETE-DEPLOYMENT-GUIDE.md`
