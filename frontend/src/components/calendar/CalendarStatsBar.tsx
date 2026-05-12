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
        { label: 'Tâches ce mois',  value: tasksThisMonth.length,                                                                     color: '#323399ff', bg: '#EEF2FF' },
        { label: 'À faire',         value: tasksThisMonth.filter(t => t.statut === 'TODO').length,                                    color: '#4B5563',   bg: '#F1F5F9' },
        { label: 'En cours',        value: tasksThisMonth.filter(t => t.statut === 'EN_COURS' || t.statut === 'EN_REVIEW').length,    color: '#744204ff', bg: '#FFF7ED' },
        { label: 'Complétées',      value: tasksThisMonth.filter(t => t.statut === 'COMPLETEE').length,                               color: '#063718ff', bg: '#F0FDF4' },
      ]
    : [
        { label: 'Interventions ce mois', value: interventionsThisMonth.length,                                              color: '#323399ff', bg: '#EEF2FF' },
        { label: 'En attente',            value: interventionsThisMonth.filter(i => i.statut === 'EN_ATTENTE').length,       color: '#D97706',   bg: '#FEF3C7' },
        { label: 'En cours',              value: interventionsThisMonth.filter(i => i.statut === 'EN_COURS').length,         color: '#1D4ED8',   bg: '#DBEAFE' },
        { label: 'Résolues',              value: interventionsThisMonth.filter(i => i.statut === 'RESOLU').length,           color: '#065F46',   bg: '#D1FAE5' },
      ];

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
      {stats.map(s => (
        <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: 14, padding: '12px 16px' }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
          <p style={{ margin: '4px 0 0', fontSize: 10, fontWeight: 600, color: s.color, opacity: 0.7 }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
};

export default CalendarStatsBar;
