#!/bin/bash

# Math Farm Deployment Script
echo "🚀 Building Math Farm for production..."

# Build frontend
echo "📦 Building frontend..."
npm run build

# Create deployment package
echo "📁 Creating deployment package..."
mkdir -p deployment-ready
cp -r dist/ deployment-ready/
cp -r server/ deployment-ready/
cp -r shared/ deployment-ready/
cp package.json deployment-ready/
cp package-lock.json deployment-ready/

# Copy environment files if they exist
if [ -f .env ]; then
    cp .env deployment-ready/
fi

if [ -f .env.production ]; then
    cp .env.production deployment-ready/
fi

echo "✅ Deployment package ready in 'deployment-ready/' folder"
echo ""
echo "📋 Next steps:"
echo "1. Copy 'deployment-ready/' folder to your server"
echo "2. Run 'npm install --production' on the server"
echo "3. Start with 'npm start' or 'node server/index.js'"
echo ""
echo "🔧 Optional: Use PM2 for process management:"
echo "   pm2 start server/index.js --name mathfarm"