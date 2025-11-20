# How to Create Your Admin User

## Your Login Credentials
- **Email:** rekhamanideep@gmail.com
- **Password:** 1234567

---

## Method 1: Using pgAdmin (Easiest) ⭐

1. Open **pgAdmin**
2. Connect to your PostgreSQL server
3. Navigate to: **Databases → recruitment_db**
4. Click **Tools → Query Tool**
5. Copy and paste this SQL:

```sql
-- Delete existing user if any
DELETE FROM users WHERE email = 'rekhamanideep@gmail.com';

-- Create your admin user
INSERT INTO users (email, password, name, role) 
VALUES (
  'rekhamanideep@gmail.com',
  '$2a$10$TK/Gn4sJWfYOsvJmDT6OC.fy4eRzXpSVSTMw10pUzd7yNZuM5DcOO',
  'Rekha Manideep',
  'admin'
);

-- Verify it was created
SELECT id, email, name, role FROM users WHERE email = 'rekhamanideep@gmail.com';
```

6. Click **Execute** (F5)
7. You should see your user details in the results

---

## Method 2: Using SQL Shell (psql)

1. Open **SQL Shell (psql)** from Start Menu
2. Press Enter for default values until you reach password
3. Enter your PostgreSQL password
4. Run these commands:

```sql
\c recruitment_db

DELETE FROM users WHERE email = 'rekhamanideep@gmail.com';

INSERT INTO users (email, password, name, role) 
VALUES (
  'rekhamanideep@gmail.com',
  '$2a$10$TK/Gn4sJWfYOsvJmDT6OC.fy4eRzXpSVSTMw10pUzd7yNZuM5DcOO',
  'Rekha Manideep',
  'admin'
);

SELECT id, email, name, role FROM users WHERE email = 'rekhamanideep@gmail.com';
```

---

## Method 3: Run the SQL File

If you have psql in your PATH:

```bash
psql -U postgres -d recruitment_db -f CREATE_YOUR_ADMIN.sql
```

---

## After Creating the User

1. Make sure your backend is running:
   ```bash
   npm run dev
   ```

2. Make sure your frontend is running:
   ```bash
   cd client
   npm start
   ```

3. Go to: http://localhost:3000/login

4. Login with:
   - Email: `rekhamanideep@gmail.com`
   - Password: `1234567`

---

## Troubleshooting

### "relation 'users' does not exist"

The tables haven't been created yet. Run this in pgAdmin:

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'recruiter')),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications Table
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    linkedin VARCHAR(500),
    technology VARCHAR(100),
    primary_skill VARCHAR(100),
    secondary_skill VARCHAR(100),
    location VARCHAR(100),
    experience_years DECIMAL(4,1),
    resume_url VARCHAR(500),
    id_proof_url VARCHAR(500),
    source VARCHAR(50) NOT NULL CHECK (source IN ('html_form', 'dashboard')),
    uploaded_by INTEGER REFERENCES users(id),
    parsed_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Then create your admin user again.

---

### "database 'recruitment_db' does not exist"

Create the database first in pgAdmin:

1. Right-click on **Databases**
2. Select **Create → Database**
3. Name: `recruitment_db`
4. Click **Save**

Then create the tables and user.

---

## Verify User Was Created

Run this in pgAdmin:

```sql
SELECT id, email, name, role, created_at 
FROM users 
WHERE email = 'rekhamanideep@gmail.com';
```

You should see:
```
id | email                      | name            | role  | created_at
---+----------------------------+-----------------+-------+------------
 1 | rekhamanideep@gmail.com    | Rekha Manideep  | admin | 2024-...
```

---

## Change Password Later

If you want to change the password later, you can:

1. Login to the system
2. Or run this SQL with a new password hash:

```sql
UPDATE users 
SET password = '$2a$10$NEW_HASH_HERE' 
WHERE email = 'rekhamanideep@gmail.com';
```

---

## Create Additional Users

To create a recruiter account:

```sql
INSERT INTO users (email, password, name, role) 
VALUES (
  'recruiter@example.com',
  '$2a$10$TK/Gn4sJWfYOsvJmDT6OC.fy4eRzXpSVSTMw10pUzd7yNZuM5DcOO',
  'Recruiter Name',
  'recruiter'
);
```

(This uses the same password: 1234567)

---

**After running the SQL, you should be able to login!** ✅
