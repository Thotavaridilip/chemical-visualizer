#!/usr/bin/env bash
# Render build script for Django backend

set -o errexit

# Build Frontend
echo "Building Frontend..."
# Navigate to frontend directory (relative to this script's location in repo, or assuming cwd is root, wait)
# Render "Root Directory" setting is "djangobackend/backend".
# So when build.sh runs, CWD is "djangobackend/backend".
# So ../frontend is correct.
cd ../frontend
npm install
npm run build
cd ../backend

pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate
