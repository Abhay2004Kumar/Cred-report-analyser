#!/bin/bash
set -e

echo "🚀 CreditSea Backend - Render Deployment Script"

# Ensure we're using npm instead of yarn
echo "📦 Using npm for package management..."

# Remove any yarn.lock if it exists
if [ -f "yarn.lock" ]; then
    echo "🧹 Removing yarn.lock to prevent conflicts..."
    rm yarn.lock
fi

# Install dependencies using npm
echo "📥 Installing dependencies with npm..."
npm ci --production=false

# Build the TypeScript project
echo "🏗️ Building TypeScript project..."
npm run build

# Verify the build
echo "✅ Verifying build output..."
if [ -f "dist/server.js" ]; then
    echo "✅ server.js found in dist directory"
    ls -la dist/
else
    echo "❌ Build failed - server.js not found"
    exit 1
fi

echo "🎉 Build completed successfully!"
echo "🚀 Starting server..."
exec npm start