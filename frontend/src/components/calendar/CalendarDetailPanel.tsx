import React from 'react';
import type { Task } from './calendarTypes';
import { PRIORITY_COLORS, STATUS_STYLES, fmtFull } from './calendarTypes';

interface Props {
  task: Task;
  onClose: () => void;
}

const CalendarDetailPanel: React.FC<Props> = ({ task, onClose }) => {
  const status = STATUS_STYLES[task.statut] || STATUS_STYLES.TODO;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.15)' }} />
      <div style={{
        position: 'fixed', right: 24, top: '50%', transform: 'translateY(-50%)',
        width: 340, background: 'var(--bg-card)', borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 99, padding: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ flex: 1, paddingRight: 8 }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>{task.titre}</p>
            {task.assignee && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0', fontWeight: 500 }}>
                Assigné à @{task.assignee.username}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-faint)', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: status.bg, color: status.text }}>
            {task.statut.replace(/_/g, ' ')}
          </span>
          <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: 'var(--bg-hover)', color: PRIORITY_COLORS[task.priorite] || '#6366f1' }}>
            {task.priorite}
          </span>
        </div>

        {(task.dateDebut || task.dateFin) && (
          <div style={{ background: 'var(--bg-hover)', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
            {task.dateDebut && (
              <div style={{ fontSize: 11, color: 'var(--text-sub)', marginBottom: task.dateFin ? 6 : 0 }}>
                <span style={{ fontWeight: 700, color: 'var(--text-sub)' }}>Début : </span>{fmtFull(task.dateDebut)}
              </div>
            )}
            {task.dateFin && (
              <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-sub)' }}>Fin : </span>{fmtFull(task.dateFin)}
              </div>
            )}
          </div>
        )}

        {task.situation && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Situation</p>
            <p style={{ fontSize: 12, color: 'var(--text-sub)', margin: 0, lineHeight: 1.5 }}>{task.situation}</p>
          </div>
        )}

        {task.blocage && (
          <div style={{ background: 'rgba(239,68,68,0.10)', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>🔴 Blocage</p>
            <p style={{ fontSize: 12, color: '#EF4444', margin: 0, lineHeight: 1.5, fontWeight: 600, opacity: 0.85 }}>{task.blocage}</p>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 6, background: 'var(--bg-hover)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${task.progression}%`,
                background: task.progression >= 100 ? '#22c55e' : 'var(--accent)',
                borderRadius: 99, transition: 'width 0.3s',
              }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', fontFamily: 'monospace' }}>
              {Math.round(task.progression)}%
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarDetailPanel;
