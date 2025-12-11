# Fix Database Connection Issue

## Problem
You're getting "Invalid credentials" when trying to login because the database connection is failing.

## Current Error
```
password authentication failed for user "postgres"
```

## Solution Options

### Option 1: Update Database Password in .env

Your `.env` file currently has:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/recruitment_db
```

**Try these common PostgreSQL passwords:**

1. **No password** (empty):
```
DATABASE_URL=postgresql://postgres:@localhost:5432/recruitment_db
```

2. **postgres** (common default):
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/recruitment_db
```

3. **admin**:
```
DATABASE_URL=postgresql://postgres:admin@localhost:5432/recruitment_db
```

4. **Your custom password** (if you set one during installation)

### Option 2: Reset PostgreSQL Password

If you don't remember the password:

1. **Open pgAdmin** (if installed)
2. Right-click on "postgres" user
3. Select "Properties" → "Definition"
4. Set a new password
5. Update `.env` file with the new password

### Option 3: Use psql Command

```bash
# Connect to PostgreSQL
psql -U postgres

# If it asks for password, try: postgres, admin, or leave blank
```

### Option 4: Check PostgreSQL Configuration

1. Find your PostgreSQL installation folder
2. Look for `pg_hba.conf` file
3. Check authentication method for localhost

## Quick Fix Steps

1. **Stop the servers** (if running)
2. **Update `.env` file** with correct password
3. **Restart servers**:
   ```bash
   npm start
   ```
4. **Test database connection**:
   ```bash
   node show-users.js
   ```

## Test Database Connection

Once you update the password, run:
```bash
node show-users.js
```

You should see a list of users like:
```
👥 Checking users in database...
Database connected successfully
✅ Users found:

ID: 1
Email: Indu@deltacubs.us
Name: Annoj indu
Role: recruiter
...
```

## After Fixing Database

Once the database connection works, you can login with:

**Recruiter**:
- Email: `Indu@deltacubs.us`
- Password: `admin123`

**Admin**:
- Email: `Manoj@deltacubs.us`
- Password: `admin123`

**Super Admin**:
- Email: `superadmin@example.com`
- Password: `admin123`

## Need Help?

If you're still having issues:
1. Check if PostgreSQL service is running
2. Verify the database name exists: `recruitment_db`
3. Check PostgreSQL logs for errors
4. Try connecting with pgAdmin or another PostgreSQL client

## Alternative: Use Render Database

If local database is too difficult, you can use your Render production database:

1. Go to Render dashboard
2. Find your database service
3. Copy the "External Database URL"
4. Update `.env`:
   ```
   DATABASE_URL=<paste-render-database-url-here>
   NODE_ENV=production
   ```

This will connect your local app to the production database.
