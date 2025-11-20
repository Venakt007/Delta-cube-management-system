# 🧪 How to Test Resume Upload

## Quick Test Steps

### Step 1: Check Backend Console
Look at the terminal where you ran `npm run dev`

You should see:
```
Server running on port 5000
Database connected successfully
```

### Step 2: Try Upload
1. Open browser: http://localhost:3000/login
2. Login: `recruiter@test.com` / `recruiter123`
3. Click "Upload Resumes" tab
4. Select ONE PDF resume
5. **WATCH THE BACKEND CONSOLE!**

### Step 3: Read Backend Messages

**If you see this - AI is working:**
```
✅ Resume parsed successfully: John Doe
```

**If you see this - Fallback is working:**
```
⚠️  Using fallback basic parsing (no AI)
✅ Basic parsing complete: John Doe
```

**If you see this - There's an error:**
```
❌ AI parsing error: [error message]
⚠️  Invalid API key
```

---

## What Each Error Means

### Error: "Invalid API key"
**Problem:** Your OpenAI API key is wrong or expired

**Fix:**
1. Go to: https://platform.openai.com/api-keys
2. Create new API key
3. Copy it
4. Edit `.env` file:
   ```
   OPENAI_API_KEY=sk-your-new-key-here
   ```
5. Restart backend: `npm run dev`

### Error: "Rate limit or quota exceeded"
**Problem:** Out of credits or too many requests

**Fix:**
1. Go to: https://platform.openai.com/account/usage
2. Check if you have credits
3. Add credits if needed
4. Or wait a few minutes
5. **Fallback parsing will work automatically**

### Error: "Model not found"
**Problem:** Can't access the model

**Fix:**
- Check OpenAI status: https://status.openai.com/
- **Fallback parsing will work automatically**

---

## Expected Results

### Best Case (AI Works):
**Backend Console:**
```
✅ Resume parsed successfully: John Doe
```

**Frontend:**
```
✅ Successfully uploaded 1 resume(s)
```

**Table:**
- Name: John Doe
- Email: john@example.com
- Phone: +1234567890
- Skills: React, Node.js, Python
- No yellow highlight

### Good Case (Fallback Works):
**Backend Console:**
```
❌ AI parsing error: [some error]
⚠️  Using fallback basic parsing (no AI)
✅ Basic parsing complete: John Doe
```

**Frontend:**
```
✅ Successfully uploaded 1 resume(s)
```

**Table:**
- Name: John Doe
- Email: john@example.com
- Phone: +1234567890
- Skills: JavaScript, Python
- May have yellow highlight

### Bad Case (Parsing Failed):
**Backend Console:**
```
❌ AI parsing error: [error]
⚠️  Using fallback basic parsing (no AI)
✅ Basic parsing complete: Unknown
```

**Frontend:**
```
✅ Successfully uploaded 1 resume(s)
```

**Table:**
- Name: Unknown ⚠️ Check
- Email: john@example.com (if found)
- Phone: - (if not found)
- Skills: No skills parsed
- Yellow highlight

---

## What to Share If Still Not Working

If upload still fails, share these details:

**1. Backend Console Output:**
```
Copy the error messages from terminal
```

**2. Frontend Error Message:**
```
Copy the error from upload tab
```

**3. File Type:**
```
What file are you uploading? (PDF, DOCX, etc.)
```

**4. .env Check:**
```bash
# Run this and share if OPENAI_API_KEY is set:
type .env | findstr OPENAI_API_KEY
```

---

## Quick Checklist

Before testing:
- [ ] Backend running (`npm run dev`)
- [ ] Frontend running (`npm start`)
- [ ] Logged in as recruiter
- [ ] On "Upload Resumes" tab
- [ ] Backend console visible
- [ ] Have a PDF resume ready

During test:
- [ ] Select ONE file
- [ ] Watch backend console
- [ ] Note any error messages
- [ ] Check if resume appears in table

After test:
- [ ] Go to "My Resumes" tab
- [ ] Check if resume is there
- [ ] Check if data is extracted
- [ ] Note any yellow highlights

---

## Most Common Issue

**"✅ Successfully uploaded 0 resume(s) ⚠️ 1 file(s) failed"**

This means:
1. File was uploaded to server ✅
2. But parsing failed ❌

**Check backend console for the exact error!**

The error message there will tell you:
- Is it API key issue?
- Is it rate limit?
- Is it file format?
- Is it network?

---

## Simple Test

**Create a simple text file as resume:**

1. Create `test-resume.txt`:
```
John Doe
Email: john@example.com
Phone: +1234567890

SKILLS
JavaScript, React, Node.js, Python

EXPERIENCE
5 years of experience in software development

EDUCATION
Bachelor of Computer Science
```

2. Save as PDF (use any PDF converter)

3. Upload this simple resume

4. Should work with fallback parsing even if AI fails

---

**The key is to watch the backend console - it will tell you exactly what's happening!**
