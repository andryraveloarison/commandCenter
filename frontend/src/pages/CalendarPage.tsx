import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '@store/store';
import apiService from '@services/api';
import type { Task, User, Project, LocalIntervention, ViewMode, ContentType } from '@components/calendar';
import {
  CalendarUserFilter,
  CalendarStatsBar,
  CalendarGanttView,
  CalendarMonthView,
  CalendarListView,
  CalendarInterventionView,
  CalendarDetailPanel,
  CalendarInterventionPanel,
  MONTH_NAMES,
  toLocal,
} from '@components/calendar';

const CalendarPage: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const today = new Date();

  const [year, setYear]                   = useState(today.getFullYear());
  const [month, setMonth]                 = useState(today.getMonth());
  const [filterUser, setFilterUser]       = useState<string>(currentUser?.id || '');
  const [selectedTask, setSelectedTask]   = useState<Task | null>(null);
  const [selectedIv, setSelectedIv]       = useState<LocalIntervention | null>(null);
  const [viewMode, setViewMode]           = useState<ViewMode>('month');
  const [contentType, setContentType]     = useState<ContentType>('projets');

  const { data: allTasks     = [] } = useQuery({ queryKey: ['tasks-all'],    queryFn: () => apiService.getTasks().then(r => r.data as Task[]) });
  const { data: users        = [] } = useQuery({ queryKey: ['users'],         queryFn: () => apiService.getUsers().then(r => r.data as User[]) });
  const { data: projects     = [] } = useQuery({ queryKey: ['projects'],      queryFn: () => apiService.getProjects().then(r => r.data as Project[]) });
  const { data: interventions = [] } = useQuery({ queryKey: ['interventions'], queryFn: () => apiService.getInterventions().then(r => r.data as LocalIntervention[]) });

  const allUsers = useMemo(() => {
    const list = [...users];
    if (currentUser && !list.find(u => u.id === currentUser.id)) list.unshift(currentUser as User);
    return list;
  }, [users, currentUser]);

  const tasks = useMemo(() =>
    filterUser ? allTasks.filter(t => t.assigneeId === filterUser || t.assignee?.id === filterUser) : allTasks,
    [allTasks, filterUser]
  );

  const filteredInterventions = useMemo(() =>
    filterUser
      ? interventions.filter(i => i.intervenants?.some(iv => iv.user.id === filterUser))
      : interventions,
    [interventions, filterUser]
  );

  const tasksThisMonth = useMemo(() => {
    const ms = new Date(year, month, 1);
    const me = new Date(year, month + 1, 0);
    return tasks.filter(t => {
      const s = t.dateDebut ? toLocal(t.dateDebut) : null;
      const e = t.dateFin   ? toLocal(t.dateFin)   : null;
      if (s && e) return s <= me && e >= ms;
      if (s) return s >= ms && s <= me;
      if (e) return e >= ms && e <= me;
      return false;
    });
  }, [tasks, year, month]);

  const interventionsThisMonth = useMemo(() => {
    const ms = new Date(year, month, 1);
    const me = new Date(year, month + 1, 0);
    return filteredInterventions.filter(i => {
      const d = toLocal(i.dateIntervention || i.createdAt);
      return d >= ms && d <= me;
    });
  }, [filteredInterventions, year, month]);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const btnBase: React.CSSProperties = {
    border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: 'all 0.15s',
  };

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={prevMonth} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #EEF0F6', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#6B7280' }}>‹</button>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 20, color: '#1A1D2E', fontFamily: 'Montserrat', minWidth: 160, textAlign: 'center' }}>
            {MONTH_NAMES[month]} {year}
          </p>
          <button onClick={nextMonth} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #EEF0F6', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#6B7280' }}>›</button>
          <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #EEF0F6', background: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#6B7280' }}>
            Aujourd'hui
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Projets / Interventions */}
          <div style={{ display: 'flex', border: '1px solid #EEF0F6', borderRadius: 10, overflow: 'hidden' }}>
            {(['projets', 'interventions'] as const).map(ct => (
              <button key={ct} onClick={() => setContentType(ct)} style={{ ...btnBase, padding: '6px 16px', background: contentType === ct ? '#1A1D2E' : '#fff', color: contentType === ct ? '#fff' : '#9CA3AF' }}>
                {ct === 'projets' ? 'Projets' : 'Interventions'}
              </button>
            ))}
          </div>

          {/* View mode (projets only) */}
          {contentType === 'projets' && (
            <div style={{ display: 'flex', border: '1px solid #EEF0F6', borderRadius: 10, overflow: 'hidden' }}>
              {(['month', 'gantt', 'list'] as const).map(v => (
                <button key={v} onClick={() => setViewMode(v)} style={{ ...btnBase, padding: '6px 14px', background: viewMode === v ? '#6366f1' : '#fff', color: viewMode === v ? '#fff' : '#9CA3AF' }}>
                  {v === 'month' ? 'Mois' : v === 'gantt' ? 'Gantt' : 'Liste'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── User filter ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF' }}>Filtrer :</span>
        <CalendarUserFilter users={allUsers} value={filterUser} onChange={setFilterUser} currentUserId={currentUser?.id} />
      </div>

      {/* ── Stats ── */}
      <CalendarStatsBar
        contentType={contentType}
        tasksThisMonth={tasksThisMonth}
        interventionsThisMonth={interventionsThisMonth}
      />

      {/* ── Views ── */}
      {contentType === 'projets' ? (
        viewMode === 'gantt' ? (
          <CalendarGanttView tasks={tasks} projects={projects} year={year} month={month} onTaskClick={setSelectedTask} />
        ) : viewMode === 'month' ? (
          <CalendarMonthView tasks={tasks} year={year} month={month} onTaskClick={setSelectedTask} />
        ) : (
          <CalendarListView tasks={tasks} onTaskClick={setSelectedTask} />
        )
      ) : (
        <CalendarInterventionView interventions={filteredInterventions} year={year} month={month} onInterventionClick={setSelectedIv} />
      )}

      {/* ── Detail panels ── */}
      {selectedTask && <CalendarDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} />}
      {selectedIv   && <CalendarInterventionPanel iv={selectedIv} onClose={() => setSelectedIv(null)} />}
    </div>
  );
};

export default CalendarPage;
