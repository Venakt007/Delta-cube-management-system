@echo off
echo ========================================
echo Connecting to recruitment_db database
echo ========================================
echo.
echo Database: recruitment_db
echo User: postgres
echo Password: 123456
echo.
echo After connecting, try these commands:
echo   \dt              - List tables
echo   \d applications  - Show applications table
echo   SELECT * FROM users;
echo.
echo ========================================
echo.

psql -U postgres -d recruitment_db

pause
