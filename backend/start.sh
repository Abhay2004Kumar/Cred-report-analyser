#!/bin/bash

# Render deployment startup script for CreditSea Backend
echo "🚀 Starting CreditSea Backend Deployment..."
echo "📁 Current directory: $(pwd)"
echo "📋 Node.js version: $(node --version)"
echo "📦 NPM version: $(npm --version)"

echo "📂 Contents of current directory:"
ls -la

echo ""
echo "🔍 Checking TypeScript installation..."
if command -v tsc &> /dev/null; then
    echo "✅ TypeScript compiler found: $(tsc --version)"
else
    echo "❌ TypeScript compiler not found, installing..."
    npm install -g typescript
fi

echo ""
echo "🏗️  Force building TypeScript files..."
echo "📁 Creating dist directory..."
mkdir -p dist

echo "🔧 Running TypeScript compilation..."
npm run build

echo ""
echo "📂 Contents after build:"
ls -la

echo "🔍 Checking dist directory:"
if [ -d "dist" ]; then
    echo "✅ dist directory exists"
    echo "📋 Contents of dist directory:"
    ls -la dist/
    
    if [ -f "dist/server.js" ]; then
        echo "✅ server.js found in dist directory"
        echo "🚀 Starting server..."
        exec node dist/server.js
    else
        echo "❌ server.js NOT found in dist directory"
        echo "🛠️  Checking TypeScript compilation errors..."
        tsc --noEmit
        exit 1
    fi
else
    echo "❌ dist directory was not created"
    echo "🛠️  Running TypeScript compilation with verbose output..."
    tsc --verbose
    exit 1
fi