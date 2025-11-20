# Fix "Invalid Credentials" Error

## Quick Fix (Choose One Method)

### Method 1: Using Node.js Script (Easiest) ⭐

```bash
npm run create-admin
```

This will:
- Create/update the admin user
- Hash the password correctly
- Verify the user was created

**Then login with:**
- Email: `admin@recruitment.com`
- Password: `admin123`

---

### Method 2: Using SQL File

```bash
# Run the setup script
psql -U postgres -d recruitment_db -f setup-database.sql
```

**Then login with:**
- Email: `admin@recruitment.com`
- Password: `admin123`

---

### Method 3: Manual SQL Commands

```bash
# Connect to database
psql -U postgres -d recruitment_db

# Run these commands:
```

```sql
-- Create admin user (password: admin123)
INSERT INTO users (email, password, name, role) 
VALUES (
  'admin@recruitment.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'System Admin', 
  'admin'
)
ON CONFLICT (email) DO UPDATE 
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

-- Verify user was created
SELECT id, email, name, role FROM users WHERE email = 'admin@recruitment.com';

-- Exit
\q
```

---

## Troubleshooting

### Error: "relation 'users' does not exist"

**Problem:** Tables haven't been created yet

**Solution:**
```bash
# Create tables first
psql -U postgres -d recruitment_db -f database.sql

# Then create admin user
npm run create-admin
```

---

### Error: "database 'recruitment_db' does not exist"

**Problem:** Database hasn't been created

**Solution:**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE recruitment_db;"

# Create tables
psql -U postgres -d recruitment_db -f database.sql

# Create admin user
npm run create-admin
```

---

### Error: "password authentication failed"

**Problem:** Wrong PostgreSQL password

**Solution:**
1. Check your DATABASE_URL in `.env`
2. Verify PostgreSQL password
3. Update `.env` with correct credentials

---

## Verify Setup

### Check Database Exists
```bash
psql -U postgres -l | findstr recruitment_db
```

### Check Tables Exist
```bash
psql -U postgres -d recruitment_db -c "\dt"
```

Should show:
- users
- applications

### Check Admin User Exists
```bash
psql -U postgres -d recruitment_db -c "SELECT email, name, role FROM users WHERE email = 'admin@recruitment.com';"
```

Should show:
```
           email           |     name     | role  
---------------------------+--------------+-------
 admin@recruitment.com     | System Admin | admin
```

---

## Complete Setup Steps

If nothing works, start from scratch:

### 1. Create Database
```bash
psql -U postgres -c "CREATE DATABASE recruitment_db;"
```

### 2. Create Tables
```bash
psql -U postgres -d recruitment_db -f database.sql
```

### 3. Create Admin User
```bash
npm run create-admin
```

### 4. Verify .env Configuration
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/recruitment_db
```

### 5. Restart Backend
```bash
# Stop with Ctrl+C
npm run dev
```

### 6. Try Login
- Go to http://localhost:3000/login
- Email: `admin@recruitment.com`
- Password: `admin123`

---

## Default Credentials

### Admin Account
```
Email:    admin@recruitment.com
Password: admin123
Role:     admin
```

⚠️ **IMPORTANT:** Change this password after first login!

---

## Create Additional Users

### Create Recruiter Account
```bash
npm run create-users
```

This creates:
- `recruiter@test.com` / `recruiter123`
- `recruiter2@test.com` / `recruiter456`

### Create Custom User via API

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"your@email.com\",\"password\":\"yourpass\",\"name\":\"Your Name\",\"role\":\"recruiter\"}"
```

**Using Postman:**
- Method: POST
- URL: http://localhost:5000/api/auth/register
- Body (JSON):
```json
{
  "email": "your@email.com",
  "password": "yourpass",
  "name": "Your Name",
  "role": "recruiter"
}
```

---

## Change Admin Password

### Method 1: Via Database
```bash
psql -U postgres -d recruitment_db
```

```sql
-- Generate new password hash (for 'newpassword123')
-- You need to generate this using bcrypt with 10 rounds

-- Update password
UPDATE users 
SET password = '$2a$10$NEW_HASH_HERE' 
WHERE email = 'admin@recruitment.com';
```

### Method 2: Create New Admin
```bash
psql -U postgres -d recruitment_db
```

```sql
-- Delete old admin
DELETE FROM users WHERE email = 'admin@recruitment.com';

-- Run create-admin script again
```

Then run:
```bash
npm run create-admin
```

---

## Still Having Issues?

### Check Backend Logs
Look at the terminal running `npm run dev` for error messages.

### Check Database Connection
```bash
psql -U postgres -d recruitment_db -c "SELECT 1;"
```

Should return:
```
 ?column? 
----------
        1
```

### Test Login API Directly
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@recruitment.com\",\"password\":\"admin123\"}"
```

Should return a token if successful.

---

## Quick Checklist

- [ ] Database created
- [ ] Tables created
- [ ] Admin user created
- [ ] .env configured correctly
- [ ] Backend running (npm run dev)
- [ ] Frontend running (npm start)
- [ ] Can access http://localhost:3000/login
- [ ] Login works with admin@recruitment.com / admin123

---

**After fixing, you should be able to login successfully!** ✅
