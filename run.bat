@echo off
echo Starting Urban Breeze AI...
echo.

echo Starting Frontend with CSV data...
start "Urban Breeze AI" cmd /k "npm run dev"

echo.
echo ================================================
echo Urban Breeze AI is starting!
echo.
echo Frontend App: http://localhost:5173
echo.
echo The app will load data from CSV files in public/data/
echo Wait for the window to show: "Local: http://localhost:5173"
echo ================================================
pause