import React from 'react';
import type { Task } from './calendarTypes';
import { PRIORITY_COLORS, STATUS_STYLES } from './calendarTypes';

interface Props {
  tasks: Task[];
  onTaskClick: (t: Task) => void;
}

const CalendarListView: React.FC<Props> = ({ tasks, onTaskClick }) => {
  const sorted = [...tasks]
    .filter(t => t.dateDebut || t.dateFin)
    .sort((a, b) =>
      new Date(a.dateDebut || a.dateFin || '').getTime() -
      new Date(b.dateDebut || b.dateFin || '').getTime()
    );

  if (sorted.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EEF0F6', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '48px 24px', textAlign: 'center', color: '#C4C9D4', fontSize: 13, fontWeight: 600 }}>
          Aucune tâche avec des dates planifiées
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EEF0F6', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
      {sorted.map((task, idx) => {
        const status = STATUS_STYLES[task.statut] || STATUS_STYLES.TODO;
        const color = PRIORITY_COLORS[task.priorite] || '#31338dff';

        return (
          <div
            key={task.id}
            onClick={() => onTaskClick(task)}
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', borderBottom: idx < sorted.length - 1 ? '1px solid #F8FAFC' : 'none', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 99, background: color, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1A1D2E' }}>{task.titre}</p>
              {task.assignee && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9CA3AF' }}>{task.assignee.nom}</p>}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', textAlign: 'center', flexShrink: 0 }}>
              {task.dateDebut && <div><span style={{ fontWeight: 600 }}>Début : </span>{new Date(task.dateDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</div>}
              {task.dateFin  && <div><span style={{ fontWeight: 600 }}>Fin : </span>{new Date(task.dateFin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</div>}
            </div>
            {task.blocage && (
              <span style={{ padding: '3px 8px', borderRadius: 6, background: '#FEF2F2', color: '#DC2626', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                🔴 Blocage
              </span>
            )}
            <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: status.bg, color: status.text, flexShrink: 0 }}>
              {task.statut.replace(/_/g, ' ')}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarListView;
