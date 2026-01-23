@echo off
title Agrobot System Server (Flask)
echo ========================================================
echo   STARTING AGROBOT DASHBOARD SERVER (Flask)
echo ========================================================
echo.
echo [1] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo     ERROR: Python is not installed or not in PATH!
    echo     Please install Python 3.8+ from python.org
    pause
    exit /b 1
)
echo     - Python found

echo.
echo [2] Checking for Python dependencies...
pip show flask >nul 2>&1
if %errorlevel% neq 0 (
    echo     - Installing Flask dependencies...
    pip install flask flask-socketio flask-cors python-socketio
) else (
    echo     - Dependencies found
)

echo.
echo [3] Starting Flask Server...
echo     - Server will run at: http://localhost:3002
echo.
echo     Press Ctrl+C to stop the server
echo.
start "" "http://localhost:3002"
python app.py
pause
