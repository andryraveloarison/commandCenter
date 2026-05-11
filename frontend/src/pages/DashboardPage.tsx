import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiService from '@services/api';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

// ── Constantes ───────────────────────────────────────────────────────────────
const CHART_COLORS = ['#0f172a', '#3b82f6', '#22c55e', '#ef4444', '#f97316', '#8b5cf6', '#ec4899', '#14b8a6'];
const AVATAR_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#ec4899'];
const avatarColor = (id: string) => AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];

const STATUS_PROJ: Record<string, { label: string; color: string }> = {
  PREPARATION: { label: 'Préparation', color: '#94a3b8' },
  EN_COURS:    { label: 'En Cours',    color: '#3b82f6' },
  CRITIQUE:    { label: 'Critique',    color: '#ef4444' },
  TERMINE:     { label: 'Terminé',     color: '#22c55e' },
};
const STATUS_TASK: Record<string, { label: string; color: string }> = {
  TODO:       { label: 'À Faire',    color: '#cbd5e1' },
  EN_COURS:   { label: 'En Cours',   color: '#3b82f6' },
  EN_REVIEW:  { label: 'En Review',  color: '#f97316' },
  COMPLETEE:  { label: 'Complétée',  color: '#22c55e' },
  BLOQUEE:    { label: 'Bloquée',    color: '#ef4444' },
};
const PRIO: Record<string, { label: string; color: string }> = {
  BASSE:    { label: 'Basse',    color: '#22c55e' },
  MOYENNE:  { label: 'Moyenne',  color: '#f97316' },
  HAUTE:    { label: 'Haute',    color: '#ef4444' },
  CRITIQUE: { label: 'Critique', color: '#7c3aed' },
};

const TOOLTIP_STYLE = {
  borderRadius: '12px', border: 'none',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  fontSize: '11px', fontWeight: 700,
};

// ── Helpers visuels ──────────────────────────────────────────────────────────
const DonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.06) return null;
  const rad = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  return (
    <text
      x={cx + r * Math.cos(-midAngle * rad)}
      y={cy + r * Math.sin(-midAngle * rad)}
      fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={10} fontWeight="900"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Legend2 = ({ items }: { items: { label: string; color: string }[] }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
    {items.map((it, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: it.color }} />
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{it.label}</span>
      </div>
    ))}
  </div>
);

const Empty = () => (
  <div className="h-full flex items-center justify-center text-slate-200 text-[10px] font-black uppercase tracking-widest">
    Aucune donnée
  </div>
);

const ProjectLogo: React.FC<{ logo?: string; nom: string }> = ({ logo, nom }) => {
  if (!logo) return <span className="text-xl">{nom[0]?.toUpperCase() || '?'}</span>;
  if (logo.startsWith('http') || logo.startsWith('data:'))
    return <img src={logo} alt="" className="w-full h-full object-cover rounded-xl" />;
  return <span className="text-xl">{logo}</span>;
};

// ── Page principale ──────────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiService.getProjects().then(r => r.data),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiService.getTasks().then(r => r.data),
  });
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.getUsers().then(r => r.data),
  });

  // ── Données dérivées ─────────────────────────────────────────────────────
  const projStatusData = Object.entries(STATUS_PROJ)
    .map(([k, v]) => ({ ...v, value: projects.filter(p => p.statut === k).length }))
    .filter(d => d.value > 0);

  const taskStatusData = Object.entries(STATUS_TASK)
    .map(([k, v]) => ({ ...v, value: tasks.filter(t => t.statut === k).length }))
    .filter(d => d.value > 0);

  const prioData = Object.entries(PRIO)
    .map(([k, v]) => ({ ...v, value: projects.filter(p => p.priorite === k).length }))
    .filter(d => d.value > 0);

  // Courbe évolution (projets triés par date début)
  const evolutionData = [...projects]
    .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
    .map(p => ({
      nom: p.nom.length > 14 ? p.nom.slice(0, 12) + '…' : p.nom,
      progression: Math.round(p.progressionGlobale),
      fill: STATUS_PROJ[p.statut]?.color ?? '#0f172a',
    }));

  // Tâches par intervenant
  const tasksByUser = users.map(u => ({
    nom: u.nom.length > 12 ? u.nom.slice(0, 10) + '…' : u.nom,
    fullNom: u.nom,
    id: u.id,
    photo: u.photo,
    done:       tasks.filter(t => t.assigneeId === u.id && t.statut === 'COMPLETEE').length,
    inProgress: tasks.filter(t => t.assigneeId === u.id && t.statut === 'EN_COURS').length,
    todo:       tasks.filter(t => t.assigneeId === u.id && t.statut === 'TODO').length,
    total:      tasks.filter(t => t.assigneeId === u.id).length,
  })).filter(u => u.total > 0).sort((a, b) => b.total - a.total);

  // Classement par taux de completion
  const ranking = [...tasksByUser]
    .map(u => ({ ...u, rate: u.total > 0 ? Math.round((u.done / u.total) * 100) : 0 }))
    .sort((a, b) => b.rate - a.rate || b.done - a.done);

  // Barres horizontales progression projets
  const projProgressData = [...projects]
    .sort((a, b) => b.progressionGlobale - a.progressionGlobale)
    .map(p => ({
      nom: p.nom.length > 16 ? p.nom.slice(0, 14) + '…' : p.nom,
      progression: Math.round(p.progressionGlobale),
      fill: STATUS_PROJ[p.statut]?.color ?? '#0f172a',
    }));

  // Radar multi-projets (jusqu'à 5)
  const radarProjects = projects.slice(0, 5);
  const radarData = [
    { metric: 'Progression', ...Object.fromEntries(radarProjects.map(p => [p.id, Math.round(p.progressionGlobale)])) },
    { metric: 'Équipe',      ...Object.fromEntries(radarProjects.map(p => [p.id, Math.min((p.teams?.length ?? 0) * 20, 100)])) },
    { metric: 'Tâches',      ...Object.fromEntries(radarProjects.map(p => [p.id, Math.min((p.tasks?.length ?? 0) * 12, 100)])) },
    { metric: 'Priorité',    ...Object.fromEntries(radarProjects.map(p => [p.id, { BASSE: 25, MOYENNE: 50, HAUTE: 75, CRITIQUE: 100 }[p.priorite] ?? 50])) },
  ];

  return (
    <div className="space-y-10">

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Projets Totaux', value: projects.length,                                       color: 'text-slate-900' },
          { label: 'En Cours',       value: projects.filter(p => p.statut === 'EN_COURS').length,   color: 'text-blue-600'  },
          { label: 'Critiques',      value: projects.filter(p => p.statut === 'CRITIQUE').length,   color: 'text-red-500'   },
          { label: 'Terminés',       value: projects.filter(p => p.statut === 'TERMINE').length,    color: 'text-green-500' },
        ].map((s, i) => (
          <div key={i} className="premium-card">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{s.label}</p>
            <p className={`text-5xl font-black ${s.color} font-mono tracking-tighter leading-none`}>
              {s.value.toString().padStart(2, '0')}
            </p>
          </div>
        ))}
      </div>

      {/* ── Donuts × 3 ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Statuts Projets', data: projStatusData },
          { title: 'Statuts Tâches',  data: taskStatusData },
          { title: 'Priorités',       data: prioData },
        ].map(({ title, data }) => (
          <div key={title} className="premium-card">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">{title}</p>
            {data.length > 0 ? (
              <>
                <div className="h-[190px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data} cx="50%" cy="50%"
                        innerRadius={52} outerRadius={86}
                        paddingAngle={3} dataKey="value"
                        labelLine={false} label={DonutLabel}
                      >
                        {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <Legend2 items={data} />
              </>
            ) : (
              <div className="h-[190px]"><Empty /></div>
            )}
          </div>
        ))}
      </div>

      {/* ── Courbe d'évolution (AreaChart) ────────────────────────────────── */}
      <div className="premium-card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Courbe d'Évolution</p>
            <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">
              Progression des Projets
            </h2>
          </div>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest font-mono">
            {projects.length} projets
          </span>
        </div>
        {evolutionData.length > 0 ? (
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0f172a" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="nom" fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="4 2" strokeWidth={1} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v}%`, 'Progression']} />
                <Area
                  type="monotone" dataKey="progression"
                  stroke="#0f172a" strokeWidth={2.5}
                  fill="url(#areaGrad)"
                  dot={{ r: 5, fill: '#0f172a', stroke: 'white', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#0f172a', stroke: '#3b82f6', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[220px]"><Empty /></div>
        )}
      </div>

      {/* ── Tâches par user + Classement ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stacked bar */}
        <div className="lg:col-span-2 premium-card">
          <div className="mb-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyse Intervenants</p>
            <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">
              Tâches par Utilisateur
            </h2>
          </div>
          {tasksByUser.length > 0 ? (
            <>
              <div className="h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tasksByUser} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="nom" fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <YAxis fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="done"       name="Complétées" stackId="a" fill="#22c55e" />
                    <Bar dataKey="inProgress" name="En Cours"   stackId="a" fill="#3b82f6" />
                    <Bar dataKey="todo"       name="À Faire"    stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Legend2 items={[
                { label: 'Complétées', color: '#22c55e' },
                { label: 'En Cours',   color: '#3b82f6' },
                { label: 'À Faire',    color: '#cbd5e1' },
              ]} />
            </>
          ) : (
            <div className="h-[230px]"><Empty /></div>
          )}
        </div>

        {/* Classement */}
        <div className="premium-card">
          <div className="mb-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classement</p>
            <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">
              Top Intervenants
            </h2>
          </div>
          {ranking.length > 0 ? (
            <div className="space-y-4">
              {ranking.slice(0, 5).map((u, i) => (
                <div key={u.id} className="flex items-center gap-3">
                  <span className={`text-[11px] font-black w-5 text-center flex-shrink-0 ${
                    i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-400' : 'text-slate-200'
                  }`}>#{i + 1}</span>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: avatarColor(u.id) }}
                  >
                    {u.photo
                      ? <img src={u.photo} className="w-full h-full object-cover" alt="" />
                      : u.fullNom[0]
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-900 uppercase truncate">{u.fullNom}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-slate-900" style={{ width: `${u.rate}%` }} />
                      </div>
                      <span className="text-[9px] font-black font-mono text-slate-400 flex-shrink-0">{u.rate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[230px]"><Empty /></div>
          )}

          {ranking.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-50 space-y-2">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Résumé global</p>
              <div className="flex justify-between text-xs font-black text-slate-700">
                <span>{tasks.filter(t => t.statut === 'COMPLETEE').length} tâches terminées</span>
                <span>{tasks.length} total</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-slate-900"
                  style={{ width: tasks.length > 0 ? `${Math.round((tasks.filter(t => t.statut === 'COMPLETEE').length / tasks.length) * 100)}%` : '0%' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Radar + Barres horizontales ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Recharts multi-projets */}
        <div className="premium-card">
          <div className="mb-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyse Radar</p>
            <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">
              Performance Multi-Axes
            </h2>
          </div>
          {radarProjects.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  {radarProjects.map((p, i) => (
                    <Radar
                      key={p.id}
                      name={p.nom.length > 14 ? p.nom.slice(0, 12) + '…' : p.nom}
                      dataKey={p.id}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                      fillOpacity={0.08}
                      strokeWidth={2}
                    />
                  ))}
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend
                    wrapperStyle={{
                      fontSize: '9px', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px]"><Empty /></div>
          )}
        </div>

        {/* Barres horizontales progression */}
        <div className="premium-card">
          <div className="mb-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avancement</p>
            <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">
              Progression par Projet
            </h2>
          </div>
          {projProgressData.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projProgressData}
                  layout="vertical"
                  margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                >
                  <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="nom" width={95} fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v}%`, 'Progression']} />
                  <Bar dataKey="progression" radius={[0, 5, 5, 0]}>
                    {projProgressData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px]"><Empty /></div>
          )}
        </div>
      </div>

      {/* ── Opérations prioritaires (3 cards) ─────────────────────────────── */}
      <div>
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-black font-montserrat uppercase tracking-tight leading-none text-slate-900">
            Opérations <span className="text-slate-400 font-normal">Prioritaires</span>
          </h2>
          <Link
            to="/projects"
            className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b-2 border-slate-900 pb-1 hover:text-slate-600 transition-colors"
          >
            Voir tout le réseau
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {projects.slice(0, 3).map((project) => (
            <div key={project.id} className="premium-card flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  <ProjectLogo logo={project.logo} nom={project.nom} />
                </div>
                <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest`}
                  style={{ backgroundColor: (STATUS_PROJ[project.statut]?.color ?? '#94a3b8') + '18', color: STATUS_PROJ[project.statut]?.color ?? '#94a3b8' }}>
                  {project.statut}
                </span>
              </div>

              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">
                  ID_SYS_{project.id.slice(-4).toUpperCase()}
                </p>
                <h3 className="text-2xl font-black text-slate-900 mb-6 font-montserrat tracking-tight leading-tight uppercase">
                  {project.nom}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 tracking-widest">
                    <span>DÉPLOIEMENT</span>
                    <span className="text-slate-900 font-mono">{project.progressionGlobale.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${project.progressionGlobale}%`, backgroundColor: STATUS_PROJ[project.statut]?.color ?? '#0f172a' }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                <div className="flex -space-x-2">
                  {project.teams && project.teams.length > 0 ? (
                    project.teams.slice(0, 4).map(member => (
                      <div
                        key={member.id}
                        title={member.user?.nom}
                        className="w-7 h-7 rounded-lg border-2 border-white flex items-center justify-center text-[9px] font-black text-white uppercase overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: avatarColor(member.userId) }}
                      >
                        {member.user?.photo
                          ? <img src={member.user.photo} className="w-full h-full object-cover" alt="" />
                          : member.user?.nom?.[0] || '?'
                        }
                      </div>
                    ))
                  ) : (
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Aucun membre</span>
                  )}
                  {project.teams && project.teams.length > 4 && (
                    <div className="w-7 h-7 rounded-lg border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-600">
                      +{project.teams.length - 4}
                    </div>
                  )}
                </div>
                <Link
                  to={`/projects/${project.id}`}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                >
                  Détails →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
