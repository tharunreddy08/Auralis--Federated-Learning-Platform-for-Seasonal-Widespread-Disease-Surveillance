#!/bin/bash

echo "🚀 Starting Auralis Backend..."
echo ""

cd backend

if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

echo "🔧 Activating virtual environment..."
source venv/bin/activate

echo "📦 Installing dependencies..."
pip install -q -r requirements.txt

echo "🌱 Checking if database needs seeding..."
read -p "Do you want to seed the database with dummy data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🌱 Seeding database..."
    python seed_data.py
fi

echo ""
echo "✅ Backend is starting at http://localhost:8000"
echo "📚 API docs available at http://localhost:8000/docs"
echo ""

python main.py
