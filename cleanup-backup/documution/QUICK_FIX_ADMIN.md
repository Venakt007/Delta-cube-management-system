# Quick Fix - Create Admin User

## ✅ Simple Solution (3 Steps)

### Step 1: Open pgAdmin
1. Open pgAdmin (PostgreSQL GUI tool)
2. Connect to your PostgreSQL server
3. Expand "Databases" → Find "recruitment_db"
4. Right-click on "recruitment_db" → Select "Query Tool"

### Step 2: Run This SQL
Copy and paste this into the Query Tool and click Execute (▶️):

```sql
-- Delete any existing admin
DELETE FROM users WHERE email = 'admin@recruitment.com';

-- Create admin user (password: 123456)
INSERT INTO users (email, password, name, role) 
VALUES (
  'admin@recruitment.com',
  '$2a$10$TK/Gn4sJWfYOsvJmDT6OC.fy4eRzXpSVSTMw10pUzd7yNZuM5DcOO',
  'System Admin',
  'admin'
);

-- Verify it worked
SELECT id, email, name, role FROM users WHERE email = 'admin@recruitment.com';
```

### Step 3: Login
Go to http://localhost:3000/login and use:
- **Email:** `admin@recruitment.com`
- **Password:** `123456`

---

## Alternative: Using Command Line

If you have PostgreSQL in your PATH:

```bash
psql -U postgres -d recruitment_db -f SIMPLE_ADMIN_SETUP.sql
```

---

## Alternative: Using SQL Shell (psql)

1. Open "SQL Shell (psql)" from Start Menu
2. Press Enter for Server, Database, Port, Username (use defaults)
3. Enter your PostgreSQL password: `12345678`
4. Run these commands:

```sql
\c recruitment_db

DELETE FROM users WHERE email = 'admin@recruitment.com';

INSERT INTO users (email, password, name, role) 
VALUES ('admin@recruitment.com', '$2a$10$TK/Gn4sJWfYOsvJmDT6OC.fy4eRzXpSVSTMw10pUzd7yNZuM5DcOO', 'System Admin', 'admin');

SELECT * FROM users WHERE email = 'admin@recruitment.com';

\q
```

---

## Verify It Worked

You should see output like:
```
 id |         email          |     name     | role  
----+------------------------+--------------+-------
  1 | admin@recruitment.com  | System Admin | admin
```

---

## Login Credentials

```
Email:    admin@recruitment.com
Password: 123456
```

---

## Still Not Working?

### Check if tables exist:
```sql
\dt
```

Should show:
- applications
- users

### If tables don't exist, create them:
```sql
-- Run the database.sql file first
\i database.sql
```

Or in pgAdmin:
1. Open database.sql file
2. Copy all contents
3. Paste in Query Tool
4. Execute

---

## Change Password Later

If you want to change the password after logging in, you can:

1. Login to the system
2. Go to admin panel
3. Or run SQL:

```sql
-- For password: newpassword
-- You need to generate bcrypt hash first
UPDATE users 
SET password = 'NEW_BCRYPT_HASH_HERE' 
WHERE email = 'admin@recruitment.com';
```

---

**That's it! You should now be able to login.** ✅
