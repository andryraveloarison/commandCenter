import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiService from '@services/api';
import type { Period } from '@components/dashboard';
import {
  DashboardPeriodFilter,
  DashboardGlobalSection,
  DashboardProjectsSection,
  DashboardInterventionsSection,
  STATUS_PROJ, STATUS_TASK, PRIO, STATUS_INTERV,
  avatarColor,
  getPeriodRange, filterByRange, buildEvolution,
} from '@components/dashboard';
import type { DashboardView } from '@components/dashboard';

const DashboardPage: React.FC = () => {
  const [view,        setView]        = useState<DashboardView>('global');
  const [period, setPeriod]           = useState<Period>('annee');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd]     = useState('');

  const { data: projects      = [] } = useQuery({ queryKey: ['projects'],      queryFn: () => apiService.getProjects().then(r => r.data) });
  const { data: tasks         = [] } = useQuery({ queryKey: ['tasks'],          queryFn: () => apiService.getTasks().then(r => r.data) });
  const { data: users         = [] } = useQuery({ queryKey: ['users'],          queryFn: () => apiService.getUsers().then(r => r.data) });
  const { data: interventions = [] } = useQuery({ queryKey: ['interventions'],  queryFn: () => apiService.getInterventions().then(r => r.data) });

  const range = useMemo(() => getPeriodRange(period, customStart, customEnd), [period, customStart, customEnd]);

  const filteredProjects      = useMemo(() => filterByRange(projects, 'createdAt', range), [projects, range]);
  const filteredTasks         = useMemo(() => {
    const dated = tasks.map((t: any) => ({ ...t, _date: t.dateDebut ?? t.createdAt }));
    return filterByRange(dated, '_date', range);
  }, [tasks, range]);
  const filteredInterventions = useMemo(() => {
    const dated = interventions.map((i: any) => ({ ...i, _date: i.dateIntervention ?? i.createdAt }));
    return filterByRange(dated, '_date', range);
  }, [interventions, range]);

  // ── Projets data ────────────────────────────────────────────────────────────
  const projStatusData = Object.entries(STATUS_PROJ)
    .map(([k, v]) => ({ ...v, value: filteredProjects.filter((p: any) => p.statut === k).length }))
    .filter(d => d.value > 0);

  const taskStatusData = Object.entries(STATUS_TASK)
    .map(([k, v]) => ({ ...v, value: filteredTasks.filter((t: any) => t.statut === k).length }))
    .filter(d => d.value > 0);

  const prioData = Object.entries(PRIO)
    .map(([k, v]) => ({ ...v, value: filteredProjects.filter((p: any) => p.priorite === k).length }))
    .filter(d => d.value > 0);

  const evolutionData = [...filteredProjects]
    .sort((a: any, b: any) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
    .map((p: any) => ({ nom: p.nom.length > 14 ? p.nom.slice(0, 12) + '…' : p.nom, progression: Math.round(p.progressionGlobale) }));

  const tasksByUser = users.map((u: any) => ({
    nom:        u.username.length > 12 ? u.username.slice(0, 10) + '…' : u.username,
    fullNom:    u.username,
    id:         u.id,
    photo:      u.photo,
    done:       filteredTasks.filter((t: any) => t.assigneeId === u.id && t.statut === 'COMPLETEE').length,
    inProgress: filteredTasks.filter((t: any) => t.assigneeId === u.id && t.statut === 'EN_COURS').length,
    todo:       filteredTasks.filter((t: any) => t.assigneeId === u.id && t.statut === 'TODO').length,
    total:      filteredTasks.filter((t: any) => t.assigneeId === u.id).length,
  })).filter((u: any) => u.total > 0).sort((a: any, b: any) => b.total - a.total);

  const ranking = [...tasksByUser]
    .map((u: any) => ({ ...u, rate: u.total > 0 ? Math.round((u.done / u.total) * 100) : 0 }))
    .sort((a: any, b: any) => b.rate - a.rate || b.done - a.done);

  const projProgressData = [...filteredProjects]
    .sort((a: any, b: any) => b.progressionGlobale - a.progressionGlobale)
    .map((p: any) => ({ nom: p.nom.length > 16 ? p.nom.slice(0, 14) + '…' : p.nom, progression: Math.round(p.progressionGlobale), fill: STATUS_PROJ[p.statut]?.color ?? '#0f172a' }));

  const radarProjects = filteredProjects.slice(0, 5);
  const radarData = [
    { metric: 'Progression', ...Object.fromEntries(radarProjects.map((p: any) => [p.id, Math.round(p.progressionGlobale)])) },
    { metric: 'Équipe',      ...Object.fromEntries(radarProjects.map((p: any) => [p.id, Math.min((p.teams?.length ?? 0) * 20, 100)])) },
    { metric: 'Tâches',      ...Object.fromEntries(radarProjects.map((p: any) => [p.id, Math.min((p.tasks?.length ?? 0) * 12, 100)])) },
    { metric: 'Priorité',    ...Object.fromEntries(radarProjects.map((p: any) => [p.id, { BASSE: 25, MOYENNE: 50, HAUTE: 75, CRITIQUE: 100 }[p.priorite as string] ?? 50])) },
  ];

  // ── Interventions data ──────────────────────────────────────────────────────
  const intervStats = {
    total:     filteredInterventions.length,
    enAttente: filteredInterventions.filter((i: any) => i.statut === 'EN_ATTENTE').length,
    enCours:   filteredInterventions.filter((i: any) => i.statut === 'EN_COURS').length,
    resolu:    filteredInterventions.filter((i: any) => i.statut === 'RESOLU').length,
  };

  const intervStatusData = Object.entries(STATUS_INTERV)
    .map(([k, v]) => ({ label: v.label, color: v.dot, value: filteredInterventions.filter((i: any) => i.statut === k).length }))
    .filter(d => d.value > 0);

  const isIntervenant = (intervention: any, userId: string) =>
    intervention.intervenants?.some((iv: any) => iv.user?.id === userId) ?? false;

  const intervByUser = users.map((u: any) => ({
    nom:       u.username.length > 12 ? u.username.slice(0, 10) + '…' : u.username,
    fullNom:   u.username,
    id:        u.id,
    photo:     u.photo,
    resolu:    filteredInterventions.filter((i: any) => isIntervenant(i, u.id) && i.statut === 'RESOLU').length,
    enCours:   filteredInterventions.filter((i: any) => isIntervenant(i, u.id) && i.statut === 'EN_COURS').length,
    enAttente: filteredInterventions.filter((i: any) => isIntervenant(i, u.id) && i.statut === 'EN_ATTENTE').length,
    total:     filteredInterventions.filter((i: any) => isIntervenant(i, u.id)).length,
  })).filter((u: any) => u.total > 0).sort((a: any, b: any) => b.total - a.total);

  const intervRanking = [...intervByUser]
    .map((u: any) => ({ ...u, rate: u.total > 0 ? Math.round((u.resolu / u.total) * 100) : 0 }))
    .sort((a: any, b: any) => b.rate - a.rate || b.resolu - a.resolu);

  const intervEvolution = useMemo(
    () => buildEvolution(filteredInterventions, period, customStart, customEnd),
    [filteredInterventions, period, customStart, customEnd]
  );

  const recentInterventions = [...filteredInterventions]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const siteData = (() => {
    const map = new Map<string, number>();
    filteredInterventions.forEach((iv: any) => {
      const nom = iv.site?.nom ?? 'Sans site';
      map.set(nom, (map.get(nom) ?? 0) + 1);
    });
    const colors = ['#6366F1','#10B981','#F59E0B','#EF4444','#3B82F6','#8B5CF6','#14B8A6','#EC4899'];
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ label, value, color: colors[i % colors.length] }));
  })();

  const demandeurRanking = (() => {
    const map = new Map<string, number>();
    filteredInterventions.forEach((iv: any) => {
      const nom = iv.demandeur?.nom ?? 'Inconnu';
      map.set(nom, (map.get(nom) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nom, count]) => ({ nom, count }));
  })();

  return (
    <div className="space-y-14 pb-4">
      <DashboardPeriodFilter
        view={view} setView={setView}
        period={period} setPeriod={setPeriod}
        customStart={customStart} setCustomStart={setCustomStart}
        customEnd={customEnd} setCustomEnd={setCustomEnd}
        range={range}
      />

      {(view === 'global') && (
        <DashboardGlobalSection
          projects={filteredProjects}
          filteredTasks={filteredTasks}
          filteredInterventions={filteredInterventions}
          users={users}
          projStatusData={projStatusData}
          taskStatusData={taskStatusData}
          intervStatusData={intervStatusData}
        />
      )}

      {(view === 'projets') && (
        <DashboardProjectsSection
          projects={filteredProjects}
          filteredTasks={filteredTasks}
          evolutionData={evolutionData}
          tasksByUser={tasksByUser}
          ranking={ranking}
          projProgressData={projProgressData}
          radarData={radarData}
          radarProjects={radarProjects}
        />
      )}

      {(view === 'interventions') && (
        <DashboardInterventionsSection
          filteredInterventions={filteredInterventions}
          intervStats={intervStats}
          intervStatusData={intervStatusData}
          intervByUser={intervByUser}
          intervRanking={intervRanking}
          intervEvolution={intervEvolution}
          recentInterventions={recentInterventions}
          siteData={siteData}
          demandeurRanking={demandeurRanking}
          period={period}
        />
      )}
    </div>
  );
};

export default DashboardPage;
