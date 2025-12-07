# AWS RDS Security Group Configuration Fix

## 🔴 Problem: Cannot Add Inbound Rule for PostgreSQL

You're trying to allow your EC2 instance to connect to RDS, but the security group rule isn't working.

---

## ✅ Solution: Step-by-Step Fix

### Step 1: Verify Your Security Groups Exist

First, make sure both security groups are created:

1. **Go to EC2 Console** → Security Groups
2. **Find these two groups:**
   - `recruitment-sg` (for EC2 instance)
   - `recruitment-rds-sg` (for RDS database)

**If they don't exist, create them first!**

---

### Step 2: Get the EC2 Security Group ID

You need the **Security Group ID**, not the name.

1. Go to **EC2 Console** → **Security Groups**
2. Find `recruitment-sg`
3. Copy the **Security Group ID** (looks like `sg-0123456789abcdef`)

**Example:** `sg-0a1b2c3d4e5f6g7h8`

---

### Step 3: Add Inbound Rule to RDS Security Group

#### Option A: Using Security Group ID (Recommended)

1. Go to **EC2 Console** → **Security Groups**
2. Select `recruitment-rds-sg` (your RDS security group)
3. Click **"Inbound rules"** tab
4. Click **"Edit inbound rules"**
5. Click **"Add rule"**
6. Configure:
   ```
   Type: PostgreSQL
   Protocol: TCP
   Port range: 5432
   Source: Custom
   Source value: sg-0a1b2c3d4e5f6g7h8  (paste your EC2 security group ID)
   Description: Allow EC2 to connect to RDS
   ```
7. Click **"Save rules"**

#### Option B: Using CIDR (Alternative)

If the security group method doesn't work, use the EC2 private IP:

1. Get your EC2 **Private IP**:
   - Go to EC2 Console → Instances
   - Select your instance
   - Copy **Private IPv4 address** (e.g., `172.31.45.67`)

2. Add inbound rule:
   ```
   Type: PostgreSQL
   Protocol: TCP
   Port range: 5432
   Source: Custom
   Source value: 172.31.45.67/32  (your EC2 private IP with /32)
   Description: Allow specific EC2 instance
   ```

---

### Step 4: Verify the Rule Was Added

1. Go to **RDS Console** → **Databases**
2. Click your database name
3. Click **"Connectivity & security"** tab
4. Under **"Security"**, click the security group link
5. Check **"Inbound rules"** tab
6. You should see:
   ```
   Type        Protocol  Port  Source
   PostgreSQL  TCP       5432  sg-xxxxxxxxx (or IP address)
   ```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Security group not found"

**Problem:** The dropdown doesn't show your EC2 security group.

**Fix:**
1. Make sure both security groups are in the **same VPC**
2. Check VPC:
   - EC2 Console → Security Groups → Select group → Check "VPC ID"
   - Both should have the same VPC ID

**If different VPCs:**
- Recreate the RDS security group in the same VPC as EC2
- Or use CIDR/IP address instead of security group reference

---

### Issue 2: "Cannot select security group from dropdown"

**Problem:** The security group doesn't appear in the dropdown.

**Fix:** Use the Security Group ID directly:
1. Copy the EC2 security group ID: `sg-0123456789abcdef`
2. In the Source field, type or paste the ID directly
3. It should auto-complete and show the group name

---

### Issue 3: "Rule added but connection still fails"

**Problem:** Rule is there but EC2 can't connect to RDS.

**Checklist:**
- [ ] RDS is in "Available" state (not "Creating" or "Modifying")
- [ ] RDS endpoint is correct in your `.env` file
- [ ] RDS port is 5432
- [ ] Database name, username, password are correct
- [ ] EC2 instance is running
- [ ] EC2 is in the same VPC as RDS

**Test connection from EC2:**
```bash
# SSH into your EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install PostgreSQL client
sudo yum install postgresql -y

# Test connection
psql -h your-rds-endpoint.rds.amazonaws.com -U postgres -d recruitment_db

# If it asks for password, that's good! Enter your RDS password.
# If it times out, security group is still blocking.
```

---

### Issue 4: "Access Denied" or "Permission Error"

**Problem:** You can't edit the security group.

**Fix:**
1. Check your AWS IAM permissions
2. You need these permissions:
   - `ec2:AuthorizeSecurityGroupIngress`
   - `ec2:DescribeSecurityGroups`
   - `ec2:ModifySecurityGroupRules`

**Ask your AWS admin to grant these permissions.**

---

## 📋 Complete Step-by-Step (Visual Guide)

### Step 1: Find EC2 Security Group ID
```
AWS Console → EC2 → Security Groups
→ Search: "recruitment-sg"
→ Click on it
→ Copy "Security group ID": sg-xxxxxxxxx
```

### Step 2: Edit RDS Security Group
```
AWS Console → EC2 → Security Groups
→ Search: "recruitment-rds-sg"
→ Click on it
→ Click "Inbound rules" tab
→ Click "Edit inbound rules" button
```

### Step 3: Add Rule
```
Click "Add rule"
Type: PostgreSQL (auto-fills port 5432)
Source: Custom
In the search box, paste: sg-xxxxxxxxx (your EC2 SG ID)
Description: "Allow EC2 to connect"
Click "Save rules"
```

### Step 4: Verify
```
You should see:
┌──────────────┬──────────┬──────┬─────────────────┬─────────────────┐
│ Type         │ Protocol │ Port │ Source          │ Description     │
├──────────────┼──────────┼──────┼─────────────────┼─────────────────┤
│ PostgreSQL   │ TCP      │ 5432 │ sg-xxxxxxxxx    │ Allow EC2       │
└──────────────┴──────────┴──────┴─────────────────┴─────────────────┘
```

---

## 🔍 Debugging Commands

### Check if port 5432 is reachable from EC2:

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Test if port is open (should connect or ask for password)
telnet your-rds-endpoint.rds.amazonaws.com 5432

# Or use nc (netcat)
nc -zv your-rds-endpoint.rds.amazonaws.com 5432

# If it says "Connection refused" or times out → Security group issue
# If it connects → Security group is OK, check credentials
```

### Check security group from AWS CLI:

```bash
# List all security groups
aws ec2 describe-security-groups --group-names recruitment-rds-sg

# Check inbound rules
aws ec2 describe-security-groups \
  --group-names recruitment-rds-sg \
  --query 'SecurityGroups[0].IpPermissions'
```

---

## 🎯 Quick Fix Checklist

Try these in order:

1. **[ ] Verify both security groups exist**
   - EC2 Console → Security Groups
   - Look for `recruitment-sg` and `recruitment-rds-sg`

2. **[ ] Check they're in the same VPC**
   - Both should show the same VPC ID

3. **[ ] Get EC2 security group ID**
   - Click on `recruitment-sg`
   - Copy the ID (sg-xxxxxxxxx)

4. **[ ] Add inbound rule to RDS security group**
   - Select `recruitment-rds-sg`
   - Edit inbound rules
   - Add PostgreSQL rule with EC2 SG ID as source

5. **[ ] Wait 30 seconds**
   - Security group changes take a few seconds to apply

6. **[ ] Test connection from EC2**
   - SSH into EC2
   - Try: `telnet rds-endpoint 5432`

---

## 🆘 Still Not Working?

### Alternative: Use Public Access (Temporary Testing Only)

**⚠️ WARNING: Only for testing! Not secure for production!**

1. Go to RDS Console → Your database
2. Click "Modify"
3. Under "Connectivity":
   - Public access: Yes
4. Click "Continue" → "Modify DB instance"
5. Wait for modification to complete
6. Add inbound rule to RDS security group:
   ```
   Type: PostgreSQL
   Port: 5432
   Source: My IP (or 0.0.0.0/0 for anywhere - very insecure!)
   ```
7. Test connection from your local machine

**After testing, change back to:**
- Public access: No
- Source: EC2 security group only

---

## 📞 Need More Help?

### Provide these details:

1. **EC2 Security Group ID:**
   ```
   sg-xxxxxxxxx
   ```

2. **RDS Security Group ID:**
   ```
   sg-yyyyyyyyy
   ```

3. **VPC IDs:**
   ```
   EC2 VPC: vpc-xxxxxxxxx
   RDS VPC: vpc-yyyyyyyyy
   ```

4. **Current inbound rules on RDS security group:**
   ```
   (Screenshot or copy-paste the rules)
   ```

5. **Error message when trying to connect:**
   ```
   (Exact error from terminal or application)
   ```

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Inbound rule shows in RDS security group
2. ✅ `telnet rds-endpoint 5432` connects from EC2
3. ✅ `psql -h rds-endpoint -U postgres` asks for password
4. ✅ Your application can connect to database

---

## 📚 Additional Resources

- [AWS RDS Security Groups](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.RDSSecurityGroups.html)
- [VPC Security Groups](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html)
- [Troubleshooting RDS Connections](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_Troubleshooting.html#CHAP_Troubleshooting.Connecting)

---

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")
