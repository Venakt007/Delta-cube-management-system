# 👨‍💼 Admin Dashboard Module

## Overview
Dashboard for admins to view all resumes from all recruiters (except onboarded).

## Files in This Module

### Frontend
- `client/src/pages/AdminDashboard.js` - Main admin dashboard
- `client/src/pages/Login.js` - Login page (shared)

### Backend
- `routes/admin.js` - Admin-specific endpoints
- `middleware/auth.js` - Admin authorization

### Database
- Table: `users` (role: 'admin')
- Table: `applications` (all resumes, filtered by placement_status)

## Features
✅ View all resumes from all recruiters
✅ Separate tab for onboarded resumes
✅ Advanced filtering (skills, experience, location, technology)
✅ JD matching with AI
✅ See who uploaded each resume
✅ Download resumes
✅ Statistics dashboard

## Tabs

### 1. Active Resumes
- Shows all resumes EXCEPT onboarded
- Displays: name, email, skills, experience, status, source, uploader
- Color-coded status badges

### 2. Onboarded
- Shows only onboarded resumes
- Separate view for placed candidates
- Green theme

### 3. Advanced Filter
- Filter by skills (comma-separated)
- Filter by experience range
- Filter by location
- Filter by technology
- Real-time filtering

### 4. JD Matching
- Paste job description
- AI analyzes requirements
- Matches candidates by:
  - Skills (60% weight)
  - Experience (30% weight)
  - Location (10% weight)
- Shows match percentage
- Displays matching/missing skills

## Visibility Rules
- ✅ Sees all resumes from all recruiters
- ✅ Sees form submissions (public)
- ❌ Does NOT see "Onboarded" in active tab
- ✅ Can view "Onboarded" in separate tab

## API Endpoints

### GET /api/admin/resumes
Get all resumes (excluding onboarded)

**Query Parameters:**
- `showOnboarded=only` - Show only onboarded
- `showOnboarded=true` - Show all including onboarded

### GET /api/admin/resumes/filter
Advanced filtering

**Query Parameters:**
- `skills` - Comma-separated skills
- `experience_min` - Minimum years
- `experience_max` - Maximum years
- `location` - Location filter
- `technology` - Technology filter

### POST /api/admin/jd-match
Match candidates to job description

**Request:**
```json
{
  "jobDescription": "Job description text..."
}
```

**Response:**
```json
{
  "jdAnalysis": { ... },
  "matches": [
    {
      "id": 1,
      "name": "John Doe",
      "matchPercentage": 85,
      "matchingSkills": ["React", "Node.js"],
      "missingSkills": ["Python"],
      ...
    }
  ]
}
```

## Access
- URL: `http://localhost:3000/admin`
- Role: `admin`
- Login required

## Testing
1. Login as admin
2. View all resumes
3. Try filtering
4. Test JD matching
5. Check onboarded tab
