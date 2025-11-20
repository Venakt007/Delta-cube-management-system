# 👔 Recruiter Dashboard Module

## Overview
Dashboard for recruiters to manage their uploaded resumes.

## Files in This Module

### Frontend
- `client/src/pages/RecruiterDashboard.js` - Main dashboard component
- `client/src/pages/Login.js` - Login page (shared)

### Backend
- `routes/applications.js` - Recruiter-specific endpoints
- `middleware/auth.js` - Authentication middleware

### Database
- Table: `users` (role: 'recruiter')
- Table: `applications` (filtered by uploaded_by)

## Features
✅ Manual resume entry with form
✅ Bulk resume upload (up to 20 files)
✅ Auto-parse resumes on upload
✅ Search resumes by skill
✅ Update recruitment status (Pending, On Hold, Rejected, etc.)
✅ Update placement status (Bench, Onboarded)
✅ Edit resume details
✅ Delete resumes
✅ Check for duplicate profiles
✅ Download resumes

## Tabs

### 1. Manual Entry
- Enter candidate details manually
- Upload resume (optional) - auto-fills form
- Check if profile already exists
- Edit existing profiles

### 2. Upload Resumes
- Bulk upload up to 20 resumes
- AI auto-parsing (3-tier system)
- Shows success/error for each file

### 3. My Resumes
- View all uploaded resumes
- Search by skill
- Update status (2 separate dropdowns)
- Edit/Delete actions

## Status System

### Recruitment Status (First Dropdown)
- Pending
- On Hold
- Profile Not Found
- Rejected
- Submitted
- Interview scheduled
- Closed

### Placement Status (Second Dropdown)
- Bench (visible to admin)
- Onboarded (hidden from admin)

## API Endpoints

### GET /api/applications/my-resumes
Get recruiter's uploaded resumes

### POST /api/applications/upload-bulk
Upload multiple resumes

### POST /api/applications/manual-entry
Create/update resume manually

### PATCH /api/applications/resumes/:id/status
Update resume status

### DELETE /api/applications/delete/:id
Delete resume

## Access
- URL: `http://localhost:3000/recruiter`
- Role: `recruiter`
- Login required

## Testing
1. Login as recruiter
2. Try manual entry
3. Try bulk upload
4. Update statuses
5. Edit/delete resumes
