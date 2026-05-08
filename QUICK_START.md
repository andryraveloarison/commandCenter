# 🚀 Quick Start Guide - Command Center

## Prerequisites
- Docker & Docker Compose installed
- Git installed
- Terminal/Console access

## Installation Methods

### Method 1: Automated Installation (Recommended)

```bash
# Navigate to project directory
cd commandCenter

# Run installation script
chmod +x install.sh
./install.sh
```

### Method 2: Manual Installation

```bash
# Navigate to project directory
cd commandCenter

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Build and start services
docker compose up -d

# Wait for database (10 seconds)
sleep 10

# Generate Prisma Client and run migrations
docker exec commandcenter-api npm run prisma:generate
docker exec commandcenter-api npm run prisma:migrate

# Seed test data (optional)
docker exec commandcenter-api npm run prisma:seed
```

### Method 3: Local Development

#### Backend
```bash
cd backend
npm install
cp .env.example .env

# Run Prisma migrations
npm run prisma:generate
npm run prisma:migrate

# Start development server
npm run start:dev
```

#### Frontend (in another terminal)
```bash
cd frontend
npm install
cp .env.example .env

# Start development server
npm run dev
```

## Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Web application |
| Backend API | http://localhost:3000/api | REST API |
| API Docs | http://localhost:3000/api/docs | Swagger documentation |
| Database | localhost:5432 | PostgreSQL (local dev only) |

## Default Test Credentials

```
Email: general@command.mil
Password: password123
```

Other test accounts available:
- colonel@command.mil (Colonel role)
- soldier1@command.mil (Developer role)
- soldier2@command.mil (Developer role)
- soldier3@command.mil (Developer role)

## Common Commands

### Docker Operations
```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Restart services
docker compose restart

# Rebuild images
docker compose build --no-cache
```

### Database Operations
```bash
# Run Prisma Studio (GUI for database)
docker exec commandcenter-api npm run prisma:studio

# Create new migration
docker exec commandcenter-api npm run prisma:migrate

# Reset database
docker exec commandcenter-api npx prisma migrate reset
```

### Backend Development
```bash
# Access backend container shell
docker exec -it commandcenter-api /bin/sh

# View API logs
docker compose logs -f backend
```

### Frontend Development
```bash
# Access frontend container shell
docker exec -it commandcenter-web /bin/sh

# View frontend logs
docker compose logs -f frontend
```

## Troubleshooting

### Port Already in Use
If ports 5173, 3000, or 5432 are already in use:
1. Update ports in `docker-compose.yml`
2. Update API URL in frontend `.env`

### Database Connection Error
```bash
# Check database logs
docker compose logs postgres

# Rebuild database
docker compose down -v  # Remove volumes
docker compose up -d
docker exec commandcenter-api npm run prisma:migrate
```

### Services Not Starting
```bash
# Check system resources
docker stats

# Clean up Docker
docker system prune -a

# Rebuild everything
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

## Development Workflow

### Making Backend Changes
1. Edit files in `backend/src/`
2. Changes auto-reload with `npm run start:dev`
3. Check API at http://localhost:3000/api/docs

### Making Frontend Changes
1. Edit files in `frontend/src/`
2. Changes auto-reload with `npm run dev`
3. Refresh browser to see changes

### Adding Database Schema
1. Edit `backend/prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Follow prompts to name migration

## Production Build

```bash
# Build for production
docker compose build --compress

# Start production services
docker compose -f docker-compose.yml up -d

# Update environment variables
# Edit backend/.env and frontend/.env with production values
```

## Project Structure Overview

```
commandCenter/
├── frontend/          # React application
├── backend/           # NestJS API
├── docker-compose.yml # Docker orchestration
├── install.sh         # Auto-installation script
└── README.md          # Full documentation
```

## Getting Help

Check the main [README.md](./README.md) for:
- Full feature documentation
- API endpoint reference
- Database schema details
- Architecture overview

## Next Steps

1. ✅ Complete the installation
2. 🔐 Login with test credentials
3. 📊 Create your first project
4. ✓ Add tasks and team members
5. 🎯 Track progress in War Room

---

**Happy commanding! 🚀**
