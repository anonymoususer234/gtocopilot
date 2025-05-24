#!/bin/bash

# TexasSolver GTO API Startup Script

echo "🃏 Starting TexasSolver GTO API 🃏"
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3 and try again."
    exit 1
fi

# Navigate to backend directory
cd backend

echo "📦 Installing dependencies..."
pip3 install fastapi uvicorn pydantic requests --quiet

echo "🚀 Starting API server..."
echo "The API will be available at: http://localhost:8000"
echo "API documentation at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
python3 main.py 