# ✅ Check Button Feature - Complete Guide

## 🎯 What It Does

The **"Check if Profile Already Exists"** button helps you avoid duplicate entries by checking if a candidate already exists in your database BEFORE you fill out the entire form.

---

## 📍 Where Is It?

### Location:
**Manual Entry Tab → Step 1 Section**

### Visual Layout:
```
┌─────────────────────────────────────────────────────────┐
│  Step 1: Enter Basic Information (Blue Box)             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Full Name *]    [Email *]    [Contact Number *]       │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  🔍 Check if Profile Already Exists (Purple Button)│ │
│  └────────────────────────────────────────────────────┘ │
│  Click to check if this candidate already exists        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 How It Works

### Step-by-Step:

**1. Fill Basic Info:**
- Enter **Full Name**
- Enter **Email**
- Enter **Contact Number**

**2. Button Appears:**
- After all 3 fields are filled
- Large purple button shows up
- Says: "🔍 Check if Profile Already Exists"

**3. Click the Button:**
- Button changes to "🔍 Checking..."
- System searches your database
- Matches by email OR phone number

**4. Two Possible Results:**

#### A) Profile Found ⚠️
```
┌─────────────────────────────────────────────────────┐
│ ⚠️ Profile Already Exists!                          │
│                                                      │
│ Found existing profile for: John Doe                │
│                                                      │
│ ┌──────────────────────────────────────────────────┐│
│ │ Email: john@example.com                          ││
│ │ Phone: +1234567890                               ││
│ │ Skills: React                                    ││
│ │ Experience: 5 years                              ││
│ └──────────────────────────────────────────────────┘│
│                                                      │
│ [Continue with Old Profile] [Update to New Profile] │
│ [Cancel]                                            │
└─────────────────────────────────────────────────────┘
```

**Options:**
- **Continue with Old Profile** - Don't create duplicate, use existing
- **Update to New Profile** - Replace old data with new
- **Cancel** - Go back and edit

#### B) No Profile Found ✅
```
┌─────────────────────────────────────────────────────┐
│ ✅ No Profile Found                                  │
│                                                      │
│ You can continue with creating a new profile.       │
└─────────────────────────────────────────────────────┘

Then Step 2 appears below...
```

**5. Complete Form:**
- If no profile found, Step 2 appears
- Fill remaining fields
- Upload resume and ID proof
- Submit

---

## 🎨 Visual Design

### Step 1 Box (Blue):
- Light blue background
- Blue border
- Contains: Name, Email, Phone
- Check button at bottom

### Check Button (Purple):
- Full width
- Large and prominent
- Purple background
- Icon: 🔍
- Hover effect

### Profile Found Alert (Yellow):
- Yellow background
- Warning icon: ⚠️
- Shows existing profile details
- Three action buttons

### No Profile Alert (Green):
- Green background
- Success icon: ✅
- Simple message
- Step 2 appears below

### Step 2 Box (Gray):
- Light gray background
- Gray border
- Contains all other fields
- Submit button at bottom (Green)

---

## 💡 Use Cases

### Case 1: New Candidate
```
1. Enter: John Doe, john@example.com, +1234567890
2. Click: "Check if Profile Already Exists"
3. Result: "✅ No Profile Found"
4. Action: Fill Step 2 and submit
5. Outcome: New profile created
```

### Case 2: Existing Candidate - Continue
```
1. Enter: Jane Smith, jane@example.com, +0987654321
2. Click: "Check if Profile Already Exists"
3. Result: "⚠️ Profile Already Exists!"
4. Action: Click "Continue with Old Profile"
5. Outcome: No duplicate created, existing profile confirmed
```

### Case 3: Existing Candidate - Update
```
1. Enter: Bob Johnson, bob@example.com, +1122334455
2. Click: "Check if Profile Already Exists"
3. Result: "⚠️ Profile Already Exists!"
4. Action: Click "Update to New Profile"
5. Fill: New details in Step 2
6. Submit: Old profile updated with new data
```

### Case 4: Cancel and Edit
```
1. Enter: Alice Brown, alice@example.com, +5566778899
2. Click: "Check if Profile Already Exists"
3. Result: "⚠️ Profile Already Exists!"
4. Action: Click "Cancel"
5. Outcome: Alert closes, can edit name/email/phone
6. Can check again with corrected info
```

---

## 🔍 What It Checks

### Search Criteria:
- **Your uploads only** (not other recruiters)
- **Matches by:** Email OR Phone
- **Most recent:** Shows latest profile if multiple matches

### Example Matches:
| Your Input | Database | Match? |
|------------|----------|--------|
| john@example.com | john@example.com | ✅ Yes |
| +1234567890 | +1234567890 | ✅ Yes |
| john@example.com | jane@example.com | ❌ No |
| +1234567890 | +0987654321 | ❌ No |

---

## ⚙️ Technical Details

### When Button Appears:
- Condition: `name && email && phone` all filled
- Updates: On every keystroke
- Disappears: If any field is cleared

### API Endpoint:
```
POST /api/applications/check-profile
Body: { name, email, phone }
Response: { exists: true/false, profile: {...} }
```

### Search Logic:
```sql
SELECT * FROM applications 
WHERE uploaded_by = YOUR_ID 
AND (email = INPUT_EMAIL OR phone = INPUT_PHONE)
ORDER BY created_at DESC 
LIMIT 1
```

---

## 🎯 Benefits

### 1. Prevents Duplicates
- No accidental duplicate entries
- Keeps database clean
- Easy to find candidates

### 2. Saves Time
- Check before filling entire form
- Don't waste time on duplicates
- Quick validation

### 3. Update Existing
- Easy to update old profiles
- Keep data current
- No need to delete and recreate

### 4. User-Friendly
- Clear visual feedback
- Simple options
- Intuitive workflow

---

## 🐛 Troubleshooting

### Button Not Showing?
**Check:**
- All 3 fields filled? (Name, Email, Phone)
- No typos in fields?
- Fields not empty?

**Solution:**
- Fill all 3 fields completely
- Button appears automatically

### "Checking..." Never Finishes?
**Check:**
- Backend running? (`npm run dev`)
- Network tab in browser (F12)
- Backend console for errors

**Solution:**
- Restart backend
- Check API endpoint works

### Wrong Profile Shown?
**Check:**
- Email/phone matches someone else?
- Typo in email/phone?

**Solution:**
- Double-check the email/phone entered
- Click "Cancel" and correct

### Can't See Step 2?
**Check:**
- Did you check profile first?
- Is there an existing profile alert?

**Solution:**
- If "No Profile Found", Step 2 shows automatically
- If profile exists, choose an option first

---

## ✅ Success Indicators

### Button Working:
- ✅ Appears after filling 3 fields
- ✅ Changes to "Checking..." when clicked
- ✅ Shows result within 1-2 seconds

### Profile Check Working:
- ✅ Shows existing profile details if found
- ✅ Shows "No Profile Found" if new
- ✅ Options work correctly

### Form Flow Working:
- ✅ Step 1 → Check → Step 2 → Submit
- ✅ Clear visual progression
- ✅ No confusion about next steps

---

## 📸 Screenshots Reference

### Before Filling:
- Empty fields
- No check button

### After Filling 3 Fields:
- Name, Email, Phone filled
- Purple check button appears
- Help text below button

### Profile Found:
- Yellow alert box
- Profile details shown
- 3 action buttons

### No Profile:
- Green alert box
- Success message
- Step 2 appears below

### Step 2 Visible:
- Gray box with remaining fields
- All form fields visible
- Green submit button at bottom

---

**The check button is prominently displayed in Step 1 after you fill Name, Email, and Phone!** 🎯

Try it now:
1. Go to Manual Entry tab
2. Fill the 3 basic fields
3. Watch the purple button appear!
