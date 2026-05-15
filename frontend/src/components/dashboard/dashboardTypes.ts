export const CHART_COLORS = ['#0f172a', '#114496ff', '#22c55e', '#7c2121ff', '#88491bff', '#8b5cf6', '#881e53ff', '#14b8a6'];
export const AVATAR_COLORS = ['#881c1cff', '#97480fff', '#eab308', '#13813cff', '#1b9183ff', '#153974ff', '#3b207aff', '#8f1a55ff'];
export const avatarColor = (id: string) => AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];

export const STATUS_PROJ: Record<string, { label: string; color: string }> = {
  PREPARATION: { label: 'Préparation', color: '#94a3b8' },
  EN_COURS:    { label: 'En Cours',    color: '#204e99ff' },
  CRITIQUE:    { label: 'Critique',    color: '#941111a2' },
  TERMINE:     { label: 'Terminé',     color: '#1ca54eff' },
};

export const STATUS_TASK: Record<string, { label: string; color: string }> = {
  TODO:      { label: 'À Faire',    color: '#cbd5e1' },
  EN_COURS:  { label: 'En Cours',   color: '#3b82f6' },
  EN_REVIEW: { label: 'En Review',  color: '#ac5618ff' },
  COMPLETEE: { label: 'Complétée',  color: '#1d9248ff' },
  BLOQUEE:   { label: 'Bloquée',    color: '#881a1aff' },
};

export const PRIO: Record<string, { label: string; color: string }> = {
  BASSE:    { label: 'Basse',    color: '#22c55e' },
  MOYENNE:  { label: 'Moyenne',  color: '#ad5c22ff' },
  HAUTE:    { label: 'Haute',    color: '#832020ff' },
  CRITIQUE: { label: 'Critique', color: '#5224a0ff' },
};

export const STATUS_INTERV: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  EN_ATTENTE: { label: 'En attente', color: '#D97706', bg: 'rgba(217,119,6,0.12)',  dot: '#D97706' },
  EN_COURS:   { label: 'En cours',   color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', dot: '#3B82F6' },
  RESOLU:     { label: 'Résolu',     color: '#16A34A', bg: 'rgba(22,163,74,0.12)',  dot: '#16A34A' },
  ANNULE:     { label: 'Annulé',     color: '#6B7280', bg: 'rgba(107,114,128,0.12)',dot: '#9CA3AF' },
};

export const TOOLTIP_STYLE = {
  borderRadius: '12px', border: 'none',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  fontSize: '11px', fontWeight: 700,
};

export type Period = 'tout' | 'semaine' | 'mois' | 'annee' | 'custom';

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'tout',    label: 'Tout' },
  { value: 'semaine', label: 'Cette semaine' },
  { value: 'mois',   label: 'Ce mois' },
  { value: 'annee',  label: 'Cette année' },
  { value: 'custom', label: 'Plage…' },
];

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—';

export const inp: React.CSSProperties = {
  padding: '6px 12px', borderRadius: 9, border: '1.5px solid #EEF0F6',
  background: '#F8FAFC', fontSize: 12, fontFamily: 'Inter, sans-serif',
  outline: 'none', color: '#1A1D2E',
};
