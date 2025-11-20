# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use strong `JWT_SECRET` (minimum 32 characters)
- [ ] Configure production database URL
- [ ] Set valid `OPENAI_API_KEY`
- [ ] Remove any development-only variables

### 2. Security
- [ ] Change default admin password
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Set secure cookie flags
- [ ] Enable rate limiting
- [ ] Configure firewall rules

### 3. Database
- [ ] Run all migrations
- [ ] Create database backups
- [ ] Set up automated backup schedule
- [ ] Configure connection pooling
- [ ] Optimize indexes

### 4. Application
- [ ] Build React frontend (`cd client && npm run build`)
- [ ] Test all features in staging
- [ ] Remove debug code and console logs
- [ ] Configure error logging
- [ ] Set up monitoring

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

# Install dependencies
npm install
cd client && npm install && npm run build && cd ..

# Set up environment
cp .env.example .env
nano .env  # Edit with production values

# Run migrations
node run-migration.js
node run-field-migration.js

# Create admin user
node scripts/createAdmin.js

# Start with PM2
pm2 start server.js --name recruitment-app
pm2 save
pm2 startup
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

#### Heroku
```bash
# Install Heroku CLI
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
heroku config:set OPENAI_API_KEY=your_key

# Deploy
git push heroku main

# Run migrations
heroku run node run-migration.js
heroku run node run-field-migration.js
heroku run node scripts/createAdmin.js
```

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

### 3. Health Checks
Create a health check endpoint in `server.js`:
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
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

## Support

For deployment issues, contact the development team with:
- Error logs
- Environment details
- Steps to reproduce

---

**Last Updated:** January 2025
