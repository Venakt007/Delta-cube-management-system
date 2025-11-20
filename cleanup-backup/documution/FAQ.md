# Frequently Asked Questions (FAQ)

Common questions and answers about the Recruitment Management System.

## 📋 General Questions

### What is this system?
An AI-powered recruitment management platform that allows candidates to apply online, recruiters to upload and manage resumes, and admins to filter and match candidates using AI.

### Who is this for?
- **Companies:** Looking to streamline their recruitment process
- **Recruiters:** Need to manage multiple candidate resumes
- **HR Teams:** Want AI-powered candidate matching
- **Startups:** Need affordable recruitment software

### What makes it different?
- AI-powered resume parsing (works with any format)
- Intelligent job description matching
- Role-based access control
- Open source and customizable
- Cost-effective (self-hosted)

---

## 💻 Technical Questions

### What technologies are used?
- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **AI:** OpenAI GPT-4
- **Authentication:** JWT

### What are the system requirements?
- Node.js 16+ (18+ recommended)
- PostgreSQL 12+ (14+ recommended)
- 2GB RAM minimum (4GB recommended)
- 10GB disk space minimum

### Can I use a different database?
Yes, but you'll need to modify the code. PostgreSQL is recommended because:
- JSONB support for parsed data
- Full-text search capabilities
- Reliable and performant
- Free and open source

### Can I use a different AI model?
Yes! You can modify `utils/resumeParser.js` to use:
- GPT-3.5 (cheaper, less accurate)
- Claude (Anthropic)
- Local models (Llama, etc.)
- Custom NLP solutions

---

## 🔐 Security Questions

### Is it secure?
Yes, the system includes:
- JWT authentication
- Password hashing (bcrypt)
- Role-based access control
- Input validation
- SQL injection prevention
- File type validation
- CORS protection

### How are passwords stored?
Passwords are hashed using bcrypt with 10 salt rounds. Plain text passwords are never stored.

### What about file security?
- Files are validated for type and size
- Stored in a separate uploads folder
- Access controlled by authentication
- Can be moved to cloud storage (S3)

### Should I change the default admin password?
**YES! Immediately!** The default password (admin123) is for initial setup only.

### How do I secure it for production?
See DEPLOYMENT_GUIDE.md for:
- HTTPS/SSL setup
- Environment variable security
- Database security
- Rate limiting
- Monitoring

---

## 💰 Cost Questions

### Is it free?
The software is free and open source. However, you'll need:
- **Hosting:** $5-50/month
- **Database:** $7-15/month (or free with hosting)
- **OpenAI API:** ~$0.03 per resume parsed
- **Storage:** $1-5/month

### How much does OpenAI cost?
- **GPT-4:** ~$0.03 per resume
- **GPT-3.5:** ~$0.01 per resume
- **100 resumes/month:** ~$3
- **1000 resumes/month:** ~$30

### Can I reduce OpenAI costs?
Yes:
- Use GPT-3.5 instead of GPT-4
- Cache parsed resumes
- Batch processing
- Set spending limits
- Use local models (free but less accurate)

### What's the total monthly cost?
**Small company (< 100 resumes/month):** $15-30
**Medium company (< 500 resumes/month):** $30-60
**Large company (> 1000 resumes/month):** $60-150

---

## 🚀 Setup & Installation Questions

### How long does setup take?
- **Basic setup:** 15-30 minutes
- **Full configuration:** 1-2 hours
- **Production deployment:** 2-4 hours

### I'm not technical. Can I still use this?
You'll need basic knowledge of:
- Command line
- Installing software
- Editing configuration files

Or hire a developer for setup (1-2 hours of work).

### What if I get stuck during setup?
1. Check INSTALLATION_CHECKLIST.md
2. Review SETUP_GUIDE.md
3. Check error messages in console
4. Verify .env configuration
5. Check database connection

### Do I need a domain name?
Not for testing (use localhost). For production, yes:
- Makes it accessible to users
- Required for SSL certificate
- Professional appearance
- Cost: $10-15/year

---

## 🎯 Feature Questions

### How does resume parsing work?
1. User uploads resume (PDF/DOCX)
2. System extracts text
3. Text sent to OpenAI GPT-4
4. AI extracts structured data
5. Data stored in database
6. Available for searching

### What data is extracted from resumes?
- Name, email, phone
- Skills (array)
- Years of experience
- Education
- Certifications
- Location
- Availability
- Professional summary

### Does it work with all resume formats?
Yes! The AI can parse:
- Traditional formats
- Modern designs
- Two-column layouts
- Creative templates
- Any language (with proper prompting)

### How accurate is the parsing?
- **GPT-4:** 90-95% accuracy
- **GPT-3.5:** 80-85% accuracy
- Works better with well-formatted resumes
- May miss data in very creative formats

### How does JD matching work?
1. Admin pastes job description
2. AI extracts requirements
3. System compares with all resumes
4. Calculates match percentage
5. Shows matching and missing skills
6. Ranks candidates by fit

### Can recruiters see each other's uploads?
No. Each recruiter sees only their own uploads. Only admins see everything.

### Can I customize the application form?
Yes! Edit `client/src/pages/ApplicationForm.js` to:
- Add/remove fields
- Change dropdown options
- Modify validation rules
- Update styling

---

## 📊 Usage Questions

### How many resumes can it handle?
- **Database:** Millions of records
- **Practical limit:** Depends on hosting
- **Recommended:** < 100,000 for single server
- **Scaling:** Add more servers for more

### Can I bulk upload resumes?
Yes! Recruiters can upload up to 20 resumes at once. All are automatically parsed.

### Can I export data?
Not built-in, but you can:
- Query database directly
- Add export feature (CSV/Excel)
- Use database export tools
- Build custom reports

### Can I delete resumes?
Not in current version. You can:
- Add delete functionality
- Manually delete from database
- Archive old resumes

### Can candidates check their application status?
Not in current version. Future enhancement could add:
- Candidate portal
- Status tracking
- Email notifications

---

## 🔧 Customization Questions

### Can I change the colors?
Yes! Edit Tailwind CSS classes in React components:
- `bg-blue-600` → `bg-purple-600`
- `text-blue-700` → `text-purple-700`

### Can I add my company logo?
Yes! Add logo image to `client/public/` and update components.

### Can I add more form fields?
Yes! Edit `ApplicationForm.js`:
1. Add field to state
2. Add input element
3. Update API endpoint
4. Add database column (if needed)

### Can I change the technology options?
Yes! Edit the dropdown in `ApplicationForm.js`:
```jsx
<option value="Your Tech">Your Tech</option>
```

### Can I integrate with other systems?
Yes! The system has REST APIs. You can:
- Integrate with ATS systems
- Connect to HRIS
- Add to existing websites
- Build mobile apps

---

## 🐛 Troubleshooting Questions

### "Cannot connect to database"
**Causes:**
- PostgreSQL not running
- Wrong DATABASE_URL
- Incorrect password
- Database doesn't exist

**Solutions:**
1. Check PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Test connection: `psql -U postgres`
4. Create database if missing

### "OpenAI API error"
**Causes:**
- Invalid API key
- No credits
- Rate limit exceeded
- Network issues

**Solutions:**
1. Check API key in .env
2. Verify credits at platform.openai.com
3. Check spending limits
4. Wait and retry

### "Port already in use"
**Causes:**
- Another app using port 5000 or 3000
- Previous instance still running

**Solutions:**
1. Change PORT in .env
2. Kill process: `lsof -ti:5000 | xargs kill`
3. Restart computer

### "Module not found"
**Causes:**
- Dependencies not installed
- Wrong directory
- Corrupted node_modules

**Solutions:**
1. Run `npm install`
2. Delete node_modules and reinstall
3. Check you're in correct directory

### Resume parsing not working
**Causes:**
- Invalid OpenAI key
- Wrong file format
- File too large
- Network issues

**Solutions:**
1. Check OpenAI key
2. Verify file is PDF/DOCX
3. Check file size < 5MB
4. Check backend logs

### Files not uploading
**Causes:**
- uploads folder missing
- Permission issues
- File size too large
- Wrong file type

**Solutions:**
1. Create uploads folder
2. Check folder permissions
3. Reduce file size
4. Use allowed file types

---

## 🌐 Deployment Questions

### Where can I deploy this?
- **Heroku:** Easiest, free tier available
- **AWS:** Most scalable, more complex
- **DigitalOcean:** Good balance
- **Vercel/Netlify:** Frontend only
- **VPS:** Full control

### Do I need a server?
Yes, for the backend. Options:
- Cloud hosting (Heroku, AWS)
- VPS (DigitalOcean, Linode)
- Shared hosting (limited)
- Your own server

### Can I use shared hosting?
Difficult. You need:
- Node.js support
- PostgreSQL database
- SSH access
- Process manager

VPS or cloud hosting is recommended.

### How do I get SSL certificate?
- **Let's Encrypt:** Free, auto-renewing
- **Cloudflare:** Free with their service
- **Paid certificates:** $10-100/year

### Can I use a subdomain?
Yes! Examples:
- careers.yourcompany.com
- jobs.yourcompany.com
- apply.yourcompany.com

---

## 📱 Mobile & Browser Questions

### Is it mobile-friendly?
Yes! The interface is responsive and works on:
- Smartphones
- Tablets
- Desktop computers

### Which browsers are supported?
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

### Can I build a mobile app?
Yes! The backend APIs can be used with:
- React Native
- Flutter
- Native iOS/Android
- Progressive Web App (PWA)

---

## 🔄 Updates & Maintenance Questions

### How do I update the system?
```bash
git pull origin main
npm install
cd client && npm install && npm run build
pm2 restart recruitment-app
```

### How often should I update?
- **Security updates:** Immediately
- **Feature updates:** As needed
- **Dependencies:** Monthly
- **Database backups:** Daily

### How do I backup the database?
```bash
pg_dump -U postgres recruitment_db > backup.sql
```

### How do I restore a backup?
```bash
psql -U postgres -d recruitment_db < backup.sql
```

### What maintenance is required?
- Monitor logs
- Check disk space
- Update dependencies
- Backup database
- Monitor API usage
- Review security

---

## 🎓 Learning Questions

### I'm new to Node.js. Can I still use this?
Yes, but you should learn basics:
- Node.js fundamentals
- npm package management
- Environment variables
- Command line basics

### Where can I learn more?
- **Node.js:** nodejs.org/en/docs/
- **React:** react.dev/
- **PostgreSQL:** postgresql.org/docs/
- **Express:** expressjs.com/

### Can I modify the code?
Yes! It's open source. You can:
- Add features
- Fix bugs
- Customize UI
- Integrate with other systems

### Do I need to know AI/ML?
No. The AI integration is handled by OpenAI API. You just need to:
- Get API key
- Configure in .env
- System handles the rest

---

## 💼 Business Questions

### Can I use this commercially?
Yes! You can:
- Use for your company
- Offer as a service
- Customize for clients
- Charge for hosting

### Can I white-label it?
Yes! You can:
- Remove branding
- Add your logo
- Customize colors
- Change company name

### Can I sell it?
Yes, but check the license. You can:
- Offer as SaaS
- Charge for customization
- Provide hosting services
- Sell support packages

### Do I need to credit the original?
Check the license file. Generally:
- Attribution appreciated
- Not always required
- Depends on license type

---

## 🆘 Support Questions

### Where can I get help?
1. Read documentation files
2. Check this FAQ
3. Review error logs
4. Search online forums
5. Hire a developer

### Is there paid support?
Not officially, but you can:
- Hire freelance developers
- Contact consultants
- Post on job boards
- Use developer forums

### Can I request features?
Yes! You can:
- Modify code yourself
- Hire a developer
- Submit feature requests
- Contribute to project

### How do I report bugs?
1. Document the issue
2. Include error messages
3. List steps to reproduce
4. Note your environment
5. Check if already known

---

## 🚀 Advanced Questions

### Can I add multiple languages?
Yes! You can:
- Use i18n library
- Translate UI text
- Support multiple resume languages
- Customize per region

### Can I add email notifications?
Yes! Add email service:
- Nodemailer
- SendGrid
- AWS SES
- Mailgun

### Can I integrate with LinkedIn?
Yes! Use LinkedIn API to:
- Import profiles
- Auto-fill forms
- Verify credentials
- Post jobs

### Can I add video interviews?
Yes! Integrate:
- Zoom API
- Google Meet
- Custom video solution
- Third-party services

### Can I add analytics?
Yes! Add:
- Google Analytics
- Custom dashboards
- Database queries
- Reporting tools

---

## 📈 Scaling Questions

### When should I scale?
When you experience:
- Slow response times
- High CPU usage
- Memory issues
- Database bottlenecks

### How do I scale?
1. **Vertical:** Upgrade server
2. **Horizontal:** Add more servers
3. **Database:** Read replicas
4. **Caching:** Redis/Memcached
5. **CDN:** CloudFlare

### Can it handle 10,000 resumes?
Yes, easily with proper hosting.

### Can it handle 100,000 resumes?
Yes, but you'll need:
- Better hosting
- Database optimization
- Caching layer
- Load balancing

---

## 🎯 Best Practices

### What are the best practices?
- Change default passwords
- Regular backups
- Monitor logs
- Update dependencies
- Use HTTPS
- Set spending limits (OpenAI)
- Test before deploying
- Document customizations

### How often should I backup?
- **Database:** Daily
- **Files:** Weekly
- **Code:** Use git
- **Config:** Keep copies

### Should I use version control?
Yes! Use Git to:
- Track changes
- Revert mistakes
- Collaborate
- Deploy easily

---

Still have questions? Check the other documentation files or consult with a developer!
