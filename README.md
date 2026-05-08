# 🎖️ COMMAND CENTER - Military-Themed Project Management System

A full-stack, military-themed project management application with professional tactical design, built with modern technologies.

## 🚀 Features

### Core Features
- **User Authentication**: JWT-based authentication with role-based access control
- **Project Management**: Create, manage, and track projects with real-time progress
- **Task Management**: Assign tasks, track progress, add comments, and attachments
- **Team Collaboration**: Manage project teams and user assignments
- **Progress Tracking**: Automatic progress calculations from task completion
- **History Tracking**: Complete history of progress changes with timestamps
- **Real-time Updates**: Socket.io for live notifications and updates
- **Statistics & Analytics**: Comprehensive dashboards with metrics and charts

### Design Features
- **Military Theme**: War-room style interface with tactical design
- **Dark Mode**: Night-vision friendly interface
- **Responsive Design**: Works seamlessly on desktop and tablets
- **Animated Radar**: Real-time tactical radar visualization
- **CRT Effects**: Authentic terminal-style screen effects
- **Glow Effects**: Neon-style green and radar glow effects
- **Military Typography**: Custom fonts (Orbitron, Rajdhani, Share Tech Mono)

## 💻 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Redux Toolkit** for state management
- **React Query** for data fetching
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Socket.io** for real-time updates
- **Axios** for HTTP requests

### Backend
- **NestJS** for scalable server architecture
- **Prisma ORM** for database management
- **PostgreSQL** for data storage
- **JWT** for authentication
- **Socket.io** for WebSocket connections
- **Swagger** for API documentation
- **Class Validator** for input validation

### Infrastructure
- **Docker** for containerization
- **Docker Compose** for orchestration
- **PostgreSQL 16 Alpine** for database

## 📦 Installation

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- npm or yarn

### Quick Start with Docker

1. **Clone and enter the project**:
   ```bash
   cd commandCenter
   ```

2. **Build and start services**:
   ```bash
   docker-compose up -d
   ```

3. **Run migrations** (in a new terminal):
   ```bash
   docker exec commandcenter-api npm run prisma:migrate
   ```

4. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api
   - API Docs: http://localhost:3000/api/docs
   - Database: localhost:5432

### Local Development

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run prisma:generate
   npm run prisma:migrate
   npm run start:dev
   ```

2. **Frontend Setup** (in another terminal):
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

## 📋 Database Schema

### Core Models
- **User**: Authentication and user profiles
- **Project**: Project management with progress tracking
- **ProjectTeam**: Team membership for projects
- **Task**: Individual task management
- **ProjectHistory**: Progress history tracking
- **Comment**: Task and project comments
- **Attachment**: File attachments for tasks
- **Notification**: User notifications

## 🎮 User Roles

1. **GENERAL** (Admin)
   - Full system access
   - User management
   - All project operations

2. **COLONEL** (Project Manager)
   - Create and manage projects
   - Team management
   - Progress tracking

3. **SOLDAT** (Developer)
   - Task assignment
   - Progress updates
   - Collaboration

## 📍 Main Pages

- `/login` - Authentication
- `/dashboard` - Main dashboard with statistics
- `/projects` - Projects list and management
- `/projects/:id` - Project details and team
- `/projects/:id/history` - Project progress history
- `/tasks` - Task management
- `/users` - User/Soldier management
- `/war-room` - Command center tactical display
- `/settings` - Application settings

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `PATCH /api/users/:id` - Update user
- `GET /api/users/:id/statistics` - User statistics

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project detail
- `PATCH /api/projects/:id` - Update project
- `PATCH /api/projects/:id/progress` - Update progress
- `GET /api/projects/:id/history` - Get history
- `GET /api/projects/:id/statistics` - Get statistics
- `POST /api/projects/:id/team` - Add team member
- `DELETE /api/projects/:id/team/:userId` - Remove team member

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task detail
- `PATCH /api/tasks/:id` - Update task
- `GET /api/tasks/user/:userId` - Get user tasks
- `POST /api/tasks/:id/comments` - Add comment
- `GET /api/tasks/:id/comments` - Get comments

### Notifications
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

## 🎨 Styling & Theme

The application uses a military-inspired color palette:
- **Primary Green**: `#4ade80` (Tactical operations)
- **Military Dark**: `#1a1a1a` (War room background)
- **Radar Yellow**: `#fbbf24` (Active targets)
- **Alert Red**: `#ef4444` (Critical status)
- **Metal Gray**: `#4a5568` (Metal panels)

Custom CSS utilities for military UI:
- `.tactical-button` - Glowing green button
- `.military-panel` - Panel with metal effect
- `.holographic-text` - Neon text with glow
- `.console-text` - Console-style text
- `.crt-screen` - CRT scanlines effect

## 📊 Key Features Implementation

### Progress Calculation
Progress is automatically calculated from task completion:
```
Project Progress = Average(Task1_Progress, Task2_Progress, ...)
```

### History Tracking
Every progress change is recorded with:
- Timestamp
- New progression value
- User who made the change
- Optional note/reason

### Real-time Updates
Socket.io enables:
- Live progress updates
- Real-time notifications
- User presence tracking
- Activity feeds

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Input validation with class-validator
- Environment variable configuration
- Role-based access control

## 📈 Performance Optimizations

- Lazy loading with React Router
- Query caching with React Query
- Code splitting with Vite
- Database indexing
- Optimistic updates
- Efficient re-renders

## 🐛 Development

### Start Development Servers
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Linting
```bash
npm run lint
```

### Run Tests
```bash
npm run test
```

## 🚢 Deployment

### Production Docker Build
```bash
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml up -d
```

### Environment Configuration
Update `.env` files with production values:
- Database credentials
- JWT secret (use strong key)
- CORS origins
- API URLs

## 📝 Project Structure

```
commandCenter/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store
│   │   ├── services/        # API services
│   │   ├── styles/          # Global styles
│   │   └── hooks/           # Custom hooks
│   ├── public/              # Static files
│   └── package.json
│
├── backend/                  # NestJS application
│   ├── src/
│   │   ├── auth/            # Authentication module
│   │   ├── users/           # Users module
│   │   ├── projects/        # Projects module
│   │   ├── tasks/           # Tasks module
│   │   ├── notifications/   # Notifications module
│   │   └── common/          # Shared utilities
│   ├── prisma/              # Prisma schema
│   └── package.json
│
├── docker-compose.yml       # Docker orchestration
└── README.md               # This file
```

## 📞 Support

For issues and questions:
1. Check existing issues
2. Create detailed bug reports
3. Include system information
4. Provide reproduction steps

## 📜 License

MIT License - Command Center 2026

## 🎯 Future Enhancements

- [ ] Advanced analytics and reporting
- [ ] AI-powered project recommendations
- [ ] Integration with Git repositories
- [ ] Mobile native apps
- [ ] Advanced permission system
- [ ] Custom workflows
- [ ] API webhooks
- [ ] Data export/import

---

**COMMAND CENTER v0.1.0** - Military Project Management System
*All systems operational. Ready for deployment.*
# commandCenter
