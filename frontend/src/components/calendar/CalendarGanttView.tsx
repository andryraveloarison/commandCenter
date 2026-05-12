import React from 'react';
import type { Task, Project } from './calendarTypes';
import { getDaysInMonth, toLocal, getProgressionColor } from './calendarTypes';
import CalendarAvatar from './CalendarAvatar';

const ROW_H  = 44;
const BAR_H  = 36;
const HEADER_H = 48;
const LEFT_W = 190;
const AVATAR_SIZE = 28;

interface Props {
  tasks: Task[];
  projects: Project[];
  year: number;
  month: number;
  onTaskClick: (t: Task) => void;
}

const CalendarGanttView: React.FC<Props> = ({ tasks, projects, year, month, onTaskClick }) => {
  const daysInMonth = getDaysInMonth(year, month);
  const today = new Date();
  const todayDay = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : null;

  const monthStart = new Date(year, month, 1);
  const monthEnd   = new Date(year, month, daysInMonth);

  const tasksWithDates = tasks.filter(t => t.dateDebut || t.dateFin);
  const projectIds = [...new Set(tasksWithDates.map(t => t.projectId))];

  const getBarPos = (task: Task) => {
    const s = task.dateDebut ? toLocal(task.dateDebut) : null;
    const e = task.dateFin   ? toLocal(task.dateFin)   : null;
    const cs = s ? (s < monthStart ? monthStart : s) : (e || monthStart);
    const ce = e ? (e > monthEnd   ? monthEnd   : e) : (s || monthEnd);
    const left  = ((cs.getDate() - 1) / daysInMonth) * 100;
    const width = Math.max(((ce.getDate() - cs.getDate() + 1) / daysInMonth) * 100, 1.5);
    return { left: `${left}%`, width: `${width}%` };
  };

  const weeks: { start: number; end: number }[] = [];
  for (let i = 1; i <= daysInMonth; i += 7) weeks.push({ start: i, end: Math.min(i + 6, daysInMonth) });

  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EEF0F6', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <div style={{ display: 'flex', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ width: LEFT_W, flexShrink: 0, borderRight: '1px solid #F1F5F9', padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#C4C9D4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Projet</span>
        </div>
        <div style={{ flex: 1, display: 'flex' }}>
          {weeks.map((w, i) => (
            <div key={i} style={{ flex: w.end - w.start + 1, textAlign: 'center', padding: '12px 4px', fontSize: 10, fontWeight: 800, color: '#C4C9D4', textTransform: 'uppercase', letterSpacing: '0.08em', borderRight: i < weeks.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
              Sem {i + 1} · {w.start}–{w.end}
            </div>
          ))}
        </div>
      </div>

      {projectIds.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: '#C4C9D4', fontSize: 13, fontWeight: 600 }}>
          Aucune tâche planifiée ce mois
        </div>
      ) : projectIds.map((projectId, pi) => {
        const project = projects.find(p => p.id === projectId);
        const projectTasks = tasksWithDates.filter(t => t.projectId === projectId);
        const totalH = HEADER_H + projectTasks.length * (ROW_H + 4);

        return (
          <div key={projectId} style={{ display: 'flex', borderBottom: pi < projectIds.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
            {/* Left column */}
            <div style={{ width: LEFT_W, flexShrink: 0, borderRight: '1px solid #F1F5F9' }}>
              <div style={{ height: HEADER_H, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                {project?.logo
                  ? <img src={project.logo} style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} alt="" />
                  : <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#6366f1', flexShrink: 0 }}>
                      {(project?.nom || 'P')[0]}
                    </div>
                }
                <span style={{ fontSize: 12, fontWeight: 800, color: '#1A1D2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {project?.nom || 'Projet'}
                </span>
              </div>
              {projectTasks.map(task => (
                <div key={task.id} style={{ height: ROW_H, marginBottom: 4, padding: '0 16px 0 30px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.titre}
                  </span>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div style={{ flex: 1, position: 'relative', height: totalH }}>
              {/* Week stripes */}
              {weeks.map((w, i) => (
                <div key={i} style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: `${((w.start - 1) / daysInMonth) * 100}%`,
                  width: `${((w.end - w.start + 1) / daysInMonth) * 100}%`,
                  background: i % 2 === 0 ? 'transparent' : '#FAFBFC',
                  borderRight: i < weeks.length - 1 ? '1px solid #F8FAFC' : 'none',
                }} />
              ))}

              {/* Today line */}
              {todayDay && (
                <div style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: `${((todayDay - 0.5) / daysInMonth) * 100}%`,
                  width: 2, background: '#6366f1', opacity: 0.25, zIndex: 1,
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
                      {task.assignee && (
                        <CalendarAvatar user={task.assignee} size={AVATAR_SIZE} />
                      )}
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
