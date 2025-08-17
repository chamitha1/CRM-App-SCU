@echo off
echo Starting CRM Lead Management System...
echo.

echo Killing any existing processes on ports 5000 and 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F 2>nul

echo.
echo Starting Backend Server (MongoDB + Express API)...
start "CRM Backend" cmd /k "cd /d C:\Users\Thari\Desktop\PPA\CRM-App-SCU\crm-backend && echo Starting backend server... && cmd /c npm run dev"

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server (React App)...
start "CRM Frontend" cmd /k "cd /d C:\Users\Thari\Desktop\PPA\CRM-App-SCU\crm-frontend && echo Starting frontend server... && cmd /c npm start"

echo.
echo ✅ Both servers are starting in separate windows:
echo 🚀 Backend API: http://localhost:5000/api/leads
echo 🌐 Frontend App: http://localhost:3000
echo.
echo 📝 CRUD Operations Available:
echo   ✅ ADD LEAD - Click "Add Lead" button
echo   ✅ UPDATE LEAD - Click edit icon on any lead
echo   ✅ DELETE LEAD - Click delete icon on any lead
echo.
echo ⚠️  Make sure MongoDB is running for database operations!
echo.
echo Press any key to close this launcher...
pause > nul
