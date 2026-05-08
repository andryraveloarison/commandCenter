# 📚 Command Center - API Documentation

Complete API reference for Command Center backend.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.commandcenter.com/api`
- **Swagger UI**: `http://localhost:3000/api/docs`

## Authentication

All endpoints (except login/register) require Bearer token authentication.

```bash
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this format:

```json
{
  "data": { /* response data */ },
  "statusCode": 200,
  "message": "Success"
}
```

## Error Responses

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "BadRequest"
}
```

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Endpoints

### 🔐 Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "nom": "Full Name",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "nom": "Full Name",
    "role": "SOLDAT"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

---

### 👥 Users

#### Get All Users
```http
GET /users
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "nom": "Full Name",
    "photo": "url_to_photo",
    "role": "SOLDAT",
    "statut": "ACTIF",
    "createdAt": "2026-05-07T00:00:00Z",
    "activite": "2026-05-07T12:00:00Z"
  }
]
```

#### Get User by ID
```http
GET /users/:id
Authorization: Bearer <token>
```

#### Update User
```http
PATCH /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nom": "New Name",
  "photo": "new_photo_url",
  "statut": "OCCUPE"
}
```

#### Get User Statistics
```http
GET /users/:id/statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total": 10,
  "completed": 5,
  "inProgress": 3
}
```

---

### 📋 Projects

#### Get All Projects
```http
GET /projects
Authorization: Bearer <token>
```

#### Create Project
```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "nom": "Project Name",
  "description": "Project description",
  "dateDebut": "2026-05-07",
  "dateFin": "2026-05-31",
  "priorite": "HAUTE"
}
```

#### Get Project by ID
```http
GET /projects/:id
Authorization: Bearer <token>
```

#### Update Project
```http
PATCH /projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nom": "Updated Name",
  "statut": "EN_COURS",
  "priorite": "CRITIQUE"
}
```

#### Get Project History
```http
GET /projects/:id/history
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "history_id",
    "projectId": "project_id",
    "progression": 50,
    "note": "Progress update",
    "userId": "user_id",
    "createdAt": "2026-05-07T12:00:00Z",
    "user": { /* user object */ }
  }
]
```

#### Update Project Progress
```http
PATCH /projects/:id/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "progression": 75,
  "note": "Completed development phase"
}
```

#### Get Project Statistics
```http
GET /projects/:id/statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "nom": "Project Name",
  "progression": 75,
  "statut": "EN_COURS",
  "totalTasks": 10,
  "completedTasks": 7,
  "teamSize": 5,
  "dateDebut": "2026-05-07",
  "dateFin": "2026-05-31"
}
```

#### Add Team Member
```http
POST /projects/:id/team
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id",
  "role": "DEVELOPER"
}
```

#### Remove Team Member
```http
DELETE /projects/:id/team/:userId
Authorization: Bearer <token>
```

#### Delete Project
```http
DELETE /projects/:id
Authorization: Bearer <token>
```

---

### ✓ Tasks

#### Get All Tasks
```http
GET /tasks
Authorization: Bearer <token>

# Query parameters:
# ?projectId=project_id  (optional filter by project)
```

#### Create Task
```http
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "project_id",
  "titre": "Task Title",
  "description": "Task description",
  "priorite": "HAUTE",
  "dateDebut": "2026-05-07",
  "dateFin": "2026-05-10",
  "assigneeId": "user_id"
}
```

#### Get Task by ID
```http
GET /tasks/:id
Authorization: Bearer <token>
```

#### Update Task
```http
PATCH /tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "titre": "Updated Title",
  "progression": 50,
  "statut": "EN_COURS"
}
```

#### Get User Tasks
```http
GET /tasks/user/:userId
Authorization: Bearer <token>
```

#### Add Task Comment
```http
POST /tasks/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "project_id",
  "contenu": "Comment text"
}
```

#### Get Task Comments
```http
GET /tasks/:id/comments
Authorization: Bearer <token>
```

#### Delete Task
```http
DELETE /tasks/:id
Authorization: Bearer <token>
```

---

### 🔔 Notifications

#### Get Notifications
```http
GET /notifications
Authorization: Bearer <token>

# Query parameters:
# ?unreadOnly=true  (optional, get only unread)
```

#### Mark as Read
```http
PATCH /notifications/:id/read
Authorization: Bearer <token>
```

#### Delete Notification
```http
DELETE /notifications/:id
Authorization: Bearer <token>
```

---

## WebSocket Events (Socket.io)

Connect to: `ws://localhost:3000`

### Client to Server

```javascript
// Connect
socket.emit('connect');

// Join room for project
socket.emit('join-project', { projectId: 'project_id' });

// Send progress update
socket.emit('progress-update', { projectId: 'id', progress: 50 });

// Send message
socket.emit('message', { projectId: 'id', text: 'Message' });
```

### Server to Client

```javascript
// Receive progress update
socket.on('progress-updated', (data) => {
  // Handle progress update
});

// Receive message
socket.on('message-received', (data) => {
  // Handle message
});

// User joined
socket.on('user-joined', (data) => {
  // Handle user join
});

// User left
socket.on('user-left', (data) => {
  // Handle user leave
});
```

---

## User Roles & Permissions

### GENERAL (Admin)
- Full system access
- Create/Edit/Delete projects
- Create/Edit/Delete users
- Assign users to projects
- View all data

### COLONEL (Project Manager)
- Create projects
- Edit own projects
- Manage project teams
- Assign tasks
- View statistics

### SOLDAT (Developer)
- View assigned projects
- Update task progress
- Add comments
- View own data

---

## Rate Limiting

- **Default**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per minute
- **File Upload**: 10MB max file size

---

## Common Errors

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "error": "Unauthorized"
}
```

**Fix**: Login again and get new token

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Email already exists",
  "error": "BadRequest"
}
```

**Fix**: Check request body for errors

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Project not found",
  "error": "NotFound"
}
```

**Fix**: Verify resource ID

---

## Examples

### JavaScript (Fetch)

```javascript
// Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { access_token } = await response.json();

// Get projects
const projectsResponse = await fetch(
  'http://localhost:3000/api/projects',
  {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  }
);

const projects = await projectsResponse.json();
```

### cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get projects
curl http://localhost:3000/api/projects \
  -H "Authorization: Bearer <token>"
```

---

**Last Updated**: May 7, 2026
**API Version**: 0.1.0
