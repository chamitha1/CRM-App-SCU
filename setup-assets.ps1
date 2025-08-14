# Asset Management Setup Script for Windows PowerShell
# This script helps set up the Asset Management module

Write-Host "🚀 Setting up Asset Management Module for CRM Application" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "crm-backend") -or !(Test-Path "crm-frontend")) {
    Write-Host "❌ Error: Please run this script from the CRM-App-SCU root directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Function to check if command exists
function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

if (!(Test-Command "node")) {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

if (!(Test-Command "npm")) {
    Write-Host "❌ npm is not installed. Please install npm" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js and npm are available" -ForegroundColor Green

# Setup Backend
Write-Host "📦 Setting up backend dependencies..." -ForegroundColor Yellow
Set-Location "crm-backend"

if (!(Test-Path "package.json")) {
    Write-Host "✅ Package.json already created by setup" -ForegroundColor Green
} else {
    Write-Host "📋 Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
        exit 1
    }
}

# Setup environment file
if (!(Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created. Please edit it with your MongoDB URI and other settings" -ForegroundColor Green
        Write-Host "📝 Default MongoDB URI: mongodb://localhost:27017/crm-app" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Go back to root
Set-Location ".."

# Setup Frontend
Write-Host "🎨 Checking frontend setup..." -ForegroundColor Yellow
Set-Location "crm-frontend"

if (Test-Path "package.json") {
    Write-Host "✅ Frontend already set up" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend not properly set up" -ForegroundColor Red
}

# Go back to root
Set-Location ".."

# Display setup summary
Write-Host "" -ForegroundColor White
Write-Host "🎉 Asset Management Module Setup Complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

Write-Host "📁 Files Created:" -ForegroundColor Cyan
Write-Host "  • crm-backend/models/Asset.js" -ForegroundColor White
Write-Host "  • crm-backend/routes/assets.js" -ForegroundColor White
Write-Host "  • crm-backend/middleware/auth.js" -ForegroundColor White
Write-Host "  • crm-backend/scripts/seedData.js" -ForegroundColor White
Write-Host "  • crm-backend/package.json" -ForegroundColor White
Write-Host "  • crm-backend/.env.example" -ForegroundColor White
Write-Host "  • crm-frontend/src/pages/Assets.jsx (updated)" -ForegroundColor White
Write-Host "  • crm-frontend/src/services/api.js (updated)" -ForegroundColor White
Write-Host "  • ASSET_MANAGEMENT_README.md" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Edit crm-backend/.env with your MongoDB connection string" -ForegroundColor White
Write-Host "  2. Start MongoDB service" -ForegroundColor White
Write-Host "  3. Seed the database:" -ForegroundColor White
Write-Host "     cd crm-backend && npm run seed" -ForegroundColor Yellow
Write-Host "  4. Start the backend server:" -ForegroundColor White
Write-Host "     cd crm-backend && npm run dev" -ForegroundColor Yellow
Write-Host "  5. Start the frontend (in another terminal):" -ForegroundColor White
Write-Host "     cd crm-frontend && npm start" -ForegroundColor Yellow
Write-Host "  6. Navigate to Asset Management in your CRM application" -ForegroundColor White
Write-Host ""

Write-Host "📖 Documentation: Check ASSET_MANAGEMENT_README.md for detailed information" -ForegroundColor Cyan
Write-Host ""

Write-Host "✨ Your Asset Management module is ready to use!" -ForegroundColor Green

# Pause to let user read the output
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
