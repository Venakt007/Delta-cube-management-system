# Super Admin Quick Start

## What is Super Admin?

Super Admin is the highest level of access in the recruitment system with complete control over:

✅ **All Resumes** - View recruiter uploads, social media applications, and onboarded candidates  
✅ **JD Search** - Search and match across all resumes in the system  
✅ **User Management** - Add, edit, and delete user accounts  
✅ **Full System Access** - No restrictions on data visibility

## Quick Setup (3 Steps)

### Step 1: Run Migration (Existing Databases Only)

If you already have a database, add super admin support:

```bash
node migrations/add-super-admin-role.js
```

**Skip this step if you're running `setup-database.js` for the first time.**

### Step 2: Create Super Admin User

```bash
node create-super-admin.js
```

Enter your details when prompted:
- Name: Your full name
- Email: Your email address
- Password: A secure password

### Step 3: Login

1. Start the server: `npm start`
2. Navigate to: `http://localhost:5000/login`
3. Login with your super admin credentials
4. You'll be redirected to `/super-admin`

## One-Command Setup (Windows)

```bash
setup-super-admin.bat
```

This runs both migration and user creation in one go.

## Dashboard Features

### 📊 Recruiter Uploads Tab
View all resumes uploaded by recruiters through the dashboard interface.

### 📱 Social Media Tab
View all applications submitted through the public application form.

### ✅ Onboarded Tab
View all candidates who have been successfully onboarded.

### 🔍 JD Search Tab
Paste a job description and find matching candidates across all resumes with match percentages.

### 👥 User Management Tab
- **Add Users**: Create new super admin, admin, or recruiter accounts
- **Edit Users**: Update name, email, password, or role
- **Delete Users**: Remove user accounts (except your own)

## User Management

### Add a New User

1. Go to User Management tab
2. Click "+ Add User"
3. Fill in details:
   - Name
   - Email
   - Password
   - Role (super_admin/admin/recruiter)
4. Click "Create"

### Edit a User

1. Find the user in the table
2. Click "Edit"
3. Update any field (leave password blank to keep current)
4. Click "Update"

### Delete a User

1. Find the user in the table
2. Click "Delete"
3. Confirm deletion

**Note**: You cannot delete your own account.

## Role Comparison

| Feature | Super Admin | Admin | Recruiter |
|---------|:-----------:|:-----:|:---------:|
| View all resumes | ✅ | ✅ | ❌ |
| Upload resumes | ✅ | ❌ | ✅ |
| User management | ✅ | ❌ | ❌ |
| JD search (all) | ✅ | ✅ | ❌ |

## Command Line Tools

### Create Super Admin
```bash
node create-super-admin.js
```

### Manage Users (CLI)
```bash
node manage-users.js
```

Options:
1. List all users
2. Add new user
3. Delete user
4. Update password

### Show All Users
```bash
node show-users.js
```

## Security Tips

1. **Limit Super Admins**: Only create super admin accounts for trusted personnel
2. **Strong Passwords**: Use complex passwords with 12+ characters
3. **Regular Audits**: Review user list periodically
4. **Remove Inactive**: Delete accounts that are no longer needed

## Troubleshooting

### "Invalid role" error
Run the migration: `node migrations/add-super-admin-role.js`

### Cannot login
1. Verify user exists: `node show-users.js`
2. Reset password: `node manage-users.js` → option 4

### 403 Access Denied
1. Clear browser cache
2. Logout and login again
3. Verify role is `super_admin` in database

## URLs

- **Login**: `http://localhost:5000/login`
- **Super Admin Dashboard**: `http://localhost:5000/super-admin`
- **Admin Dashboard**: `http://localhost:5000/admin`
- **Recruiter Dashboard**: `http://localhost:5000/recruiter`

## Need Help?

See the full guide: `SUPER-ADMIN-GUIDE.md`
