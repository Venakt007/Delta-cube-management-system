# Fix: Super Admin Role Check Constraint Error

## 🔴 Error Message:
```
❌ Error creating super admin: new row for relation "users" violates check constraint "users_role_check"
```

## 🎯 What This Means:

The database doesn't recognize `super_admin` as a valid role yet. The database constraint only allows `admin` and `recruiter`, but not `super_admin`.

---

## ✅ Quick Fix (2 Steps)

### Step 1: Run the Migration

In **Render Shell**, run:

```bash
node migrations/add-super-admin-role.js
```

**You should see:**
```
✅ Migration completed successfully!
```

### Step 2: Create Super Admin

Now run:

```bash
node create-super-admin-auto.js
```

**You should see:**
```
✅ Super Admin created successfully!

📋 User Details:
  Email: superadmin@example.com
  Password: SuperAdmin123!
```

---

## 📋 Complete Setup Commands

Run these commands **in order** in Render Shell:

```bash
# 1. Add super_admin role to database
node migrations/add-super-admin-role.js

# 2. Add edited_resume field (optional but recommended)
node migrations/add-edited-resume-field.js

# 3. Create super admin user
node create-super-admin-auto.js
```

---

## 🔍 Verify It Worked

### Check the database:

```bash
# Connect to database
psql $DATABASE_URL

# Check users table constraint
\d users

# You should see: role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'recruiter'))

# Check if super admin was created
SELECT id, email, name, role FROM users;

# Exit
\q
```

---

## 🐛 If Migration Fails

### Error: "Migration already ran"

**This is OK!** The migration was already applied. Just proceed to create the super admin:

```bash
node create-super-admin-auto.js
```

### Error: "Cannot connect to database"

**Check database connection:**

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# If this fails, check:
# 1. DATABASE_URL is set in Render environment
# 2. Database service is running
```

### Error: "User already exists"

**Super admin already created!** Check existing users:

```bash
psql $DATABASE_URL -c "SELECT email, role FROM users WHERE role = 'super_admin';"
```

If you see a user, you can login with those credentials. If you forgot the password, reset it:

```bash
node manage-users.js
# Select option 4 (Update password)
```

---

## 🎯 Alternative: Manual Migration

If the migration script doesn't work, run this SQL directly:

```bash
# Connect to database
psql $DATABASE_URL

# Run this SQL:
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('super_admin', 'admin', 'recruiter'));

# Verify
\d users

# Exit
\q
```

Then create super admin:

```bash
node create-super-admin-auto.js
```

---

## 📊 What the Migration Does

The migration updates the database constraint from:

**Before:**
```sql
CHECK (role IN ('admin', 'recruiter'))
```

**After:**
```sql
CHECK (role IN ('super_admin', 'admin', 'recruiter'))
```

This allows the database to accept `super_admin` as a valid role.

---

## ✅ Success Checklist

- [ ] Migration ran successfully
- [ ] No errors when creating super admin
- [ ] Super admin user appears in database
- [ ] Can login with super admin credentials
- [ ] Redirects to `/super-admin` after login

---

## 🎉 After Fix

Once the migration runs successfully, you can:

1. **Create super admin:**
   ```bash
   node create-super-admin-auto.js
   ```

2. **Login at:**
   ```
   https://your-render-url.onrender.com/login
   ```

3. **Use credentials:**
   ```
   Email: superadmin@example.com
   Password: SuperAdmin123!
   ```

4. **You'll be redirected to:**
   ```
   https://your-render-url.onrender.com/super-admin
   ```

---

## 💡 Pro Tip

**Always run migrations before creating users!**

Correct order:
1. ✅ Setup database (`node setup-database.js`)
2. ✅ Run migrations (`node migrations/add-super-admin-role.js`)
3. ✅ Create users (`node create-super-admin-auto.js`)

---

## 🆘 Still Getting Error?

**Share this info:**

1. Output of: `psql $DATABASE_URL -c "\d users"`
2. Output of migration script
3. Full error message

**Most likely:** Just need to run the migration! 🚀
