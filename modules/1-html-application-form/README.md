# 📝 HTML Application Form Module

## Overview
Public-facing application form where candidates can submit their resumes.

## Files in This Module

### Frontend
- `client/src/pages/ApplicationForm.js` - Main application form component
- `client/public/index.html` - HTML entry point

### Backend
- `routes/applications.js` - API endpoints for form submission
- `utils/resumeParser.js` - Resume parsing logic (3-tier system)

### Database
- Table: `applications`
- Columns: name, email, phone, linkedin, technology, skills, location, experience, job_types, resume_url, id_proof_url, source, parsed_data, referral_source

## Features
✅ Multi-step form with validation
✅ Resume upload (PDF, DOC, DOCX)
✅ ID proof upload
✅ Auto-parsing of resumes (3-tier: Structured → Regex → AI)
✅ Referral source tracking (LinkedIn, Facebook, Twitter, etc.)
✅ Job type preferences (Full time, Part time, Consultant, Corporate trainer)

## API Endpoints

### POST /api/applications/submit
Submit application form with files

**Request:**
- Content-Type: multipart/form-data
- Body: FormData with all fields + files

**Response:**
```json
{
  "message": "Application submitted successfully",
  "id": 123
}
```

## How to Share Links

### With Referral Tracking:
```
http://localhost:3000/?ref=LinkedIn
http://localhost:3000/?ref=Facebook
http://localhost:3000/?ref=Twitter
http://localhost:3000/?ref=Instagram
http://localhost:3000/?ref=WhatsApp
```

### Direct Link:
```
http://localhost:3000/
```

## Testing
1. Open `http://localhost:3000/`
2. Fill in the form
3. Upload resume (optional)
4. Submit
5. Check database for new entry

## Related Documentation
- See `SOCIAL-MEDIA-LINKS.md` for referral tracking guide
- See `TIERED_PARSING_SYSTEM.md` for parsing details
