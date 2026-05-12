import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '@store/store';
import apiService from '@services/api';
import type { Task, User } from '@types/index';

const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const PRIORITY_COLORS: Record<string, string> = {
  CRITIQUE: '#ef4444',
  HAUTE: '#f97316',
  MOYENNE: '#6366f1',
  BASSE: '#22c55e',
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  TODO: { bg: '#F1F5F9', text: '#64748B' },
  EN_COURS: { bg: '#EEF2FF', text: '#1f1a77ff' },
  EN_REVIEW: { bg: '#FAF5FF', text: '#431c85ff' },
  COMPLETEE: { bg: '#F0FDF4', text: '#126430ff' },
  BLOQUEE: { bg: '#FEF2F2', text: '#6e1414ff' },
};

const fmtFull = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Monday-first
};

const isSameDay = (dateStr: string, year: number, month: number, day: number) => {
  const d = new Date(dateStr);
  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
};

interface TaskPillProps { task: Task; onClick: () => void }
const TaskPill: React.FC<TaskPillProps> = ({ task, onClick }) => {
  const color = PRIORITY_COLORS[task.priorite] || '#6366f1';
  const isBlocked = !!task.blocage;
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: isBlocked ? '#FEF2F2' : '#EEF2FF',
        borderLeft: `3px solid ${color}`,
        borderRadius: '0 6px 6px 0',
        padding: '2px 6px',
        width: '100%', textAlign: 'left',
        cursor: 'pointer', border: 'none',
        borderLeftColor: color,
        borderLeftStyle: 'solid',
        borderLeftWidth: 3,
      }}
    >
      {isBlocked && <span style={{ fontSize: 8, flexShrink: 0 }}>🔴</span>}
      <span style={{ fontSize: 10, fontWeight: 700, color: isBlocked ? '#DC2626' : '#4F46E5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {task.titre}
      </span>
    </button>
  );
};

interface DetailPanelProps { task: Task; onClose: () => void }
const DetailPanel: React.FC<DetailPanelProps> = ({ task, onClose }) => {
  const status = STATUS_STYLES[task.statut] || STATUS_STYLES.TODO;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.15)' }} />
      <div style={{
        position: 'fixed', right: 24, top: '50%', transform: 'translateY(-50%)',
        width: 340, background: '#fff', borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 99,
        padding: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ flex: 1, paddingRight: 8 }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#1A1D2E', margin: 0, lineHeight: 1.3 }}>{task.titre}</p>
            {task.assignee && (
              <p style={{ fontSize: 11, color: '#9CA3AF', margin: '4px 0 0', fontWeight: 500 }}>
                Assigné à {task.assignee.nom}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#C4C9D4', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: status.bg, color: status.text }}>
            {task.statut.replace('_', ' ')}
          </span>
          <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: '#F9FAFB', color: PRIORITY_COLORS[task.priorite] || '#6366f1' }}>
            {task.priorite}
          </span>
        </div>

        {(task.dateDebut || task.dateFin) && (
          <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
            {task.dateDebut && (
              <div style={{ fontSize: 11, color: '#6B7280', marginBottom: task.dateFin ? 6 : 0 }}>
                <span style={{ fontWeight: 700, color: '#374151' }}>Début : </span>
                {fmtFull(task.dateDebut)}
              </div>
            )}
            {task.dateFin && (
              <div style={{ fontSize: 11, color: '#6B7280' }}>
                <span style={{ fontWeight: 700, color: '#374151' }}>Fin : </span>
                {fmtFull(task.dateFin)}
              </div>
            )}
          </div>
        )}

        {task.situation && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#C4C9D4', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Situation</p>
            <p style={{ fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.5 }}>{task.situation}</p>
          </div>
        )}

        {task.blocage && (
          <div style={{ background: '#FEF2F2', borderRadius: 12, padding: '12px 14px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#FCA5A5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>🔴 Blocage</p>
            <p style={{ fontSize: 12, color: '#811d1dff', margin: 0, lineHeight: 1.5, fontWeight: 600 }}>{task.blocage}</p>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${task.progression}%`, background: task.progression >= 100 ? '#22c55e' : '#6366f1', borderRadius: 99, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#374151', fontFamily: 'monospace' }}>{Math.round(task.progression)}%</span>
          </div>
        </div>
      </div>
    </>
  );
};

const CalendarPage: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [filterUser, setFilterUser] = useState<string>(currentUser?.id || '');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');

  const { data: allTasks = [] } = useQuery({
    queryKey: ['tasks-all'],
    queryFn: () => apiService.getTasks().then(r => r.data as Task[]),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.getUsers().then(r => r.data as User[]),
  });

  const tasks = useMemo(() => {
    if (!filterUser) return allTasks;
    return allTasks.filter(t => t.assigneeId === filterUser || t.assignee?.id === filterUser);
  }, [allTasks, filterUser]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const getTasksForDay = (day: number): Task[] =>
    tasks.filter(t =>
      (t.dateDebut && isSameDay(t.dateDebut, year, month, day)) ||
      (t.dateFin && isSameDay(t.dateFin, year, month, day))
    );

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const listTasks = useMemo(() => {
    return [...tasks]
      .filter(t => t.dateDebut || t.dateFin)
      .sort((a, b) => {
        const da = new Date(a.dateDebut || a.dateFin || '').getTime();
        const db = new Date(b.dateDebut || b.dateFin || '').getTime();
        return da - db;
      });
  }, [tasks]);

  const tasksWithBlockage = tasks.filter(t => t.blocage);

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={prevMonth} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #EEF0F6', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#6B7280' }}>‹</button>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 20, color: '#1A1D2E', fontFamily: 'Montserrat' }}>
              {MONTH_NAMES[month]} {year}
            </p>
          </div>
          <button onClick={nextMonth} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #EEF0F6', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#6B7280' }}>›</button>
          <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #EEF0F6', background: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#6B7280' }}>Aujourd'hui</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Filter user */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF' }}>Filtrer :</span>
            <select
              value={filterUser}
              onChange={e => setFilterUser(e.target.value)}
              style={{ fontSize: 12, fontWeight: 700, color: '#1A1D2E', border: '1px solid #EEF0F6', borderRadius: 10, padding: '6px 10px', background: '#fff', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">Toute l'équipe</option>
              {currentUser && <option value={currentUser.id}>Moi ({currentUser.nom})</option>}
              {users.filter(u => u.id !== currentUser?.id).map(u => (
                <option key={u.id} value={u.id}>{u.nom}</option>
              ))}
            </select>
          </div>

          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid #EEF0F6', borderRadius: 10, overflow: 'hidden' }}>
            {(['month', 'list'] as const).map(v => (
              <button key={v} onClick={() => setViewMode(v)} style={{
                padding: '6px 14px', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                background: viewMode === v ? '#6366f1' : '#fff',
                color: viewMode === v ? '#fff' : '#9CA3AF',
              }}>
                {v === 'month' ? 'Mois' : 'Liste'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          {
            label: 'Tâches ce mois', value: tasks.filter(t => {
              const inMonth = (d?: string) => d && new Date(d).getFullYear() === year && new Date(d).getMonth() === month;
              return inMonth(t.dateDebut) || inMonth(t.dateFin);
            }).length, color: '#323399ff', bg: '#EEF2FF'
          },
          { label: 'Avec blocage', value: tasksWithBlockage.length, color: '#802222ff', bg: '#FEF2F2' },
          { label: 'Complétées', value: tasks.filter(t => t.statut === 'COMPLETEE').length, color: '#063718ff', bg: '#F0FDF4' },
          { label: 'En cours', value: tasks.filter(t => t.statut === 'EN_COURS').length, color: '#744204ff', bg: '#FFF7ED' },
        ].map(stat => (
          <div key={stat.label} style={{ flex: 1, background: stat.bg, borderRadius: 14, padding: '12px 16px' }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</p>
            <p style={{ margin: '4px 0 0', fontSize: 10, fontWeight: 600, color: stat.color, opacity: 0.7 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {viewMode === 'month' ? (
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EEF0F6', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #F1F5F9' }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{ padding: '12px 8px', textAlign: 'center', fontSize: 10, fontWeight: 800, color: '#C4C9D4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {Array.from({ length: totalCells }, (_, i) => {
              const dayNum = i - firstDay + 1;
              const isValid = dayNum >= 1 && dayNum <= daysInMonth;
              const isToday = isValid && dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const dayTasks = isValid ? getTasksForDay(dayNum) : [];

              return (
                <div
                  key={i}
                  style={{
                    minHeight: 100,
                    padding: '8px 6px 6px',
                    borderRight: (i + 1) % 7 !== 0 ? '1px solid #F8FAFC' : 'none',
                    borderBottom: '1px solid #F8FAFC',
                    background: isToday ? '#F8F9FF' : isValid ? '#fff' : '#FAFBFC',
                    position: 'relative',
                  }}
                >
                  {isValid && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                        <span style={{
                          width: 24, height: 24, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: isToday ? 800 : 500,
                          color: isToday ? '#fff' : '#6B7280',
                          background: isToday ? '#303292ff' : 'transparent',
                        }}>
                          {dayNum}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {dayTasks.slice(0, 3).map(t => (
                          <TaskPill key={t.id} task={t} onClick={() => setSelectedTask(t)} />
                        ))}
                        {dayTasks.length > 3 && (
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', paddingLeft: 4 }}>
                            +{dayTasks.length - 3} autres
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List view */
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EEF0F6', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
          {listTasks.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#C4C9D4', fontSize: 13, fontWeight: 600 }}>
              Aucune tâche avec des dates planifiées
            </div>
          ) : (
            listTasks.map((task, idx) => {
              const status = STATUS_STYLES[task.statut] || STATUS_STYLES.TODO;
              const color = PRIORITY_COLORS[task.priorite] || '#31338dff';
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '14px 24px',
                    borderBottom: idx < listTasks.length - 1 ? '1px solid #F8FAFC' : 'none',
                    cursor: 'pointer', transition: 'background 0.1s',
                  }}
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
                    {task.dateFin && <div><span style={{ fontWeight: 600 }}>Fin : </span>{new Date(task.dateFin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</div>}
                  </div>
                  {task.situation && (
                    <p style={{ margin: 0, fontSize: 11, color: '#6B7280', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>
                      {task.situation}
                    </p>
                  )}
                  {task.blocage && (
                    <span style={{ padding: '3px 8px', borderRadius: 6, background: '#FEF2F2', color: '#DC2626', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                      🔴 Blocage
                    </span>
                  )}
                  <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: status.bg, color: status.text, flexShrink: 0 }}>
                    {task.statut.replace('_', ' ')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      {selectedTask && (
        <DetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
};

export default CalendarPage;
