# CRM Lead Management System Startup Script
Write-Host "Starting CRM Lead Management System..." -ForegroundColor Green
Write-Host ""

# Kill existing processes on ports 5000 and 3000
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
try {
    $processes5000 = netstat -ano | Select-String ":5000" | ForEach-Object { ($_ -split '\s+')[4] }
    $processes3000 = netstat -ano | Select-String ":3000" | ForEach-Object { ($_ -split '\s+')[4] }
    
    foreach ($pid in $processes5000) {
        if ($pid -and $pid -ne "0") {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
    
    foreach ($pid in $processes3000) {
        if ($pid -and $pid -ne "0") {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
} catch {
    Write-Host "No existing processes to clean up" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Starting Backend Server (MongoDB + Express API)..." -ForegroundColor Cyan

# Start backend in new window
$backendPath = "C:\Users\Thari\Desktop\PPA\CRM-App-SCU\crm-backend"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$backendPath`" && echo Starting backend server... && cmd /c `"npm run dev`"" -WindowStyle Normal

Write-Host "Waiting 5 seconds for backend to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host "Starting Frontend Server (React App)..." -ForegroundColor Cyan

# Start frontend in new window  
$frontendPath = "C:\Users\Thari\Desktop\PPA\CRM-App-SCU\crm-frontend"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$frontendPath`" && echo Starting frontend server... && cmd /c `"npm start`"" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Both servers are starting in separate windows:" -ForegroundColor Green
Write-Host "🚀 Backend API: http://localhost:5000/api/leads" -ForegroundColor Blue
Write-Host "🌐 Frontend App: http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "📝 CRUD Operations Available:" -ForegroundColor Yellow
Write-Host "  ✅ ADD LEAD - Click 'Add Lead' button" -ForegroundColor White
Write-Host "  ✅ UPDATE LEAD - Click edit icon on any lead" -ForegroundColor White  
Write-Host "  ✅ DELETE LEAD - Click delete icon on any lead" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Make sure MongoDB is running for database operations!" -ForegroundColor Red
Write-Host ""
Write-Host "Press any key to close this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
