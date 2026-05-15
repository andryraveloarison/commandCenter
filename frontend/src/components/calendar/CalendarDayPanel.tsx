import React from 'react';
import type { Task } from './calendarTypes';
import { PRIORITY_COLORS, STATUS_STYLES } from './calendarTypes';
import CalendarAvatar from './CalendarAvatar';

interface Props {
  date: Date;
  tasks: Task[];
  onTaskClick: (t: Task) => void;
  onClose: () => void;
}

const DAY_LABELS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTH_LABELS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const CalendarDayPanel: React.FC<Props> = ({ date, tasks, onTaskClick, onClose }) => {
  const dayLabel = `${DAY_LABELS[date.getDay()]} ${date.getDate()} ${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;

  // Group tasks by assignee
  const groups = new Map<string, { label: string; user: Task['assignee'] | null; tasks: Task[] }>();

  for (const task of tasks) {
    const key = task.assigneeId || '__none__';
    if (!groups.has(key)) {
      groups.set(key, {
        label: task.assignee ? `@${task.assignee.username}` : 'Non assigné',
        user: task.assignee ?? null,
        tasks: [],
      });
    }
    groups.get(key)!.tasks.push(task);
  }

  // Sort: assigned first, unassigned last
  const sorted = [...groups.values()].sort((a, b) => {
    if (!a.user && b.user) return 1;
    if (a.user && !b.user) return -1;
    return a.label.localeCompare(b.label);
  });

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.2)' }} />
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 380,
        background: 'var(--bg-card)', zIndex: 99,
        boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Montserrat' }}>{dayLabel}</p>
              <p style={{ margin: '4px 0 0', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                {tasks.length} tâche{tasks.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text-faint)', lineHeight: 1, padding: 0 }}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          {tasks.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13, fontWeight: 600 }}>
              Aucune tâche ce jour
            </div>
          ) : sorted.map(group => (
            <div key={group.label} style={{ marginBottom: 20 }}>
              {/* User header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px 8px' }}>
                {group.user
                  ? <CalendarAvatar user={group.user} size={26} />
                  : (
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-icon)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>?</span>
                    </div>
                  )
                }
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {group.label}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: 'var(--text-faint)' }}>
                  {group.tasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {group.tasks.map(task => {
                  const status = STATUS_STYLES[task.statut] || STATUS_STYLES.TODO;
                  const color  = PRIORITY_COLORS[task.priorite] || '#6366f1';
                  return (
                    <div
                      key={task.id}
                      onClick={() => { onClose(); onTaskClick(task); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <div style={{ width: 3, alignSelf: 'stretch', minHeight: 18, borderRadius: 99, background: color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.titre}
                      </span>
                      {task.blocage && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#DC2626', flexShrink: 0 }}>🔴</span>
                      )}
                      <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 9, fontWeight: 700, background: status.bg, color: status.text, flexShrink: 0, whiteSpace: 'nowrap' }}>
                        {task.statut.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-muted)', flexShrink: 0 }}>
                        {Math.round(task.progression)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CalendarDayPanel;
