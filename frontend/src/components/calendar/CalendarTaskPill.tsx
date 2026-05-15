import React from 'react';
import type { Task } from './calendarTypes';
import { getProgressionColor } from './calendarTypes';

interface Props {
  task: Task;
  onClick: () => void;
}

const CalendarTaskPill: React.FC<Props> = ({ task, onClick }) => {
  const color = getProgressionColor(task.progression);
  const isBlocked = !!task.blocage;

  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: isBlocked ? 'rgba(239,68,68,0.12)' : `${color}18`,
        borderRadius: '0 6px 6px 0', padding: '2px 4px 2px 6px',
        width: '100%', textAlign: 'left', cursor: 'pointer',
        border: 'none', borderLeftColor: color,
        borderLeftStyle: 'solid', borderLeftWidth: 3,
      }}
    >
      {isBlocked && <span style={{ fontSize: 8, flexShrink: 0 }}>🔴</span>}
      <span style={{
        fontSize: 10, fontWeight: 700,
        color: isBlocked ? '#EF4444' : color,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
      }}>
        {task.titre}
      </span>
      {task.assignee && (
        <div style={{
          width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
          background: 'var(--accent-soft)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', overflow: 'hidden', border: '1.5px solid var(--bg-card)',
        }}>
          {task.assignee.photo
            ? <img src={task.assignee.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            : <span style={{ fontSize: 7, fontWeight: 800, color: 'var(--accent)' }}>{task.assignee.nom[0]}</span>
          }
        </div>
      )}
    </button>
  );
};

export default CalendarTaskPill;
