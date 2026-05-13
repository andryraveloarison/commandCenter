# Command Center — CLAUDE.md (Racine)

## Vue d'ensemble

Application de gestion de projets DSI (style militaire). Stack complète Dockerisée : NestJS + Prisma + PostgreSQL (backend) et React + Vite + Tailwind (frontend).

## Démarrage

```bash
docker compose up -d        # démarre tout (DB + API + Frontend)
docker compose logs -f backend   # logs backend en temps réel
docker compose logs -f frontend  # logs frontend en temps réel
```

## Ports

| Service  | Port local |
|----------|-----------|
| Frontend | 5173      |
| Backend  | 3000      |
| Postgres | 5434      |

Swagger : http://localhost:3000/api/docs

## Structure du projet

```
commandCenter/
├── backend/          # NestJS API (voir backend/CLAUDE.md)
├── frontend/         # React SPA  (voir frontend/CLAUDE.md)
├── docker-compose.yml
└── CLAUDE.md
```

## Identifiants de test

| Email                 | Password    | Rôle |
|-----------------------|-------------|------|
| general@command.mil   | password123 | DSI  |

## Règles transversales

- Ne jamais committer `.env` ni secrets.
- Toujours utiliser le token JWT (header `Authorization: Bearer <token>`) pour les appels API.
- Les migrations de schéma Prisma se font dans `backend/prisma/schema.prisma` ; le backend applique `prisma db push --accept-data-loss` au démarrage Docker (dev uniquement).
- WebSocket temps réel via Socket.io sur le même port 3000 (gateway `ChatGateway`).
