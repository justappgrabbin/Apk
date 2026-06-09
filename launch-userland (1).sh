#!/bin/bash
# MorphOS MRNN — UserLAnd/Termux Launcher
# Starts local server and serves the MRNN engine

echo "⚡ MorphOS MRNN Launcher"
echo "========================"

# Check if we're in Termux or UserLAnd
if [ -d "/data/data/com.termux" ]; then
    echo "📱 Termux detected"
    PKG_MANAGER="pkg"
else
    echo "🐧 UserLAnd detected"
    PKG_MANAGER="apt-get"
fi

# Install dependencies if needed
if ! command -v python3 &> /dev/null; then
    echo "📦 Installing Python3..."
    $PKG_MANAGER update -y
    $PKG_MANAGER install python3 -y
fi

# Create MorphOS directory
MORPHOS_DIR="$HOME/morphos-mrnn"
mkdir -p "$MORPHOS_DIR"

# Copy index.html if it exists nearby
if [ -f "index.html" ]; then
    cp index.html "$MORPHOS_DIR/"
    echo "📄 Copied index.html to $MORPHOS_DIR"
fi

# Start Python HTTP server
cd "$MORPHOS_DIR"
echo "🌐 Starting server on http://localhost:8080"
echo "📱 Open your browser and navigate to the address above"
echo "🛑 Press Ctrl+C to stop"
echo ""

python3 -m http.server 8080
