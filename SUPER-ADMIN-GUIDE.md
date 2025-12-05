# Super Admin Feature Guide

## Overview

The Super Admin role provides complete system access with the following capabilities:

### 🔑 Key Features

1. **All Resume Access**
   - View all resumes uploaded by recruiters (dashboard uploads)
   - View all social media applications (form submissions)
   - View all onboarded candidates
   - Separate tabs for easy organization

2. **JD Search**
   - Search across ALL resumes in the system
   - Match candidates against job descriptions
   - View match percentages and skill gaps

3. **User Management**
   - Add new users (Super Admin, Admin, Recruiter)
   - Edit existing users (name, email, password, role)
   - Delete users (except yourself)
   - View all user accounts

4. **Database Triggers**
   - All user actions are tracked with timestamps
   - Automatic updated_at triggers on modifications

## Setup Instructions

### For New Installations

If you're setting up a fresh database, the super_admin role is already included:

```bash
# Run database setup
node setup-database.js

# Create your first super admin
node create-super-admin.js
```

### For Existing Installations

If you already have a database running, you need to migrate:

```bash
# Run migration to add super_admin role
node migrations/add-super-admin-role.js

# Create your first super admin
node create-super-admin.js
```

## Creating Super Admin Users

### Method 1: Using create-super-admin.js (Recommended)

```bash
node create-super-admin.js
```

Follow the prompts to enter:
- Name
- Email
- Password

### Method 2: Using manage-users.js

```bash
node manage-users.js
```

Select option 2 (Add new user) and choose `super_admin` as the role.

## Dashboard Access

### Login

1. Navigate to `/login`
2. Enter super admin credentials
3. You'll be automatically redirected to `/super-admin`

### Dashboard Tabs

#### 1. Recruiter Uploads
- Shows all resumes uploaded by recruiters through the dashboard
- Excludes onboarded candidates
- Source: `dashboard`

#### 2. Social Media
- Shows all applications submitted through the public form
- Excludes onboarded candidates
- Source: `html_form`

#### 3. Onboarded
- Shows all candidates with placement_status = 'Onboarded'
- Includes both recruiter uploads and social media applications

#### 4. JD Search
- Paste a job description
- System extracts required skills
- Matches against all resumes
- Shows match percentage and skill gaps

#### 5. User Management
- View all system users
- Add new users with any role
- Edit user details (name, email, password, role)
- Delete users (cannot delete yourself)

## User Roles Comparison

| Feature | Super Admin | Admin | Recruiter |
|---------|-------------|-------|-----------|
| View all recruiter uploads | ✅ | ✅ | ❌ (own only) |
| View social media resumes | ✅ | ✅ | ❌ |
| View onboarded candidates | ✅ | ✅ | ❌ |
| JD search (all resumes) | ✅ | ✅ | ❌ |
| Upload resumes | ✅ | ❌ | ✅ |
| User management | ✅ | ❌ | ❌ |
| Add/Edit/Delete users | ✅ | ❌ | ❌ |

## API Endpoints

All super admin endpoints require authentication and super_admin role:

```
GET  /api/super-admin/recruiter-resumes    - Get all recruiter uploads
GET  /api/super-admin/social-media-resumes - Get all social media applications
GET  /api/super-admin/onboarded-resumes    - Get all onboarded candidates
POST /api/super-admin/jd-match             - Match JD against all resumes
GET  /api/super-admin/users                - Get all users
POST /api/super-admin/users                - Create new user
PUT  /api/super-admin/users/:id            - Update user
DELETE /api/super-admin/users/:id          - Delete user
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'recruiter')),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Notes

1. **Password Management**
   - All passwords are hashed with bcrypt
   - Minimum 10 salt rounds
   - Never stored in plain text

2. **Authentication**
   - JWT tokens with 7-day expiration
   - Role-based access control
   - Middleware validation on all routes

3. **User Deletion**
   - Cannot delete your own account
   - Confirmation required
   - Cascading handled by database

## Styling

The Super Admin dashboard uses a purple/indigo theme to distinguish it from:
- Admin dashboard (blue theme)
- Recruiter dashboard (green theme)

All styling is consistent with the existing design system:
- Simple, clean interface
- Responsive tables
- Modal dialogs for user management
- Color-coded status badges

## Troubleshooting

### Migration Issues

If migration fails:

```bash
# Check current constraint
psql -d your_database -c "SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'users_role_check';"

# Manually drop and recreate
psql -d your_database -c "ALTER TABLE users DROP CONSTRAINT users_role_check;"
psql -d your_database -c "ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('super_admin', 'admin', 'recruiter'));"
```

### Login Issues

If super admin cannot login:

1. Verify user exists:
```bash
node show-users.js
```

2. Check role is correct:
```sql
SELECT id, email, role FROM users WHERE email = 'your-email@example.com';
```

3. Reset password if needed:
```bash
node manage-users.js
# Select option 4 (Update password)
```

### Access Denied

If getting 403 errors:

1. Check JWT token is valid
2. Verify role in localStorage matches database
3. Clear browser cache and login again

## Best Practices

1. **Create Limited Super Admins**
   - Only create super admin accounts for trusted personnel
   - Use admin/recruiter roles for regular staff

2. **Regular Audits**
   - Periodically review user list
   - Remove inactive accounts
   - Update passwords regularly

3. **Backup Before Changes**
   - Always backup database before user management operations
   - Test in development first

4. **Monitor Activity**
   - Check application logs regularly
   - Review user creation/deletion events

## Support

For issues or questions:
1. Check this guide first
2. Review error logs in console
3. Verify database connection
4. Check authentication middleware

## Future Enhancements

Potential additions:
- Activity logs for user actions
- Bulk user import/export
- Advanced filtering on user management
- Email notifications for user changes
- Two-factor authentication
- Session management
