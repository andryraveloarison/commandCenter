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
        background: isBlocked ? '#FEF2F2' : `${color}18`,
        borderRadius: '0 6px 6px 0', padding: '2px 6px',
        width: '100%', textAlign: 'left', cursor: 'pointer',
        border: 'none', borderLeftColor: color,
        borderLeftStyle: 'solid', borderLeftWidth: 3,
      }}
    >
      {isBlocked && <span style={{ fontSize: 8, flexShrink: 0 }}>🔴</span>}
      <span style={{
        fontSize: 10, fontWeight: 700,
        color: isBlocked ? '#DC2626' : color,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {task.titre}
      </span>
    </button>
  );
};

export default CalendarTaskPill;
