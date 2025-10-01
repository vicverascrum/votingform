#!/bin/bash

# Sprint Prioritization Form - Start Script
# Starts the development server and opens the browser

echo "🚀 Starting Sprint Prioritization Form..."

# Kill any existing servers on common ports
echo "🔄 Cleaning up existing servers..."
pkill -f "python3.*http.server" 2>/dev/null || true

# Find available port
PORT=8080
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
    PORT=$((PORT + 1))
done

echo "📡 Starting server on port $PORT..."

# Start server in background
cd "$(dirname "$0")"
python3 -m http.server $PORT > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Check if server started successfully
if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200"; then
    echo "✅ Server started successfully!"
    echo "🌐 URL: http://localhost:$PORT"
    echo "📊 Status: Form is OPEN and ready for submissions"
    echo "🛑 To stop: kill $SERVER_PID"
    
    # Open browser
    if command -v open >/dev/null 2>&1; then
        echo "🔗 Opening browser..."
        open http://localhost:$PORT
    elif command -v xdg-open >/dev/null 2>&1; then
        echo "🔗 Opening browser..."
        xdg-open http://localhost:$PORT
    else
        echo "📝 Please open http://localhost:$PORT in your browser"
    fi
    
    echo ""
    echo "📋 Available endpoints:"
    echo "   • Main Form: http://localhost:$PORT"
    echo "   • AWS Test: http://localhost:$PORT/test-aws-connection.html"
    echo "   • Simple Test: http://localhost:$PORT/test-form.html"
    echo ""
    echo "🔧 Development commands:"
    echo "   • Validate JSON: npm run validate"
    echo "   • Run tests: npm test"
    echo "   • Analyze data: node analyze-data.js"
    
else
    echo "❌ Failed to start server"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
