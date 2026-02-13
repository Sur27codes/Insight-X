#!/bin/bash

set -euo pipefail
# start.sh - One-command start for InsightX

# Check for .env, create if missing
if [ ! -f .env ]; then
  echo "⚠️  .env not found, copying from .env.example..."
  cp .env.example .env
fi

# 1. Capture user prompt (default if empty)
USER_PROMPT="${1:-Forecast the next 90 days of revenue}"
echo "🚀 Starting InsightX with prompt: '$USER_PROMPT'"

# 2. Export prompt so Docker Compose sees it
export USER_PROMPT

# 3. Pull & Build
echo "📦 Building local dependencies..."
# Build A2UI Lit renderer (manual fix for broken npm package)
if [ -d "vendor/a2ui/renderers/lit" ]; then
  echo "   Building @a2ui/lit..."
  (cd vendor/a2ui/renderers/lit && npm install && npm run build)
fi

echo "📦 Building services..."
docker-compose build

# 4. Up
echo "🔥 bringing up services..."
docker-compose up -d

# 5. Wait for readiness (simple sleep loop or healthcheck wait could be better, but we let logging show it)
echo "⏳ Waiting for services to normalize..."
sleep 5

echo "✅ InsightX is running!"
echo "--------------------------------------------------------"
echo "👉 Frontend: http://localhost:3000"
echo "👉 Backend API: http://localhost:8000/docs"
echo "👉 MLflow: http://localhost:5000"
echo "👉 MinIO: http://localhost:9001 (user/password: minioadmin)"
echo "--------------------------------------------------------"
echo "To stop: docker-compose down"

# Open the browser
echo "🔍 Opening http://localhost:3000..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:3000"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:3000"
    fi
fi
