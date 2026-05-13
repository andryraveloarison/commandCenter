# Command Center — Backend CLAUDE.md

## Stack

- **Framework** : NestJS (TypeScript)
- **ORM** : Prisma v5 + PostgreSQL
- **Auth** : JWT via `@nestjs/passport` + `passport-jwt`
- **Validation** : `class-validator` + `class-transformer` (ValidationPipe global, `whitelist: true`)
- **WebSocket** : Socket.io via `@nestjs/websockets` (ChatGateway)
- **Documentation** : Swagger sur `/api/docs`

## Structure des modules

Chaque domaine métier suit le même pattern :

```
src/<domaine>/
├── <domaine>.controller.ts   # Routes HTTP, guards, extraction req.user
├── <domaine>.service.ts      # Logique métier, appels Prisma
├── <domaine>.module.ts       # Déclaration NestJS (imports, providers)
└── dto/
    └── <domaine>.dto.ts      # Classe(s) DTO avec décorateurs class-validator
```

## Conventions obligatoires

### Authentification
- Toujours mettre `@UseGuards(AuthGuard('jwt'))` au niveau **classe** du contrôleur (pas route par route).
- L'utilisateur courant est disponible via `@Request() req` → `req.user.id`.

### DTOs et validation
- Toujours créer un DTO typé avec `class-validator` pour tout body entrant.
- Ne jamais utiliser `@Body() body: any` en production ; réserver `any` aux contrôleurs internes simples déjà validés.
- Exemple minimal :
  ```ts
  class CreateXxxDto {
    @IsString() @IsNotEmpty() @MaxLength(200)
    nom: string;

    @IsOptional() @IsString()
    description?: string;
  }
  ```

### Services et Prisma
- Toute la logique de base de données est dans le **service**, jamais dans le contrôleur.
- Utiliser la constante `INCLUDE` en haut du service pour centraliser les relations incluses dans les requêtes.
- Pour les opérations multi-tables (ex. : mise à jour + suppression de jointures), utiliser `this.prisma.$transaction(async (tx) => { ... })`.
- Ne jamais écrire de SQL brut sauf si Prisma ne peut pas l'exprimer.

### Schéma Prisma
- Fichier : `prisma/schema.prisma`
- Après modification, rebuilder l'image ou relancer le conteneur backend (il exécute `prisma db push --accept-data-loss` au démarrage en dev).
- En production, utiliser `prisma migrate dev --name <description>` pour générer une migration versionnée.
- Nommer les tables en snake_case avec `@@map("nom_table")`.
- Toujours définir `onDelete` sur les FK (`Cascade`, `SetNull`, `Restrict`).

### Nouveaux modules
Pour ajouter un module complet :
1. Créer le dossier `src/<domaine>/` avec controller + service + module + dto.
2. Ajouter le modèle dans `prisma/schema.prisma`.
3. Importer le module dans `src/app.module.ts`.

## Routes existantes

| Méthode | Route                             | Description                      |
|---------|-----------------------------------|----------------------------------|
| POST    | /api/auth/login                   | Connexion, retourne access_token |
| POST    | /api/auth/register                | Inscription                      |
| GET     | /api/users                        | Liste des utilisateurs           |
| GET/POST/PATCH/DELETE | /api/projects          | CRUD projets                     |
| GET/POST/PATCH/DELETE | /api/tasks             | CRUD tâches                      |
| GET/POST/PATCH/DELETE | /api/interventions     | CRUD interventions (multi-intervenants) |
| GET/POST | /api/chat                        | Messages du chat groupe          |
| POST    | /api/chat/poll                    | Créer un sondage                 |
| POST    | /api/chat/poll/:id/vote           | Voter sur un sondage             |
| GET/POST | /api/direct-messages             | Messages privés                  |
| GET/POST/PATCH/DELETE | /api/sites             | CRUD sites                       |
| GET/POST/PATCH/DELETE | /api/demandeurs        | CRUD demandeurs                  |
| GET/POST/PATCH/DELETE | /api/notifications     | Notifications                    |

## WebSocket (ChatGateway)

Événements émis par le serveur :
- `group_message` — nouveau message de groupe (texte ou sondage)
- `poll_update` — mise à jour des votes d'un sondage
- `dm_message` — message privé (envoyé aux rooms `user:<id>`)

Le client s'authentifie via `socket.handshake.auth.token` (JWT).

## Variables d'environnement

```env
DATABASE_URL=postgresql://commandcenter:CommandCenter2026@postgres:5432/commandcenter
JWT_SECRET=command-center-secret-key-military-operations
JWT_EXPIRATION=7d
PORT=3000
FRONTEND_URL=http://localhost:5173
```
