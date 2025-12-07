# Quick Fix: RDS Security Group Not Working

## 🎯 The Problem

You're trying to add this rule but it's not working:
```
Type: PostgreSQL
Port: 5432
Source: recruitment-sg
```

## ⚡ Quick Solution (3 Steps)

### Step 1: Get Your EC2 Security Group ID

1. Open AWS Console
2. Go to: **EC2** → **Security Groups** (left menu)
3. Find: `recruitment-sg`
4. Copy the **Security Group ID** (looks like `sg-0123abc456def789`)

**Example:**
```
Name: recruitment-sg
Security Group ID: sg-0a1b2c3d4e5f6g7h
VPC ID: vpc-12345678
```

---

### Step 2: Add Rule Using the ID

1. Still in **Security Groups**
2. Find: `recruitment-rds-sg` (your RDS security group)
3. Click on it
4. Click **"Inbound rules"** tab
5. Click **"Edit inbound rules"**
6. Click **"Add rule"**
7. Fill in:
   - **Type:** Select "PostgreSQL" from dropdown
   - **Port:** 5432 (auto-filled)
   - **Source:** Select "Custom" from dropdown
   - **Source box:** Type or paste `sg-0a1b2c3d4e5f6g7h` (your EC2 SG ID)
   - **Description:** "Allow EC2 to RDS"
8. Click **"Save rules"**

---

### Step 3: Verify It Worked

Check the inbound rules table shows:
```
Type        Protocol  Port Range  Source              Description
PostgreSQL  TCP       5432        sg-0a1b2c3d4e5f6g7h  Allow EC2 to RDS
```

---

## 🐛 If It Still Doesn't Work

### Problem: Can't find the security group in dropdown

**Solution:** Type the ID directly instead of searching

1. In the Source field, **type** the security group ID: `sg-0a1b2c3d4e5f6g7h`
2. Press Enter or Tab
3. It should recognize it and show the name

---

### Problem: Different VPCs

**Check if both are in the same VPC:**

1. Click on `recruitment-sg` → Check "VPC ID"
2. Click on `recruitment-rds-sg` → Check "VPC ID"
3. **They must match!**

**If different:**
- Use IP address instead:
  1. Get EC2 Private IP: EC2 Console → Instances → Your instance → Private IPv4
  2. Use this as source: `172.31.45.67/32` (your IP with /32)

---

### Problem: Rule added but connection fails

**Test from EC2:**

```bash
# SSH into your EC2
ssh -i your-key.pem ec2-user@your-ec2-public-ip

# Test connection
telnet your-rds-endpoint.rds.amazonaws.com 5432

# Expected: Should connect or ask for password
# If timeout: Security group still blocking
```

---

## 🎯 Alternative: Use IP Address (Simpler)

If security group reference doesn't work, use IP directly:

### Step 1: Get EC2 Private IP
```
EC2 Console → Instances → Your instance
Copy: Private IPv4 address (e.g., 172.31.45.67)
```

### Step 2: Add Rule with IP
```
Type: PostgreSQL
Port: 5432
Source: Custom
Source value: 172.31.45.67/32
Description: Allow my EC2 instance
```

**Note:** Add `/32` at the end of the IP!

---

## ✅ How to Know It's Working

### Test 1: Check Rule Exists
```
RDS Security Group → Inbound rules
Should show: PostgreSQL | TCP | 5432 | sg-xxx or IP
```

### Test 2: Test from EC2
```bash
telnet your-rds-endpoint.rds.amazonaws.com 5432
# Should connect (not timeout)
```

### Test 3: Try PostgreSQL Connection
```bash
psql -h your-rds-endpoint.rds.amazonaws.com -U postgres -d recruitment_db
# Should ask for password (not connection refused)
```

---

## 📋 Complete Example

**Your Setup:**
- EC2 Security Group: `recruitment-sg` (ID: `sg-0a1b2c3d4e5f6g7h`)
- RDS Security Group: `recruitment-rds-sg` (ID: `sg-9h8g7f6e5d4c3b2a`)
- EC2 Private IP: `172.31.45.67`
- RDS Endpoint: `recruitment-db.abc123.us-east-1.rds.amazonaws.com`

**Add this rule to `recruitment-rds-sg`:**

**Option 1 (Recommended):**
```
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: sg-0a1b2c3d4e5f6g7h
Description: Allow EC2 to connect
```

**Option 2 (If Option 1 fails):**
```
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: 172.31.45.67/32
Description: Allow EC2 IP to connect
```

---

## 🆘 Emergency Fix (Testing Only)

If nothing works and you need to test quickly:

**⚠️ WARNING: This makes your database accessible from anywhere! Only for testing!**

```
Type: PostgreSQL
Port: 5432
Source: 0.0.0.0/0
Description: TEMPORARY - Allow all (REMOVE AFTER TESTING!)
```

**Remember to remove this rule after testing!**

---

## 📞 Still Stuck?

Run these commands and share the output:

```bash
# From your EC2 instance:
curl -s http://169.254.169.254/latest/meta-data/security-groups
curl -s http://169.254.169.254/latest/meta-data/local-ipv4

# From AWS CLI:
aws ec2 describe-security-groups --group-names recruitment-sg
aws ec2 describe-security-groups --group-names recruitment-rds-sg
```

Share:
1. The security group IDs
2. The VPC IDs
3. Any error messages you see
4. Screenshot of the inbound rules

---

**Need the full guide?** See `AWS-RDS-SECURITY-GROUP-FIX.md`
