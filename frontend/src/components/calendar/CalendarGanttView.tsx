import React from 'react';
import type { Task, Project } from './calendarTypes';
import { toLocal, getProgressionColor } from './calendarTypes';
import CalendarAvatar from './CalendarAvatar';

const ROW_H    = 44;
const BAR_H    = 36;
const HEADER_H = 52;
const LEFT_W   = 190;
const AVATAR_SIZE = 26;
const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

interface Props {
  tasks: Task[];
  projects: Project[];
  weekStart: Date;
  onTaskClick: (t: Task) => void;
}

const CalendarGanttView: React.FC<Props> = ({ tasks, projects, weekStart, onTaskClick }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build the 7 days of the week
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const weekEnd = days[6];

  const tasksWithDates = tasks.filter(t => {
    if (!t.dateDebut && !t.dateFin) return false;
    const s = t.dateDebut ? toLocal(t.dateDebut) : null;
    const e = t.dateFin   ? toLocal(t.dateFin)   : null;
    const start = s || e!;
    const end   = e || s!;
    return start <= weekEnd && end >= weekStart;
  });

  const projectIds = [...new Set(tasksWithDates.map(t => t.projectId))];

  const todayIdx = days.findIndex(d => d.getTime() === today.getTime());

  const getBarPos = (task: Task) => {
    const s = task.dateDebut ? toLocal(task.dateDebut) : null;
    const e = task.dateFin   ? toLocal(task.dateFin)   : null;
    const cs = (s && s >= weekStart) ? s : weekStart;
    const ce = (e && e <= weekEnd)   ? e : weekEnd;
    const startDay = Math.max(0, (cs.getTime() - weekStart.getTime()) / 86400000);
    const endDay   = Math.min(7, (ce.getTime() - weekStart.getTime()) / 86400000 + 1);
    return {
      left:  `${(startDay / 7) * 100}%`,
      width: `${Math.max((endDay - startDay) / 7 * 100, 2)}%`,
    };
  };

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
      {/* Header row */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ width: LEFT_W, flexShrink: 0, borderRight: '1px solid var(--border-subtle)', padding: '14px 16px', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Projet / Tâche</span>
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days.map((d, i) => {
            const isToday = d.getTime() === today.getTime();
            return (
              <div key={i} style={{
                textAlign: 'center', padding: '10px 4px',
                borderRight: i < 6 ? '1px solid var(--border-subtle)' : 'none',
                background: isToday ? 'var(--bg-active)' : 'transparent',
              }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: isToday ? '#6366f1' : 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {DAY_NAMES[i]}
                </div>
                <div style={{ fontSize: 13, fontWeight: isToday ? 800 : 600, color: isToday ? '#6366f1' : 'var(--text-muted)', marginTop: 2 }}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {projectIds.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13, fontWeight: 600 }}>
          Aucune tâche planifiée cette semaine
        </div>
      ) : projectIds.map((projectId, pi) => {
        const project = projects.find(p => p.id === projectId);
        const projectTasks = tasksWithDates.filter(t => t.projectId === projectId);
        const totalH = HEADER_H + projectTasks.length * (ROW_H + 4);

        return (
          <div key={projectId} style={{ display: 'flex', borderBottom: pi < projectIds.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            {/* Left column */}
            <div style={{ width: LEFT_W, flexShrink: 0, borderRight: '1px solid var(--border-subtle)' }}>
              <div style={{ height: HEADER_H, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                {project?.logo
                  ? <img src={project.logo} style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} alt="" />
                  : <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>
                      {(project?.nom || 'P')[0]}
                    </div>
                }
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {project?.nom || 'Projet'}
                </span>
              </div>
              {projectTasks.map(task => (
                <div key={task.id} style={{ height: ROW_H, marginBottom: 4, padding: '0 16px 0 30px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {task.assignee && <CalendarAvatar user={task.assignee} size={18} />}
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.titre}
                  </span>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div style={{ flex: 1, position: 'relative', height: totalH }}>
              {/* Day columns */}
              {days.map((d, i) => (
                <div key={i} style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: `${(i / 7) * 100}%`, width: `${100 / 7}%`,
                  background: d.getTime() === today.getTime() ? 'var(--bg-active)' : i % 2 === 0 ? 'transparent' : 'var(--bg-app)',
                  borderRight: i < 6 ? '1px solid var(--border-subtle)' : 'none',
                }} />
              ))}

              {/* Today line */}
              {todayIdx >= 0 && (
                <div style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: `${((todayIdx + 0.5) / 7) * 100}%`,
                  width: 2, background: 'var(--accent)', opacity: 0.35, zIndex: 1,
                }} />
              )}

              <div style={{ height: HEADER_H }} />

              {/* Task bars */}
              {projectTasks.map(task => {
                const color = getProgressionColor(task.progression);
                const pos = getBarPos(task);
                return (
                  <div key={task.id} style={{ height: ROW_H, marginBottom: 4, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div
                      onClick={() => onTaskClick(task)}
                      style={{
                        position: 'absolute', ...pos, height: BAR_H,
                        background: `${color}20`, border: `1.5px solid ${color}`,
                        borderRadius: 10, cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                        padding: `0 10px 0 ${task.assignee ? 6 : 10}px`,
                        gap: 8, overflow: 'hidden', zIndex: 2,
                        transition: 'filter 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(0.92)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = 'none'}
                    >
                      {task.assignee && <CalendarAvatar user={task.assignee} size={AVATAR_SIZE} />}
                      <span style={{ fontSize: 11, fontWeight: 700, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                        {task.titre}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 800, color, opacity: 0.85, flexShrink: 0 }}>
                        {Math.round(task.progression)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarGanttView;
