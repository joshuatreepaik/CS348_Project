#!/usr/bin/env bash
set -o errexit

# Step 1: Build React frontend
echo "🔧 Building React frontend..."
cd ../my-react-app
npm install
npm run build

# Step 2: Copy React build output into Django static folder
echo "📁 Copying build into backend/frontend/"
rm -rf ../backend/frontend
mkdir -p ../backend/frontend
cp -r build/* ../backend/frontend/

# Step 3: Back to backend folder
cd ../backend

# Step 4: Collect static files (Django must be installed by now)
echo "⚙️ Running Django collectstatic..."
python manage.py collectstatic --noinput
