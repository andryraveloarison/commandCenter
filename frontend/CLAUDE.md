# Command Center — Frontend CLAUDE.md

## Stack

- **Framework** : React 18 + TypeScript
- **Build** : Vite
- **Styling** : Tailwind CSS (utilitaires) + inline styles (composants spécifiques)
- **State serveur** : TanStack React Query (`useQuery`, `useMutation`)
- **State global** : Redux Toolkit (auth, projets, tâches, UI)
- **Routing** : React Router v6
- **HTTP** : Axios via `apiService` (`src/services/api.ts`)
- **WebSocket** : Socket.io client (`src/services/socket.ts`)

## Alias de chemins (tsconfig / vite)

```ts
@pages/*      → src/pages/*
@components/* → src/components/*
@services/*   → src/services/*
@store/*      → src/store/*
@hooks/*      → src/hooks/*
```

---

## RÈGLE FONDAMENTALE — Séparation des composants

> **Une page ne doit jamais dépasser ~150 lignes.**
> Tout bloc JSX réutilisable ou autonome de plus de ~30 lignes doit être extrait dans son propre fichier.

### Pourquoi

Les pages avec 400+ lignes deviennent illisibles, difficiles à maintenir et impossibles à tester. Un fichier = une responsabilité claire.

### Structure attendue par feature

Quand une page devient complexe, créer un dossier dans `components/` :

```
src/
├── pages/
│   └── InterventionsPage.tsx     # ≤ 150 lignes : orchestration + layout
│
└── components/
    └── interventions/
        ├── InterventionTable.tsx          # tableau de liste
        ├── InterventionModal.tsx          # modal création/édition
        ├── InterventionStatusBadge.tsx    # badge statut
        ├── InterventionStatsBar.tsx       # barre de statistiques
        ├── InterventionQuickAdd.tsx       # mini-formulaire site/demandeur
        ├── IntervenantsPicker.tsx         # sélecteur multi-intervenants
        └── interventionTypes.ts           # types TypeScript locaux
```

### Ce que doit contenir une page

```tsx
// ✅ Bon — la page orchestre, ne contient pas de logique UI
const InterventionsPage = () => {
  const { data } = useQuery(...)
  const [modal, setModal] = useState(...)

  return (
    <div>
      <InterventionStatsBar stats={...} />
      <InterventionTable data={...} onEdit={setModal} />
      {modal && <InterventionModal item={modal} onClose={...} />}
    </div>
  )
}
```

```tsx
// ❌ Mauvais — tout dans la page
const InterventionsPage = () => {
  // 80 lignes de state...
  // 100 lignes de helpers inline...
  return (
    <div>
      {/* 300 lignes de JSX imbriqué */}
    </div>
  )
}
```

---

## Structure des dossiers

```
src/
├── pages/              # Une page par route (≤ 150 lignes, orchestration uniquement)
├── components/
│   ├── <feature>/      # Composants d'une feature spécifique
│   │   ├── index.ts    # Réexporte les composants publics du dossier
│   │   └── featureTypes.ts  # Types locaux à la feature
│   ├── modals/         # Modals génériques ou multi-features
│   ├── partials/       # Petits composants partagés (ligne de table, badge...)
│   ├── Layout.tsx      # Layout principal (sidebar, header)
│   └── ChatPanel.tsx   # Panel chat global
├── hooks/              # Hooks React personnalisés (useXxx)
├── services/
│   ├── api.ts          # Toutes les méthodes HTTP (classe APIService)
│   ├── socket.ts       # Client Socket.io
│   └── utils.ts        # Fonctions utilitaires pures
├── store/
│   └── slices/         # Slices Redux Toolkit
├── types/
│   └── index.ts        # Types TypeScript partagés entre features
└── Router.tsx          # Déclaration des routes
```

## Conventions de nommage

| Élément              | Convention          | Exemple                        |
|----------------------|---------------------|--------------------------------|
| Composant React      | PascalCase          | `InterventionModal.tsx`        |
| Hook custom          | camelCase + use     | `useInterventions.ts`          |
| Fichier de types     | camelCase + Types   | `interventionTypes.ts`         |
| Fichier utilitaire   | camelCase           | `dashboardHelpers.ts`          |
| Dossier feature      | camelCase           | `components/interventions/`    |

## Styling

- **Layout et utilitaires** : classes Tailwind (`flex`, `gap-4`, `text-sm`…)
- **Styles spécifiques aux composants** : objets inline `style={{}}` avec tokens de couleurs cohérents
- **Couleurs principales** :
  - Primaire indigo : `#4F46E5` (bg), `#EEF2FF` (bg light), `#A5B4FC` (disabled)
  - Texte : `#1A1D2E` (fort), `#374151` (normal), `#6B7280` (secondaire), `#9CA3AF` (muted)
  - Bordures : `#EEF0F6` (standard), `#F0F2F8` (séparateur)
  - Fond : `#F8FAFC` (page), `#F3F4F6` (input)

## Types partagés

Les types utilisés dans plusieurs features vont dans `src/types/index.ts`.
Les types locaux à une seule feature vont dans `components/<feature>/featureTypes.ts`.

## Appels API

Toujours passer par `apiService` de `@services/api`, jamais d'appel `fetch`/`axios` direct dans les composants.

```ts
// ✅ Correct
import apiService from '@services/api'
const { data } = useQuery({ queryKey: ['interventions'], queryFn: () => apiService.getInterventions().then(r => r.data) })

// ❌ Incorrect
const res = await fetch('/api/interventions')
```

## Données du serveur vs état local

| Besoin                              | Solution                  |
|-------------------------------------|---------------------------|
| Données serveur (liste, détail)     | `useQuery` (React Query)  |
| Mutations (create, update, delete)  | `useMutation` (React Query) |
| Authentification, user courant      | Redux `authSlice`         |
| UI locale (modal ouvert, tab actif) | `useState` dans le composant |

## Pages existantes et leurs composants

| Page                | Route              | Composants dans                         |
|---------------------|--------------------|-----------------------------------------|
| Dashboard           | `/dashboard`       | `components/dashboard/`                 |
| Projets             | `/projects`        | `components/modals/`                    |
| Détail projet       | `/projects/:id`    | `components/modals/`, `components/partials/` |
| Tâches              | `/tasks`           | `components/modals/TaskModal`           |
| Interventions       | `/interventions`   | *(à extraire dans `components/interventions/`)* |
| Calendrier          | `/calendar`        | `components/calendar/`                  |
| Messages            | `/messages`        | `components/ChatPanel`                  |
| War Room            | `/war-room`        | —                                       |
| Utilisateurs        | `/users`           | —                                       |
| Paramètres          | `/settings`        | —                                       |

## Checklist avant d'ajouter du code à une page

1. Le fichier dépasse 150 lignes ? → extraire des composants.
2. Un bloc JSX est répété ou pourrait l'être ? → composant dans `components/partials/`.
3. Le composant a sa propre logique de state / effets ? → hook dans `hooks/`.
4. Les types sont partagés avec d'autres fichiers ? → `types/index.ts`.
5. Les types sont locaux à la feature ? → `components/<feature>/featureTypes.ts`.
