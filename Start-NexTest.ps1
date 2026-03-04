# NexTest One-Click Launcher
Write-Host "Starting NexTest Exam Simulator..." -ForegroundColor Cyan

# Navigate to the App directory
cd App

# Check if node_modules exists, if not, install dependencies
if (!(Test-Path "node_modules")) {
    Write-Host "Dependencies not found. Installing..." -ForegroundColor Yellow
    npm install --silent
}

# Start the dev server and open the browser automatically
# Vite uses the --open flag to launch the browser
npm run dev -- --open
