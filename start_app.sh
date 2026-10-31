#!/bin/bash

echo "Starting Urban Breeze AI - Full Stack Application"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "Error: Python is not installed or not in PATH"
    echo "Please install Python from https://python.org/"
    exit 1
fi

# Use python3 if available, otherwise python
PYTHON_CMD="python"
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
fi

echo "Starting Backend Server..."
# Start backend in background
(
    cd backend
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    echo "Starting FastAPI server on http://localhost:8000"
    $PYTHON_CMD main.py
) &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

echo "Starting Frontend Development Server..."
# Start frontend in background
(
    echo "Installing Node.js dependencies..."
    npm install
    echo "Starting React development server on http://localhost:5173"
    npm run dev
) &
FRONTEND_PID=$!

echo ""
echo "================================================"
echo "Urban Breeze AI is starting up!"
echo ""
echo "Backend API: http://localhost:8000"
echo "Frontend App: http://localhost:5173"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "================================================"
echo ""

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep script running and show status
while true; do
    sleep 30
    echo "[$(date '+%H:%M:%S')] Servers are running..."
done