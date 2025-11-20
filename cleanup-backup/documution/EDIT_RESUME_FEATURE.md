# ✏️ Edit Resume Feature - User Guide

## 🎯 What's New

You can now **edit any resume** directly from the dashboard! The system will:
1. Load all existing data into the form
2. Let you edit any field manually
3. Save the updated information

---

## 🚀 How to Use

### Step 1: View Your Resumes
1. Login as recruiter: `recruiter@test.com` / `123456`
2. Click on **"My Resumes"** tab
3. You'll see all your uploaded resumes

### Step 2: Click Edit Button
1. Find the resume you want to edit
2. Click the **"✏️ Edit"** button in the Actions column
3. The system will:
   - Switch to the "Manual Entry" tab
   - Load all existing data into the form
   - Show a message: "📝 Editing resume..."

### Step 3: Edit the Data
1. Review all the fields
2. Edit any information you want to change:
   - Name
   - Email
   - Phone
   - LinkedIn
   - Technology
   - Primary Skill
   - Secondary Skill
   - Location
   - Experience Years
3. You can also upload a new resume file (optional)

### Step 4: Save Changes
1. Click **"💾 Update Profile"** button (orange button)
2. Wait for confirmation: "✅ Profile updated successfully!"
3. The resume list will refresh with your changes

### Step 5: Cancel (Optional)
- If you don't want to save changes, click **"Cancel Edit"** button
- This will clear the form and return to normal mode

---

## 📊 Example Workflow

```
1. Go to "My Resumes" tab
   ↓
2. See: John Smith | john@example.com | React | 5 years
   ↓
3. Click "✏️ Edit" button
   ↓
4. Form loads with:
   - Name: John Smith
   - Email: john@example.com
   - Primary Skill: React
   - Experience: 5
   ↓
5. Change:
   - Experience: 5 → 6
   - Secondary Skill: → Node.js
   - Location: → Remote
   ↓
6. Click "💾 Update Profile"
   ↓
7. ✅ Success! Resume updated
```

---

## 🎨 Visual Indicators

### Edit Mode Active:
- **Header**: "✏️ Edit Resume" (instead of "Manual Entry")
- **Cancel Button**: Shows in top-right corner
- **Submit Button**: Orange "💾 Update Profile" (instead of green "✅ Save Profile")
- **Message**: Blue box with "📝 Editing resume..."

### Normal Mode:
- **Header**: "Manual Entry"
- **No Cancel Button**
- **Submit Button**: Green "✅ Save Profile"

---

## 🔍 What Data is Loaded

When you click Edit, the form is populated with:

| Field | Source |
|-------|--------|
| Name | `resume.name` |
| Email | `resume.email` |
| Phone | `resume.phone` |
| LinkedIn | `resume.linkedin` |
| Technology | `resume.technology` |
| Primary Skill | `resume.primary_skill` |
| Secondary Skill | `resume.secondary_skill` |
| Location | `resume.location` |
| Experience Years | `resume.experience_years` |

---

## ✅ Features

### ✅ Edit Any Field
- All fields are editable
- Empty fields show as blank (you can fill them)
- Numeric fields (experience) handle empty values

### ✅ Optional File Upload
- You don't need to upload a new resume
- If you upload a new file, it will replace the old one
- Old resume is kept if you don't upload a new one

### ✅ Validation
- Name and Email are required
- Experience years can be empty (defaults to 0)
- All other fields are optional

### ✅ Cancel Anytime
- Click "Cancel Edit" to abort changes
- Form clears and returns to normal mode
- No changes are saved

---

## 🎯 Use Cases

### 1. Fix Parsing Errors
If the AI parser made mistakes:
1. Click Edit
2. Correct the wrong information
3. Save

### 2. Update Information
When candidate's info changes:
1. Click Edit
2. Update experience, skills, location, etc.
3. Save

### 3. Add Missing Data
If some fields are empty:
1. Click Edit
2. Fill in the missing information
3. Save

### 4. Replace Resume File
If you have a newer version:
1. Click Edit
2. Upload new resume file
3. Save (old file is replaced)

---

## 🔧 Technical Details

### Backend Endpoint
```
POST /api/applications/manual-entry
```

### Request Data
```javascript
{
  name: "John Smith",
  email: "john@example.com",
  phone: "1234567890",
  // ... other fields
  action: "update",
  existing_id: 123
}
```

### Response
```javascript
{
  message: "Profile updated successfully",
  id: 123
}
```

---

## 🎉 Benefits

1. **No Need to Re-upload**: Edit existing data without re-uploading resume
2. **Fix AI Errors**: Correct any parsing mistakes manually
3. **Keep Data Updated**: Update candidate information as it changes
4. **Full Control**: Edit any field you want
5. **Safe**: Cancel anytime without saving changes

---

## 🧪 Test It Now!

1. **Login**: `recruiter@test.com` / `123456`
2. **Go to**: "My Resumes" tab
3. **Click**: "✏️ Edit" on any resume
4. **Change**: Any field you want
5. **Save**: Click "💾 Update Profile"
6. **Verify**: Check the updated data in the table

---

## 📝 Notes

- ✅ Works with all resumes (form submissions + uploads)
- ✅ Preserves resume file if not replaced
- ✅ Handles empty fields gracefully
- ✅ Shows clear visual feedback
- ✅ Can cancel without saving

**Your recruitment system now has full CRUD functionality!** 🎉
(Create, Read, Update, Delete)
