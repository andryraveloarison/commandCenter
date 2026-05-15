import React from 'react';
import type { Task, LocalIntervention, ContentType } from './calendarTypes';

interface Props {
  contentType: ContentType;
  tasksThisMonth: Task[];
  interventionsThisMonth: LocalIntervention[];
}

const CalendarStatsBar: React.FC<Props> = ({ contentType, tasksThisMonth, interventionsThisMonth }) => {
  const stats = contentType === 'projets'
    ? [
        { label: 'Tâches ce mois', value: tasksThisMonth.length,                                                                  color: '#6366f1' },
        { label: 'À faire',        value: tasksThisMonth.filter(t => t.statut === 'TODO').length,                                 color: '#6B7280' },
        { label: 'En cours',       value: tasksThisMonth.filter(t => t.statut === 'EN_COURS' || t.statut === 'EN_REVIEW').length, color: '#D97706' },
        { label: 'Complétées',     value: tasksThisMonth.filter(t => t.statut === 'COMPLETEE').length,                            color: '#16A34A' },
      ]
    : [
        { label: 'Interventions ce mois', value: interventionsThisMonth.length,                                              color: '#6366f1' },
        { label: 'En attente',            value: interventionsThisMonth.filter(i => i.statut === 'EN_ATTENTE').length,       color: '#D97706' },
        { label: 'En cours',              value: interventionsThisMonth.filter(i => i.statut === 'EN_COURS').length,         color: '#3B82F6' },
        { label: 'Résolues',              value: interventionsThisMonth.filter(i => i.statut === 'RESOLU').length,           color: '#16A34A' },
      ];

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
      {stats.map(s => (
        <div key={s.label} style={{ flex: 1, background: 'var(--bg-card)', borderRadius: 14, padding: '12px 16px', border: '1px solid var(--border-color)' }}>
          <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1, fontFamily: 'Montserrat, sans-serif' }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
};

export default CalendarStatsBar;
