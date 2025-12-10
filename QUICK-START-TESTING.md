# Quick Start Testing Guide

## Run All Tests

```bash
# Start the server (if not already running)
node server.js

# In another terminal, run the comprehensive test suite
node test-all-features.js
```

## What Gets Tested

1. **Login** - User authentication
2. **Manual Entry** - Create profile with skills
3. **Search** - Search by skill name
4. **Filter** - Filter by experience range
5. **JD Matching** - Match candidates to job description
6. **Status Update** - Update recruitment and placement status
7. **Admin Assignment** - Assign resumes to admins
8. **Data Integrity** - Verify all data is saved correctly
9. **Cleanup** - Delete test data

## Expected Results

- **Success Rate**: 89% or higher
- **Passed Tests**: 8/9
- **Failed Tests**: 1 (due to existing invalid JSON data)

## Test Output

The test suite provides color-coded output:
- 🟢 **Green** = Success
- 🔴 **Red** = Failure
- 🟡 **Yellow** = Warning

## Manual Testing

### Test Search Functionality
1. Login as recruiter: `Indu@deltacubs.us` / `admin123`
2. Go to "My Resumes" tab
3. Enter a skill in search box (e.g., "React")
4. Click "Search"
5. Verify results show resumes with that skill

### Test Filtering
1. Go to Admin dashboard
2. Use "Advanced Filter" section
3. Enter experience range (e.g., 3-7 years)
4. Enter skills (e.g., "React, Node.js")
5. Click "Apply Filters"
6. Verify results match criteria

### Test JD Matching
1. Go to Admin dashboard
2. Click "JD Matching" tab
3. Paste a job description with required skills
4. Click "Find Matches"
5. Verify candidates are ranked by match percentage
6. Check that matching/missing skills are shown

### Test Status Updates
1. Go to "My Resumes" tab
2. Find a resume
3. Change recruitment status dropdown
4. Change placement status dropdown
5. Refresh page
6. Verify status changes persisted

### Test Admin Assignment
1. Go to "My Resumes" tab
2. Find a resume
3. Select an admin from "Assign to Admin" dropdown
4. Verify assignment shows "✅ Assigned to: [Admin Name]"
5. Admin should see this resume in their "Assigned Resumes" view

## Troubleshooting

### Tests Fail with "Invalid token"
- Server might not be running
- Run: `node server.js`

### Tests Fail with "Invalid credentials"
- User might not exist in database
- Run: `node show-users.js` to see available users
- Update test credentials in `test-all-features.js`

### JD Matching Returns 0 Results
- This is expected if no resumes match the JD
- Add more test resumes with diverse skills
- Or modify the test JD to match existing resumes

### Invalid JSON Error
- Some existing resumes have corrupted parsed_data
- Run data cleanup script (if available)
- Or manually fix the invalid JSON in database

## Database Verification

Check if keywords are being saved:

```sql
-- Check parsed_data for a specific resume
SELECT id, name, parsed_data FROM applications WHERE id = 1;

-- Check all resumes with skills
SELECT id, name, primary_skill, secondary_skill, 
       parsed_data->'skills' as skills_array 
FROM applications 
WHERE parsed_data IS NOT NULL;

-- Search for resumes with specific skill
SELECT id, name, primary_skill 
FROM applications 
WHERE primary_skill ILIKE '%React%' 
   OR secondary_skill ILIKE '%React%' 
   OR parsed_data::text ILIKE '%React%';
```

## Next Steps

1. Run the test suite: `node test-all-features.js`
2. Review the test results
3. Fix any failing tests
4. Test manually in the browser
5. Deploy to production when all tests pass
