#!/usr/bin/env bash
set -o errexit  # Stop on error

echo "🔧 Installing backend dependencies..."
pip install -r requirements.txt

echo "🛠️ Building React frontend..."
cd ../my-react-app
npm install
npm run build

echo "📁 Moving React build to Django static frontend folder..."
rm -rf ../backend/frontend
mkdir -p ../backend/frontend
cp -r build/* ../backend/frontend/

echo "⚙️ Collecting static files..."
cd ../backend
python manage.py collectstatic --noinput

echo "✅ Build completed."

