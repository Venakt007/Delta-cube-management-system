# 🔧 System Admin Dashboard Module

## Overview
Dashboard for system administrators to manage their own uploaded resumes (similar to recruiter but with system admin branding).

## Files in This Module

### Frontend
- `client/src/pages/SystemAdminDashboard.js` - System admin dashboard
- `client/src/pages/Login.js` - Login page (shared)

### Backend
- `routes/system-admin.js` - System admin endpoints
- `middleware/auth.js` - System admin authorization

### Database
- Table: `users` (role: 'system_admin')
- Table: `applications` (filtered by uploaded_by = system_admin)

## Features
✅ View own uploaded resumes only
✅ Separate tab for onboarded resumes
✅ JD matching for own resumes
✅ Search by name, email, skill
✅ Track referral sources (LinkedIn, Facebook, etc.)
✅ Download resumes
✅ Simple, clean styling

## Tabs

### 1. My Resumes
- Shows system admin's uploaded resumes
- Excludes onboarded
- Displays: name, email, phone, skills, experience, status, location, referral source
- Color-coded referral sources

### 2. Onboarded
- Shows only onboarded resumes
- Separate view for placed candidates
- Green theme

### 3. JD Matching
- Paste job description
- AI analyzes requirements
- Matches only system admin's resumes
- Shows match percentage
- Displays matching/missing skills

## Referral Source Tracking

### Color Coding:
- **LinkedIn** - Blue
- **Facebook** - Indigo
- **Twitter** - Sky Blue
- **Instagram** - Pink
- **WhatsApp** - Green
- **Direct** - Gray

### How It Works:
1. Share application form with `?ref=SOURCE`
2. When someone applies, source is captured
3. View source in "Source" column

## API Endpoints

### GET /api/system-admin/all-resumes
Get system admin's resumes

**Query Parameters:**
- `showOnboarded=only` - Show only onboarded
- `showOnboarded=true` - Show all

### POST /api/system-admin/jd-match
Match system admin's resumes to JD

**Request:**
```json
{
  "jobDescription": "Job description text..."
}
```

### GET /api/system-admin/stats
Get statistics (optional)

## Access
- URL: `http://localhost:3000/system-admin`
- Role: `system_admin`
- Login required

## Creating System Admin User

Run this command:
```bash
node create-system-admin.js
```

**Default Credentials:**
- Email: `systemadmin@example.com`
- Password: `admin123`

## Testing
1. Create system admin user
2. Login as system admin
3. Upload resumes
4. Check referral sources
5. Try JD matching
6. View onboarded tab

## Use Cases
- Managing resumes from social media campaigns
- Tracking which platforms bring candidates
- Handling resumes from different sources
- Separate from regular recruiters
