# 🚀 How to Run the Resume Management System

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ Node.js (v14 or higher)
- ✅ PostgreSQL (v12 or higher)
- ✅ npm or yarn
- ✅ Git (optional)

## 📁 Project Structure

```
resume-management-system/
├── modules/
│   ├── 1-html-application-form/     # Public application form
│   ├── 2-recruiter-dashboard/       # Recruiter dashboard
│   ├── 3-admin-dashboard/           # Admin dashboard
│   └── 4-system-admin-dashboard/    # System admin dashboard
├── client/                          # React frontend
├── routes/                          # Backend API routes
├── config/                          # Database configuration
├── middleware/                      # Authentication middleware
├── utils/                           # Utility functions
├── uploads/                         # Uploaded files
└── server.js                        # Main server file
```

## 🔧 Installation Steps

### Step 1: Install Dependencies

#### Backend Dependencies
```bash
npm install
```

#### Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### Step 2: Setup Database

1. **Create PostgreSQL Database:**
```bash
psql -U postgres
CREATE DATABASE resume_management;
\q
```

2. **Run Database Setup:**
```bash
node setup-everything.js
```

This will:
- Create all tables
- Add necessary columns
- Set up constraints

### Step 3: Configure Environment

Create `.env` file in root directory:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/resume_management
JWT_SECRET=your_secret_key_here_change_this_in_production
OPENAI_API_KEY=your_openai_api_key_here
```

**Important:** Replace `your_password` with your PostgreSQL password!

### Step 4: Create Users

#### Create Admin User
```bash
node scripts/createAdmin.js
```

#### Create Recruiter User
```bash
node scripts/createTestUsers.js
```

#### Create System Admin User
```bash
node create-system-admin.js
```

## ▶️ Running the Application

### Option 1: Run Both Servers Together (Recommended)
```bash
npm run dev
```

This starts:
- Backend server on `http://localhost:5000`
- Frontend server on `http://localhost:3000`

### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## 🔐 Default Login Credentials

### Admin
- Email: `admin@recruitment.com`
- Password: `admin123`
- URL: `http://localhost:3000/login`

### Recruiter
- Email: `recruiter@test.com`
- Password: `recruiter123`
- URL: `http://localhost:3000/login`

### System Admin
- Email: `systemadmin@example.com`
- Password: `admin123`
- URL: `http://localhost:3000/login`

## 📱 Accessing Different Modules

### 1. Public Application Form
```
http://localhost:3000/
```
Anyone can access and submit applications.

**With Referral Tracking:**
```
http://localhost:3000/?ref=LinkedIn
http://localhost:3000/?ref=Facebook
http://localhost:3000/?ref=Twitter
```

### 2. Recruiter Dashboard
```
http://localhost:3000/recruiter
```
Login required (role: recruiter)

**Features:**
- Manual resume entry
- Bulk upload (up to 20 resumes)
- Search resumes
- Update status
- Edit/Delete resumes

### 3. Admin Dashboard
```
http://localhost:3000/admin
```
Login required (role: admin)

**Features:**
- View all resumes from all recruiters
- Advanced filtering
- JD matching with AI
- View onboarded resumes separately

### 4. System Admin Dashboard
```
http://localhost:3000/system-admin
```
Login required (role: system_admin)

**Features:**
- Manage own uploaded resumes
- Track referral sources
- JD matching
- View onboarded separately

## 🧪 Testing the System

### Test 1: Public Form Submission
1. Go to `http://localhost:3000/`
2. Fill in the form
3. Upload resume (optional)
4. Submit
5. Check database or login as admin to see submission

### Test 2: Recruiter Upload
1. Login as recruiter
2. Go to "Upload Resumes" tab
3. Select multiple PDF/DOCX files
4. Upload
5. Check "My Resumes" tab

### Test 3: Status Updates
1. Login as recruiter
2. Go to "My Resumes" tab
3. Change recruitment status
4. Change placement status to "Onboarded"
5. Login as admin - resume should be hidden from active tab
6. Check admin's "Onboarded" tab - resume should appear there

### Test 4: JD Matching
1. Login as admin or system admin
2. Go to "JD Matching" tab
3. Paste a job description
4. Click "Find Matching Candidates"
5. View match percentages and skills

### Test 5: Referral Tracking
1. Share link: `http://localhost:3000/?ref=LinkedIn`
2. Submit application through that link
3. Login as system admin
4. Check "Source" column - should show "LinkedIn"

## 🛠️ Troubleshooting

### Issue: Cannot connect to database
**Solution:**
1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Test connection: `psql -U postgres -d resume_management`

### Issue: Port already in use
**Solution:**
```bash
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 3000
npx kill-port 3000
```

### Issue: Login fails
**Solution:**
1. Check user exists: `node list-users.js` (create this script if needed)
2. Reset password: Run user creation script again
3. Check JWT_SECRET in `.env`

### Issue: Resume parsing fails
**Solution:**
1. Check OPENAI_API_KEY in `.env`
2. Verify file format (PDF, DOC, DOCX only)
3. Check file size (max 5MB)

### Issue: Frontend not loading
**Solution:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📊 Database Management

### View All Tables
```bash
psql -U postgres -d resume_management
\dt
```

### View Users
```sql
SELECT id, email, name, role FROM users;
```

### View Applications
```sql
SELECT id, name, email, recruitment_status, placement_status, referral_source FROM applications;
```

### Clean Database (Remove Test Data)
```bash
node clean-test-resumes.js
```

## 🔄 Updating the System

### Pull Latest Changes
```bash
git pull origin main
npm install
cd client && npm install && cd ..
```

### Run Migrations
```bash
# If new database changes
node setup-everything.js
```

## 📦 Production Deployment

### Build Frontend
```bash
cd client
npm run build
cd ..
```

### Set Production Environment
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your_production_database_url
JWT_SECRET=strong_random_secret_key
OPENAI_API_KEY=your_openai_api_key
```

### Start Production Server
```bash
npm start
```

## 📞 Support

For issues or questions:
1. Check module-specific README in `modules/` folder
2. Check troubleshooting section above
3. Review error logs in console
4. Check database connection

## 🎯 Quick Start Checklist

- [ ] Install Node.js and PostgreSQL
- [ ] Clone/download project
- [ ] Run `npm install` in root
- [ ] Run `npm install` in client folder
- [ ] Create PostgreSQL database
- [ ] Run `node setup-everything.js`
- [ ] Create `.env` file with credentials
- [ ] Create users (admin, recruiter, system admin)
- [ ] Run `npm run dev`
- [ ] Open `http://localhost:3000`
- [ ] Test login with default credentials
- [ ] Upload test resume
- [ ] Verify all features work

## ✅ Success Indicators

You'll know everything is working when:
- ✅ Both servers start without errors
- ✅ You can access `http://localhost:3000`
- ✅ Login works for all user types
- ✅ Resume upload and parsing works
- ✅ Status updates work
- ✅ JD matching returns results
- ✅ Referral tracking captures sources

---

**🎉 Congratulations! Your Resume Management System is now running!**

For module-specific details, check the README files in the `modules/` folder.
