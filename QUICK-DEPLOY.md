# ⚡ Quick Deployment Guide - 5 Minutes

For experienced developers who want to deploy quickly.

---

## 🚀 Prerequisites
- Ubuntu/Debian server with root access
- Domain name pointed to server IP
- Node.js 18+, PostgreSQL 12+

---

## 📦 One-Command Setup

```bash
# Run this entire block
sudo apt update && sudo apt upgrade -y && \
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && \
sudo apt install -y nodejs postgresql postgresql-contrib nginx && \
sudo npm install -g pm2 && \
git clone <your-repo-url> recruitment-system && \
cd recruitment-system && \
npm install --production && \
cd client && npm install && npm run build && cd .. && \
mkdir -p uploads && chmod 755 uploads && \
cp .env.example .env
```

---

## ⚙️ Configure Environment

Edit `.env`:
```bash
nano .env
```

Set these values:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/recruitment_db
JWT_SECRET=$(openssl rand -base64 32)
OPENAI_API_KEY=your_openai_key
```

---

## 🗄️ Setup Database

```bash
# Create database
sudo -u postgres psql -c "CREATE DATABASE recruitment_db;"

# Run setup
node setup-database.js
node create-default-users.js
node verify-database.js
```

---

## 🚀 Start Application

```bash
pm2 start server.js --name recruitment-app --max-memory-restart 500M
pm2 save
pm2 startup  # Follow the command it gives
```

---

## 🌐 Configure Nginx

```bash
sudo tee /etc/nginx/sites-available/recruitment-app > /dev/null <<EOF
server {
    listen 80;
    server_name yourdomain.com;
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/recruitment-app /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

---

## 🔒 SSL Certificate

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

---

## 🔐 Security

```bash
# Firewall
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw enable

# Secure .env
chmod 600 .env
```

---

## ✅ Verify

```bash
# Check status
pm2 status
pm2 logs recruitment-app

# Test health
curl http://localhost:5000/health

# Test site
curl https://yourdomain.com
```

---

## 🔄 Daily Backup (Optional)

```bash
cat > ~/backup-db.sh << 'EOF'
#!/bin/bash
pg_dump recruitment_db > ~/backups/db_$(date +%Y%m%d).sql
find ~/backups -name "db_*.sql" -mtime +30 -delete
EOF

chmod +x ~/backup-db.sh
mkdir -p ~/backups
(crontab -l 2>/dev/null; echo "0 2 * * * ~/backup-db.sh") | crontab -
```

---

## 🎯 Default Credentials

**Change these immediately after first login!**

- Admin: `Manoj@deltacubs.us` / `admin123`
- Admin: `bhargav@deltacubes.us` / `admin123`
- Recruiter: `Indu@deltacubs.us` / `admin123`
- Recruiter: `soundharya@deltacubs.us` / `admin123`

---

## 🆘 Quick Troubleshooting

```bash
# View logs
pm2 logs recruitment-app --lines 100

# Restart
pm2 restart recruitment-app

# Check database
sudo -u postgres psql -d recruitment_db -c "\dt"

# Check disk space
df -h

# Check memory
free -m
```

---

## 📚 Full Documentation

For detailed instructions, see:
- `DEPLOYMENT.md` - Complete deployment guide
- `DEPLOYMENT-CHECKLIST.md` - Step-by-step checklist
- `FINAL-UPDATES-SUMMARY.md` - System features

---

**Done!** Your recruitment system is now live at `https://yourdomain.com`

Access it, change default passwords, and start recruiting! 🎉
