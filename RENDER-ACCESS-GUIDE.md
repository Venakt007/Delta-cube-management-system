# How to Access Your Website on Render

## 🌐 Finding Your Render URL

### Step 1: Get Your Render URL

1. **Go to Render Dashboard:**
   ```
   https://dashboard.render.com
   ```

2. **Click on your service:**
   - Look for: `recruitment-app` (or your service name)

3. **Find your URL:**
   - At the top of the page, you'll see your URL
   - It looks like: `https://recruitment-app-xxxx.onrender.com`
   - Or: `https://your-custom-domain.com` (if you set up a custom domain)

4. **Copy the URL**

---

## 🔐 Accessing the Login Page

### Your Application URLs:

Once you have your Render URL (e.g., `https://recruitment-app-xxxx.onrender.com`), you can access:

#### 1. Landing Page (Public):
```
https://recruitment-app-xxxx.onrender.com/landing.html
```

#### 2. Application Form (Public):
```
https://recruitment-app-xxxx.onrender.com/apply.html
```

#### 3. Login Page (Staff Only):
```
https://recruitment-app-xxxx.onrender.com/login
```

#### 4. Main App (Redirects to login if not logged in):
```
https://recruitment-app-xxxx.onrender.com/
```

---

## 👤 Login Credentials

### If You Haven't Created Users Yet:

You need to create users first! Here's how:

#### Option 1: Via Render Shell (Recommended)

1. **Open Render Shell:**
   - Render Dashboard → Your Service → Shell

2. **Create Super Admin:**
   ```bash
   node create-super-admin-auto.js
   ```
   
   This will create:
   ```
   Email: superadmin@example.com
   Password: SuperAdmin123!
   ```

3. **Or create custom user:**
   ```bash
   node manage-users.js
   ```

#### Option 2: Via Database

1. **Connect to database:**
   ```bash
   psql $DATABASE_URL
   ```

2. **Check if users exist:**
   ```sql
   SELECT id, email, name, role FROM users;
   ```

3. **If no users, exit and run:**
   ```bash
   \q
   node create-super-admin-auto.js
   ```

---

## 🎯 Complete Access Flow

### Step-by-Step:

1. **Get your Render URL:**
   - Example: `https://recruitment-app-abc123.onrender.com`

2. **Go to login page:**
   ```
   https://recruitment-app-abc123.onrender.com/login
   ```

3. **Login with credentials:**
   - **Super Admin:**
     - Email: `superadmin@example.com`
     - Password: `SuperAdmin123!`
   
   - **Or your custom credentials** (if you created them)

4. **After login, you'll be redirected to:**
   - Super Admin → `/super-admin`
   - Admin → `/admin`
   - Recruiter → `/recruiter`

---

## 🔍 Finding Your Exact Render URL

### Method 1: From Dashboard

1. Login to Render
2. Click your service
3. Look at the top - you'll see:
   ```
   https://recruitment-app-xxxx.onrender.com
   ```

### Method 2: From Deployment Logs

1. Render Dashboard → Your Service
2. Click "Logs" tab
3. Look for:
   ```
   ==> Your service is live 🎉
   https://recruitment-app-xxxx.onrender.com
   ```

### Method 3: From Events

1. Render Dashboard → Your Service
2. Click "Events" tab
3. Look for "Deploy live" event
4. URL will be shown

---

## 📱 Quick Access Links

Replace `YOUR-RENDER-URL` with your actual URL:

### Public Pages:
- **Landing:** `YOUR-RENDER-URL/landing.html`
- **Apply:** `YOUR-RENDER-URL/apply.html`

### Staff Pages:
- **Login:** `YOUR-RENDER-URL/login`
- **Super Admin:** `YOUR-RENDER-URL/super-admin`
- **Admin:** `YOUR-RENDER-URL/admin`
- **Recruiter:** `YOUR-RENDER-URL/recruiter`

---

## 🐛 Troubleshooting

### Issue: "Cannot GET /"

**Cause:** React app not built properly

**Fix:**
1. Check Render build logs
2. Make sure build command ran:
   ```
   npm install && cd client && npm install && npm run build
   ```
3. Redeploy if needed

### Issue: "Application Error"

**Cause:** Server not starting

**Fix:**
1. Check Render logs for errors
2. Common issues:
   - Database connection failed
   - Missing environment variables
   - Port configuration issue

### Issue: Login page shows but can't login

**Cause:** No users in database

**Fix:**
1. Open Render Shell
2. Run: `node create-super-admin-auto.js`
3. Try login again

### Issue: "This site can't be reached"

**Cause:** Service is sleeping (free tier) or not deployed

**Fix:**
1. Wait 30-60 seconds (free tier services sleep after inactivity)
2. Check service status in Render Dashboard
3. If "Suspended", click "Resume"

---

## ⚡ Quick Setup Checklist

- [ ] Service is deployed on Render
- [ ] Build completed successfully
- [ ] Service status is "Live"
- [ ] Database is connected
- [ ] Environment variables are set
- [ ] Users are created in database
- [ ] Can access login page
- [ ] Can login successfully

---

## 🎯 Example URLs

If your Render URL is: `https://recruitment-app-abc123.onrender.com`

Then your pages are:

```
Landing:        https://recruitment-app-abc123.onrender.com/landing.html
Apply Form:     https://recruitment-app-abc123.onrender.com/apply.html
Login:          https://recruitment-app-abc123.onrender.com/login
Super Admin:    https://recruitment-app-abc123.onrender.com/super-admin
Admin:          https://recruitment-app-abc123.onrender.com/admin
Recruiter:      https://recruitment-app-abc123.onrender.com/recruiter
```

---

## 📋 First Time Setup

### If this is your first deployment:

1. **Wait for deployment to complete:**
   - Render Dashboard → Events
   - Wait for "Deploy succeeded"

2. **Open Render Shell:**
   - Click "Shell" tab

3. **Setup database:**
   ```bash
   node setup-database.js
   ```

4. **Run migrations:**
   ```bash
   node migrations/add-super-admin-role.js
   node migrations/add-edited-resume-field.js
   ```

5. **Create super admin:**
   ```bash
   node create-super-admin-auto.js
   ```

6. **Note the credentials shown**

7. **Go to login page:**
   ```
   https://your-render-url.onrender.com/login
   ```

8. **Login with the credentials**

---

## 🔗 Useful Commands in Render Shell

### Check if users exist:
```bash
psql $DATABASE_URL -c "SELECT email, role FROM users;"
```

### Create super admin:
```bash
node create-super-admin-auto.js
```

### Check database tables:
```bash
psql $DATABASE_URL -c "\dt"
```

### View application logs:
```bash
# In Render Dashboard → Logs tab
# Or check recent logs in Shell:
tail -f /var/log/render.log
```

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ You can access: `https://your-url.onrender.com/login`
2. ✅ Login page loads without errors
3. ✅ You can login with credentials
4. ✅ After login, you're redirected to dashboard
5. ✅ Dashboard loads with all features

---

## 📞 Need Your Render URL?

**Quick way to find it:**

1. Go to: https://dashboard.render.com
2. Click your service name
3. Look at the top of the page
4. Copy the URL that looks like: `https://xxxxx.onrender.com`

**That's your website URL!**

Add `/login` to access the login page:
```
https://xxxxx.onrender.com/login
```

---

## 💡 Pro Tips

1. **Bookmark your login page** for quick access
2. **Free tier services sleep** after 15 minutes of inactivity
   - First request after sleep takes 30-60 seconds
3. **Custom domain** can be added in Render Dashboard → Settings
4. **HTTPS is automatic** on Render (no setup needed)

---

## 🆘 Still Can't Access?

**Share this info for help:**

1. Your Render service URL
2. What you see when you visit the URL
3. Any error messages
4. Screenshot of Render Dashboard showing service status

**Most common fix:** Just wait 60 seconds if service was sleeping!

---

**Your login page is at:** `https://your-render-url.onrender.com/login` 🚀
