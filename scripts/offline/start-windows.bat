@echo off
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:4180/"
  py -3 -m http.server 4180
  exit /b
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:4180/"
  python -m http.server 4180
  exit /b
)

echo Python 3 is required to start the offline presentation.
pause
