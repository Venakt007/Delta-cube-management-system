@echo off
echo ========================================
echo Super Admin Setup Script
echo ========================================
echo.

echo Step 1: Running database migration...
node migrations/add-super-admin-role.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Migration failed! Please check the error above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Step 2: Creating Super Admin User
echo ========================================
echo.

node create-super-admin.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo You can now:
echo 1. Start the server: npm start
echo 2. Login at /login with your super admin credentials
echo 3. Access super admin dashboard at /super-admin
echo.
pause
