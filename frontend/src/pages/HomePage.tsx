import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import type { RootState } from '@store/store';
import apiService from '@services/api';
import HomeHeader from '@components/home/HomeHeader';
import HomeProfilePanel from '@components/home/HomeProfilePanel';
import HomeProgressCard from '@components/home/HomeProgressCard';
import HomeYearProgress from '@components/home/HomeYearProgress';
import HomeGanttChart from '@components/home/HomeGanttChart';
import HomeOnboardingCard from '@components/home/HomeOnboardingCard';
import HomeTasksPanel from '@components/home/HomeTasksPanel';

const HomePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: myTasks      = [] } = useQuery({ queryKey: ['tasks-by-user', user?.id], queryFn: () => apiService.getTasksByUser(user!.id).then(r => r.data), enabled: !!user?.id });
  const { data: projects     = [] } = useQuery({ queryKey: ['projects'],      queryFn: () => apiService.getProjects().then(r => r.data) });
  const { data: interventions= [] } = useQuery({ queryKey: ['interventions'], queryFn: () => apiService.getInterventions().then(r => r.data) });

  const total = myTasks.length || 1;
  const kpis = [
    { label: 'À faire',   pct: Math.round(myTasks.filter((t: any) => t.statut === 'TODO').length / total * 100),        color: '#22C55E' },
    { label: 'En cours',  pct: Math.round(myTasks.filter((t: any) => t.statut === 'EN_COURS').length / total * 100),    color: '#22C55E' },
    { label: 'Projets',   pct: Math.round(projects.filter((p: any) => p.statut === 'EN_COURS').length / (projects.length || 1) * 100), color: '#6366F1' },
    { label: 'Terminées', pct: Math.round(myTasks.filter((t: any) => t.statut === 'COMPLETEE').length / total * 100),   color: '#9CA3AF' },
  ];

  const myProjects  = projects.filter((p: any) =>
    p.teams?.some((t: any) => (t.userId ?? t.user?.id) === user?.id)
  );
  const myIntvCount = interventions.filter((i: any) => i.intervenants?.some((iv: any) => iv.user?.id === user?.id)).length;

  const stats = [
    { value: myTasks.length,    label: 'Tâches' },
    { value: myProjects.length, label: 'Projets' },
    { value: myIntvCount,       label: 'Interventions' },
  ];

  const startOfWeek = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const tasksByDay = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const day  = new Date(startOfWeek); day.setDate(startOfWeek.getDate() + i);
      const next = new Date(day);         next.setDate(day.getDate() + 1);
      return myTasks.filter((t: any) => {
        const dt = t.dateDebut ? new Date(t.dateDebut) : null;
        return dt && dt >= day && dt < next;
      }).length;
    }), [myTasks, startOfWeek]);

  return (
    <div style={{ height: 'calc(100vh - 108px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <HomeHeader username={user?.username ?? '—'} role={user?.role} kpis={kpis} stats={stats} />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '230px 1fr 268px', gap: 16, minHeight: 0, alignItems: 'stretch' }}>
        <HomeProfilePanel user={user} myTasks={myTasks} projects={myProjects} interventions={interventions} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flexShrink: 0 }}>
            <HomeProgressCard tasksByDay={tasksByDay} myTasks={myTasks} />
            <HomeYearProgress />
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <HomeGanttChart myTasks={myTasks} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
          <HomeOnboardingCard projects={myProjects} />
          <div style={{ flex: 1, minHeight: 0 }}>
            <HomeTasksPanel myTasks={myTasks} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
