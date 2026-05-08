#!/bin/bash

# Command Center - Auto Installation Script
# This script sets up the entire application

echo "🚀 Command Center - Auto Installation Starting..."
echo "=================================================="

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✓ Docker found"
echo "✓ Docker Compose found"

# Create .env files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env..."
    cp backend/.env.example backend/.env
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend/.env..."
    cp frontend/.env.example frontend/.env
fi

# Build Docker images
echo ""
echo "🔨 Building Docker images..."
docker compose build

# Start services
echo ""
echo "🚀 Starting services..."
docker compose up -d

# Wait for database to be ready
echo ""
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
docker exec commandcenter-api npm run prisma:generate
docker exec commandcenter-api npm run prisma:migrate

# Seed database
echo "🌱 Seeding database with test data..."
docker exec commandcenter-api npm run prisma:seed

echo ""
echo "✅ Installation Complete!"
echo ""
echo "📍 Access your application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend: http://localhost:3000"
echo "   API Docs: http://localhost:3000/api/docs"
echo ""
echo "🔐 Test Credentials:"
echo "   Email: general@command.mil"
echo "   Password: password123"
echo ""
echo "📝 Logs: docker compose logs -f"
echo "🛑 Stop: docker compose down"
echo ""
