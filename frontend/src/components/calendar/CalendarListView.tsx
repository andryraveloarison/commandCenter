import React from 'react';
import type { Task, Project } from './calendarTypes';
import { PRIORITY_COLORS, STATUS_STYLES, toLocal, MONTH_NAMES } from './calendarTypes';
import CalendarAvatar from './CalendarAvatar';

export type ListMode = 'semaine' | 'mois';

interface Props {
  tasks: Task[];
  projects: Project[];
  weekStart: Date;
  year: number;
  month: number;
  listMode: ListMode;
  onTaskClick: (t: Task) => void;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

const CalendarListView: React.FC<Props> = ({ tasks, projects, weekStart, year, month, listMode, onTaskClick }) => {
  const rangeStart = listMode === 'semaine'
    ? weekStart
    : new Date(year, month, 1);

  const rangeEnd = listMode === 'semaine'
    ? (() => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + 6); d.setHours(23, 59, 59, 999); return d; })()
    : new Date(year, month + 1, 0, 23, 59, 59, 999);

  const filtered = tasks.filter(t => {
    if (!t.dateDebut && !t.dateFin) return false;
    const s = t.dateDebut ? toLocal(t.dateDebut) : null;
    const e = t.dateFin   ? toLocal(t.dateFin)   : null;
    const start = s || e!;
    const end   = e || s!;
    return start <= rangeEnd && end >= rangeStart;
  });

  const byProject = new Map<string, Task[]>();
  for (const task of filtered) {
    if (!byProject.has(task.projectId)) byProject.set(task.projectId, []);
    byProject.get(task.projectId)!.push(task);
  }

  const emptyLabel = listMode === 'semaine'
    ? 'Aucune tâche planifiée cette semaine'
    : `Aucune tâche planifiée en ${MONTH_NAMES[month]}`;

  if (byProject.size === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EEF0F6', padding: '64px 24px', textAlign: 'center', color: '#C4C9D4', fontSize: 13, fontWeight: 600, boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
        {emptyLabel}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {[...byProject.entries()].map(([projectId, projectTasks]) => {
        const project = projects.find(p => p.id === projectId);

        // Build user groups
        const userGroups = new Map<string, { user: Task['assignee'] | null; tasks: Task[] }>();
        for (const task of projectTasks) {
          const key = task.assigneeId || '__none__';
          if (!userGroups.has(key)) userGroups.set(key, { user: task.assignee ?? null, tasks: [] });
          userGroups.get(key)!.tasks.push(task);
        }
        const groups = [...userGroups.values()].sort((a, b) => {
          if (!a.user && b.user) return 1;
          if (a.user && !b.user) return -1;
          return (a.user?.username || '').localeCompare(b.user?.username || '');
        });

        return (
          <div key={projectId} style={{ background: '#fff', borderRadius: 20, border: '1px solid #EEF0F6', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.05)' }}>

            {/* ── Project header ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', background: '#F8FAFC', borderBottom: '2px solid #EEF0F6' }}>
              <div style={{ flexShrink: 0 }}>
                {project?.logo
                  ? (project.logo.startsWith('http') || project.logo.startsWith('data:')
                      ? <img src={project.logo} style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} alt="" />
                      : <span style={{ fontSize: 24 }}>{project.logo}</span>)
                  : <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: '#6366f1' }}>
                      {(project?.nom || 'P')[0]}
                    </div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: '#1A1D2E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {project?.nom || 'Projet inconnu'}
                </p>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: 99, background: '#EEF2FF', color: '#6366f1', fontSize: 11, fontWeight: 800 }}>
                {projectTasks.length} tâche{projectTasks.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* ── User groups ── */}
            {groups.map((group, gi) => (
              <div key={group.user?.id || '__none__'} style={{ borderTop: gi > 0 ? '1px solid #F1F5F9' : 'none' }}>

                {/* User header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', background: '#FCFCFD' }}>
                  {group.user
                    ? <CalendarAvatar user={group.user} size={32} />
                    : <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px dashed #E2E8F0' }}>
                        <span style={{ fontSize: 14, color: '#CBD5E1' }}>?</span>
                      </div>
                  }
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#374151' }}>
                      {group.user ? `@${group.user.username}` : 'Non assigné'}
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>
                      {group.tasks.length} tâche{group.tasks.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Task rows */}
                <div style={{ borderTop: '1px solid #F8FAFC' }}>
                  {group.tasks.map((task, idx) => {
                    const status = STATUS_STYLES[task.statut] || STATUS_STYLES.TODO;
                    const color  = PRIORITY_COLORS[task.priorite] || '#6366f1';
                    const isLast = idx === group.tasks.length - 1;
                    return (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 16,
                          padding: '14px 24px 14px 68px',
                          borderBottom: isLast ? 'none' : '1px solid #F8FAFC',
                          cursor: 'pointer', transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        {/* Priority bar */}
                        <div style={{ width: 4, alignSelf: 'stretch', minHeight: 20, borderRadius: 99, background: color, flexShrink: 0 }} />

                        {/* Title + progress */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#1A1D2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {task.titre}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 80, height: 4, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${task.progression}%`, background: task.progression >= 100 ? '#22c55e' : color, borderRadius: 99 }} />
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 800, fontFamily: 'monospace', color: '#9CA3AF' }}>
                              {Math.round(task.progression)}%
                            </span>
                          </div>
                        </div>

                        {/* Dates */}
                        {(task.dateDebut || task.dateFin) && (
                          <div style={{ fontSize: 12, color: '#6B7280', textAlign: 'right', flexShrink: 0, lineHeight: 1.7 }}>
                            {task.dateDebut && (
                              <div><span style={{ fontWeight: 700, color: '#9CA3AF' }}>Début </span>{fmtDate(task.dateDebut)}</div>
                            )}
                            {task.dateFin && (
                              <div><span style={{ fontWeight: 700, color: '#9CA3AF' }}>Fin </span>{fmtDate(task.dateFin)}</div>
                            )}
                          </div>
                        )}

                        {/* Blocage */}
                        {task.blocage && (
                          <span style={{ padding: '4px 10px', borderRadius: 8, background: '#FEF2F2', color: '#DC2626', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                            🔴 Blocage
                          </span>
                        )}

                        {/* Status badge */}
                        <span style={{ padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 800, background: status.bg, color: status.text, flexShrink: 0, letterSpacing: '0.03em' }}>
                          {task.statut.replace(/_/g, ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default CalendarListView;
