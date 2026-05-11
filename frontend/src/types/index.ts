export interface User {
  id: string;
  email: string;
  username: string;
  nom: string;
  photo?: string;
  role: 'DSI' | 'RESPONSABLE' | 'DEVELOPPEUR';
  statut: 'ACTIF' | 'INACTIF' | 'OCCUPE';
  createdAt: string;
  activite: string;
}

export interface Project {
  id: string;
  nom: string;
  description?: string;
  logo?: string;
  statut: 'PREPARATION' | 'EN_COURS' | 'CRITIQUE' | 'TERMINE';
  priorite: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
  progressionGlobale: number;
  dateDebut: string;
  dateFin?: string;
  createdAt: string;
  updatedAt: string;
  teams?: ProjectTeam[];
  tasks?: Task[];
  modules?: Module[];
  history?: ProjectHistory[];
}

export interface Module {
  id: string;
  projectId: string;
  nom: string;
  description?: string;
  progression: number;
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTeam {
  id: string;
  projectId: string;
  userId: string;
  role?: string;
  user?: User;
}

export interface Task {
  id: string;
  projectId: string;
  moduleId?: string;
  titre: string;
  description?: string;
  progression: number;
  statut: 'TODO' | 'EN_COURS' | 'EN_REVIEW' | 'COMPLETEE' | 'BLOQUEE';
  priorite: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
  dateDebut?: string;
  dateFin?: string;
  assigneeId?: string;
  assignee?: User;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectHistory {
  id: string;
  projectId: string;
  progression: number;
  note?: string;
  userId: string;
  user?: User;
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  projectId: string;
  userId: string;
  user?: User;
  contenu: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  titre: string;
  message: string;
  lu: boolean;
  type: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  taskId: string;
  nom: string;
  url: string;
  type: string;
  taille: number;
  createdAt: string;
}
