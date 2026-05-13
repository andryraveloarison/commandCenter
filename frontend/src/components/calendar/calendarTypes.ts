import type { Task, Project, User } from '@types/index';

export type { Task, Project, User };

export type ViewMode = 'month' | 'gantt' | 'list';
export type ContentType = 'projets' | 'interventions';

export interface IntervenantRow {
  user: { id: string; nom: string; photo?: string; role: string };
}

export interface LocalIntervention {
  id: string;
  probleme: string;
  solution?: string;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'RESOLU' | 'ANNULE';
  dateIntervention?: string;
  createdAt: string;
  intervenants: IntervenantRow[];
}

export const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
export const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const PRIORITY_COLORS: Record<string, string> = {
  CRITIQUE: '#ef4444',
  HAUTE: '#f97316',
  MOYENNE: '#6366f1',
  BASSE: '#22c55e',
};

export const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  TODO:      { bg: '#F1F5F9', text: '#64748B' },
  EN_COURS:  { bg: '#EEF2FF', text: '#1f1a77ff' },
  EN_REVIEW: { bg: '#FAF5FF', text: '#431c85ff' },
  COMPLETEE: { bg: '#F0FDF4', text: '#126430ff' },
  BLOQUEE:   { bg: '#FEF2F2', text: '#6e1414ff' },
};

export const INTERVENTION_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  EN_ATTENTE: { bg: '#FEF3C7', color: '#D97706', label: 'En attente' },
  EN_COURS:   { bg: '#DBEAFE', color: '#1D4ED8', label: 'En cours' },
  RESOLU:     { bg: '#D1FAE5', color: '#065F46', label: 'Résolu' },
  ANNULE:     { bg: '#F3F4F6', color: '#6B7280', label: 'Annulé' },
};

export const getProgressionColor = (prog: number): string => {
  if (prog >= 100) return '#22c55e';
  if (prog >= 66)  return '#6366f1';
  if (prog >= 33)  return '#f97316';
  return '#1A1D2E';
};

export const fmtFull = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

export const getFirstDayOfMonth = (year: number, month: number) => {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
};

export const isSameDay = (dateStr: string, year: number, month: number, day: number) => {
  const d = new Date(dateStr);
  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
};

export const toLocal = (iso: string) => {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};
