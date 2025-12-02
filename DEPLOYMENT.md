# Production Deployment Guide - Recruitment Management System

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Create production `.env` file with these settings:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/recruitment_db

# Security
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_long

# AI Services
OPENAI_API_KEY=sk-your-production-openai-api-key

# Optional: Google Places API (for location autocomplete)
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

**Important:**
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use strong `JWT_SECRET` (minimum 32 characters, use: `openssl rand -base64 32`)
- [ ] Configure production database URL with strong password
- [ ] Set valid `OPENAI_API_KEY` for resume parsing
- [ ] Remove any development-only variables
- [ ] Never commit `.env` to version control

### 2. Security
- [ ] Change default admin passwords (all users currently use `admin123`)
- [ ] Enable HTTPS/SSL with valid certificate
- [ ] Configure CORS for production domain in `server.js`
- [ ] Set secure cookie flags
- [ ] Enable rate limiting (install `express-rate-limit`)
- [ ] Configure firewall rules (allow only 80, 443, 22)
- [ ] Disable directory listing for `/uploads`
- [ ] Set proper file permissions (uploads folder: 755)

### 3. Database
- [ ] Create production PostgreSQL database: `recruitment_db`
- [ ] Run database setup: `node setup-database.js`
- [ ] Create admin users: `node create-default-users.js` (then change passwords!)
- [ ] Verify setup: `node verify-database.js`
- [ ] Create initial database backup
- [ ] Set up automated backup schedule (daily recommended)
- [ ] Configure connection pooling (already configured in `config/db.js`)
- [ ] Test database connection

### 4. Application
- [ ] Install production dependencies: `npm install --production`
- [ ] Build React frontend: `cd client && npm run build`
- [ ] Test all features in staging environment
- [ ] Remove debug code and console logs
- [ ] Configure error logging (Winston or similar)
- [ ] Set up monitoring (PM2, New Relic, or Datadog)
- [ ] Test file upload limits (5MB per file, 200 files bulk)
- [ ] Verify resume parsing with OpenAI API
- [ ] Test all user roles (admin, recruiter)

## Deployment Steps

### Option 1: Traditional Server (VPS/Dedicated)

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Application Deployment
```bash
# Clone repository
git clone <repository-url>
cd recruitment-system

# Install backend dependencies
npm install --production

# Install frontend dependencies and build
cd client
npm install
npm run build
cd ..

# Set up environment
cp .env.example .env
nano .env  # Edit with production values

# Create uploads directory with proper permissions
mkdir -p uploads
chmod 755 uploads

# Set up database
node setup-database.js

# Create admin users (IMPORTANT: Change passwords after first login!)
node create-default-users.js

# Verify database setup
node verify-database.js

# Test database operations
node test-database-operations.js

# Configure server to serve built React app
# (Already configured in server.js to serve client/build)

# Start with PM2
pm2 start server.js --name recruitment-app --max-memory-restart 500M
pm2 save
pm2 startup

# Monitor application
pm2 monit
```

**Post-Deployment Tasks:**
```bash
# View logs
pm2 logs recruitment-app

# Check status
pm2 status

# Restart if needed
pm2 restart recruitment-app

# Stop application
pm2 stop recruitment-app
```

#### 3. Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;

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

    client_max_body_size 10M;
}
```

#### 4. SSL Setup (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy application files
COPY . .

# Build frontend
RUN cd client && npm run build

EXPOSE 5000

CMD ["node", "server.js"]
```

#### 2. Docker Compose
```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: recruitment_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:your_password@db:5432/recruitment_db
      - JWT_SECRET=your_jwt_secret
      - OPENAI_API_KEY=your_openai_key
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

volumes:
  postgres_data:
```

#### 3. Deploy
```bash
docker-compose up -d
docker-compose exec app node run-migration.js
docker-compose exec app node run-field-migration.js
docker-compose exec app node scripts/createAdmin.js
```

### Option 3: Cloud Platform (Heroku/Railway/Render)

#### Heroku Deployment
```bash
# Install Heroku CLI
heroku login

# Create app
heroku create your-recruitment-app

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set OPENAI_API_KEY=your_openai_key
heroku config:set GOOGLE_PLACES_API_KEY=your_google_key

# Add buildpack for Node.js
heroku buildpacks:add heroku/nodejs

# Deploy
git push heroku main

# Run database setup
heroku run node setup-database.js

# Create admin users
heroku run node create-default-users.js

# Verify deployment
heroku open
heroku logs --tail
```

#### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to PostgreSQL
railway add postgresql

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set OPENAI_API_KEY=your_openai_key

# Deploy
railway up

# Run database setup
railway run node setup-database.js
railway run node create-default-users.js
```

#### Render Deployment
1. Create account at render.com
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - Build Command: `npm install && cd client && npm install && npm run build`
   - Start Command: `node server.js`
5. Add PostgreSQL database
6. Set environment variables in dashboard
7. Deploy and run setup commands via shell

## Post-Deployment

### 1. Monitoring Setup
```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# View logs
pm2 logs recruitment-app
```

### 2. Database Backup Automation
```bash
# Create backup script
cat > /home/user/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/user/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump recruitment_db > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
EOF

chmod +x /home/user/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /home/user/backup-db.sh
```

### 3. Serve React Build in Production

Add this to your `server.js` (after all API routes):

```javascript
// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}
```

### 4. Health Checks
Create a health check endpoint in `server.js`:
```javascript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

Test health check:
```bash
curl http://localhost:5000/health
```

### 4. Performance Optimization
```bash
# Enable gzip compression in Nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Set up caching headers
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Maintenance

### Regular Tasks
- **Daily**: Check application logs
- **Weekly**: Review error logs and fix issues
- **Monthly**: Update dependencies, security patches
- **Quarterly**: Database optimization, cleanup old uploads

### Update Procedure
```bash
# Backup database
pg_dump recruitment_db > backup_before_update.sql

# Pull latest code
git pull origin main

# Install dependencies
npm install
cd client && npm install && npm run build && cd ..

# Run new migrations (if any)
node run-migration.js

# Restart application
pm2 restart recruitment-app

# Verify deployment
curl http://localhost:5000/health
```

### Rollback Procedure
```bash
# Restore database
psql recruitment_db < backup_before_update.sql

# Revert code
git reset --hard <previous-commit-hash>

# Restart
pm2 restart recruitment-app
```

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs recruitment-app --lines 100

# Check port availability
sudo lsof -i :5000

# Verify environment variables
pm2 env 0
```

### Database Connection Issues
```bash
# Test connection
psql -U postgres -d recruitment_db -c "SELECT 1"

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### High Memory Usage
```bash
# Check process memory
pm2 monit

# Restart if needed
pm2 restart recruitment-app

# Increase memory limit
pm2 start server.js --name recruitment-app --max-memory-restart 500M
```

## Security Hardening

### 1. Firewall Configuration
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Fail2Ban Setup
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Regular Updates
```bash
# Create update script
sudo apt update && sudo apt upgrade -y
npm audit fix
cd client && npm audit fix
```

## 📊 System Requirements

### Minimum Requirements:
- **CPU:** 2 cores
- **RAM:** 2GB
- **Storage:** 20GB (10GB for app + 10GB for uploads)
- **Node.js:** v14 or higher
- **PostgreSQL:** v12 or higher

### Recommended for Production:
- **CPU:** 4 cores
- **RAM:** 4GB
- **Storage:** 50GB SSD
- **Node.js:** v18 LTS
- **PostgreSQL:** v14 or higher
- **Bandwidth:** Unlimited or 1TB+

---

## 🔐 Default User Accounts

After running `node create-default-users.js`, these accounts are created:

### Admin Accounts:
- Email: `Manoj@deltacubs.us` / Password: `admin123`
- Email: `bhargav@deltacubes.us` / Password: `admin123`

### Recruiter Accounts:
- Email: `Indu@deltacubs.us` / Password: `admin123`
- Email: `soundharya@deltacubs.us` / Password: `admin123`

**⚠️ CRITICAL: Change all passwords immediately after first login!**

To reset passwords:
```bash
node reset-all-passwords.js
```

---

## 📁 Project Structure

```
recruitment-system/
├── client/                    # React frontend
│   ├── build/                # Production build (after npm run build)
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── CandidateModal.js
│   │   │   ├── LocationAutocomplete.js
│   │   │   └── TechnologySelect.js
│   │   ├── pages/           # Page components
│   │   │   ├── AdminDashboard.js
│   │   │   ├── RecruiterDashboard.js
│   │   │   └── Login.js
│   │   └── App.js
│   └── package.json
├── config/
│   └── db.js                # Database connection
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── upload.js            # File upload handling
├── migrations/              # Database migrations
├── routes/
│   ├── admin.js            # Admin endpoints
│   ├── applications.js     # Application management
│   ├── auth.js             # Authentication
│   ├── locations.js        # Location autocomplete
│   └── technologies.js     # Technology management
├── scripts/
│   ├── createAdmin.js      # Create admin user
│   └── create-default-users.js
├── uploads/                # Resume storage (create this!)
├── utils/
│   └── resumeParser.js     # AI resume parsing
├── .env                    # Environment variables (create from .env.example)
├── .env.example            # Environment template
├── server.js               # Express server
├── setup-database.js       # Database setup script
├── verify-database.js      # Verify database
└── package.json
```

---

## 🚀 Quick Start Commands

### Development:
```bash
# Backend
npm run dev

# Frontend (separate terminal)
cd client && npm start
```

### Production:
```bash
# Build frontend
cd client && npm run build && cd ..

# Start with PM2
pm2 start server.js --name recruitment-app

# Or start directly
NODE_ENV=production node server.js
```

---

## 📞 Support & Troubleshooting

### Common Issues:

**1. "Cannot connect to database"**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U postgres -d recruitment_db

# Check DATABASE_URL in .env
```

**2. "Port 5000 already in use"**
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change PORT in .env
```

**3. "Resume parsing failed"**
- Verify OPENAI_API_KEY is valid
- Check OpenAI API quota/billing
- Ensure resume file is PDF or DOCX
- Check file size (max 5MB)

**4. "Upload folder not writable"**
```bash
# Set proper permissions
chmod 755 uploads
chown -R $USER:$USER uploads
```

**5. "Frontend not loading"**
```bash
# Rebuild frontend
cd client
npm run build
cd ..

# Restart server
pm2 restart recruitment-app
```

### Getting Help:

For deployment issues, provide:
1. **Error logs:** `pm2 logs recruitment-app --lines 100`
2. **Environment:** OS, Node version, PostgreSQL version
3. **Steps to reproduce:** What you did before the error
4. **Screenshots:** If UI-related issue

### Useful Commands:
```bash
# Check Node version
node --version

# Check PostgreSQL version
psql --version

# Check disk space
df -h

# Check memory usage
free -m

# Check running processes
pm2 list

# View real-time logs
pm2 logs recruitment-app --lines 100 --raw

# Restart application
pm2 restart recruitment-app

# Stop application
pm2 stop recruitment-app

# Delete from PM2
pm2 delete recruitment-app
```

---

## 📝 Deployment Checklist

Before going live, verify:

- [ ] All environment variables set correctly
- [ ] Database created and migrations run
- [ ] Admin users created and passwords changed
- [ ] Frontend built successfully
- [ ] HTTPS/SSL certificate installed
- [ ] Firewall configured
- [ ] Backup system in place
- [ ] Monitoring set up
- [ ] Error logging configured
- [ ] All features tested in production
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Documentation updated
- [ ] Team trained on system

---

## 🎯 Performance Optimization Tips

1. **Enable Gzip Compression** (Nginx)
2. **Set up CDN** for static assets
3. **Database Connection Pooling** (already configured)
4. **Implement Caching** (Redis for session storage)
5. **Optimize Images** in uploads folder
6. **Enable HTTP/2** in Nginx
7. **Use PM2 Cluster Mode** for multiple CPU cores
8. **Regular Database Maintenance** (VACUUM, ANALYZE)

---

**System Version:** 1.0.0  
**Last Updated:** December 2, 2025  
**Status:** Production Ready ✅

For questions or support, contact the development team.
