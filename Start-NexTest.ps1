# NexTest One-Click Launcher
Write-Host "Starting NexTest Exam Simulator..." -ForegroundColor Cyan

# Robust Navigation: Only cd if not already in App
if ($PWD.Path -notlike "*\App") {
    if (Test-Path "App") {
        cd App
    } else {
        Write-Host "[!] Warning: Root directory mismatch. Ensure you are in the NexTest project root." -ForegroundColor Red
    }
}

# Check if node_modules exists, if not, install dependencies
if (!(Test-Path "node_modules")) {
    Write-Host "[*] Dependencies not found. Installing..." -ForegroundColor Yellow
    npm install --silent
}

# Start the dev server and open the browser automatically
# Vite uses the --open flag to launch the browser
Write-Host "[*] Launching Neural Practice Terminal..." -ForegroundColor Green
npm run dev -- --open
