@echo off
echo Starting Auralis Backend...
echo.

cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -q -r requirements.txt

echo.
set /p seed="Do you want to seed the database with dummy data? (y/n): "
if /i "%seed%"=="y" (
    echo Seeding database...
    python seed_data.py
)

echo.
echo Backend is starting at http://localhost:8000
echo API docs available at http://localhost:8000/docs
echo.

python main.py
