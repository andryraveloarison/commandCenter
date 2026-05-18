import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { TOOLTIP_STYLE, CHART_COLORS, STATUS_PROJ, avatarColor } from './dashboardTypes';
import DashboardSectionHeader from './DashboardSectionHeader';
import DashboardLegend from './DashboardLegend';
import DashboardEmpty from './DashboardEmpty';
import DashboardProjectLogo from './DashboardProjectLogo';
import { useTheme } from '@store/ThemeContext';

interface Props {
  projects: any[];
  filteredTasks: any[];
  evolutionData: { nom: string; progression: number }[];
  tasksByUser: any[];
  ranking: any[];
  projProgressData: any[];
  radarData: any[];
  radarProjects: any[];
}

const PRIO_VALUE: Record<string, number> = { BASSE: 25, MOYENNE: 50, HAUTE: 75, CRITIQUE: 100 };

const getProjectMetrics = (p: any) => [
  { metric: 'Progression', label: `${Math.round(p.progressionGlobale)}%`,                              isPercent: true,  pct: Math.round(p.progressionGlobale) },
  { metric: 'Équipe',      label: `${p.teams?.length ?? 0} membre${p.teams?.length !== 1 ? 's' : ''}`, isPercent: false, pct: 0 },
  { metric: 'Tâches',      label: `${p.tasks?.length ?? 0} tâche${p.tasks?.length !== 1 ? 's' : ''}`,  isPercent: false, pct: 0 },
  { metric: 'Priorité',    label: p.priorite ?? 'N/A',                                                  isPercent: false, pct: 0 },
];

const DashboardProjectsSection: React.FC<Props> = ({
  projects, filteredTasks, evolutionData, tasksByUser,
  ranking, projProgressData, radarData, radarProjects,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const LINE_COLOR = isDark ? '#818CF8' : '#0f172a';
  const GRID_COLOR = isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9';

  const SELECT_STYLE: React.CSSProperties = {
    width: '100%', padding: '7px 10px', borderRadius: 8,
    border: '1.5px solid var(--border-color)', background: 'var(--bg-input)',
    fontSize: 11, fontWeight: 700, color: 'var(--text-primary)',
    cursor: 'pointer', outline: 'none',
  };

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const effectiveIds = selectedIds.length > 0
    ? selectedIds
    : radarProjects[0] ? [radarProjects[0].id] : [];

  const selectedProjects = effectiveIds
    .map(id => radarProjects.find((p: any) => p.id === id))
    .filter(Boolean);

  const updateSlot = (idx: number, id: string) => {
    const next = [...effectiveIds];
    next[idx] = id;
    setSelectedIds(next);
  };

  const addSlot = () => {
    const unused = radarProjects.find((p: any) => !effectiveIds.includes(p.id));
    if (unused) setSelectedIds([...effectiveIds, unused.id]);
  };

  const removeSlot = (idx: number) => {
    if (effectiveIds.length <= 1) return;
    setSelectedIds(effectiveIds.filter((_, i) => i !== idx));
  };

  const METRICS_LABELS = ['Progression', 'Équipe', 'Tâches', 'Priorité'];

  return (
  <div className="space-y-8">
    <DashboardSectionHeader label="Suivi" title="Projets" linkTo="/projects" linkLabel="Voir tous les projets" />

    {/* Progression curve */}
    <div className="premium-card">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Courbe d'Évolution</p>
          <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">Progression des Projets</h2>
        </div>
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest font-mono">{projects.length} projets</span>
      </div>
      {evolutionData.length > 0 ? (
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolutionData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={LINE_COLOR} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={LINE_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="nom" fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
              <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="4 2" strokeWidth={1} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v}%`, 'Progression']} />
              <Area type="monotone" dataKey="progression" stroke={LINE_COLOR} strokeWidth={2.5} fill="url(#areaGrad)"
                dot={{ r: 5, fill: LINE_COLOR, stroke: isDark ? '#161B2C' : 'white', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: LINE_COLOR, stroke: '#3b82f6', strokeWidth: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : <div className="h-[220px]"><DashboardEmpty /></div>}
    </div>

    {/* Tasks by user + ranking */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 premium-card">
        <div className="mb-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyse</p>
          <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">Tâches par Utilisateur</h2>
        </div>
        {tasksByUser.length > 0 ? (
          <>
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksByUser} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                  <XAxis dataKey="nom" fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                  <YAxis fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="done"       name="Complétées" stackId="a" fill="#22c55e" />
                  <Bar dataKey="inProgress" name="En Cours"   stackId="a" fill="#3b82f6" />
                  <Bar dataKey="todo"       name="À Faire"    stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <DashboardLegend items={[{ label: 'Complétées', color: '#22c55e' }, { label: 'En Cours', color: '#3b82f6' }, { label: 'À Faire', color: '#cbd5e1' }]} />
          </>
        ) : <div className="h-[230px]"><DashboardEmpty /></div>}
      </div>

      <div className="premium-card">
        <div className="mb-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classement</p>
          <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">Top Intervenants</h2>
        </div>
        {ranking.length > 0 ? (
          <div className="space-y-4">
            {ranking.slice(0, 5).map((u: any, i: number) => (
              <div key={u.id} className="flex items-center gap-3">
                <span className={`text-[11px] font-black w-5 text-center flex-shrink-0 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-400' : 'text-slate-200'}`}>#{i + 1}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 overflow-hidden" style={{ backgroundColor: avatarColor(u.id) }}>
                  {u.photo ? <img src={u.photo} className="w-full h-full object-cover" alt="" /> : u.fullNom[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-slate-900 uppercase truncate">{u.fullNom}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${u.rate}%`, background: 'var(--accent)' }} />
                    </div>
                    <span className="text-[9px] font-black font-mono text-slate-400 flex-shrink-0">{u.rate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="h-[230px]"><DashboardEmpty /></div>}
        {ranking.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-50 space-y-2">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Résumé</p>
            <div className="flex justify-between text-xs font-black text-slate-700">
              <span>{filteredTasks.filter((t: any) => t.statut === 'COMPLETEE').length} terminées</span>
              <span>{filteredTasks.length} total</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ background: 'var(--accent)', width: filteredTasks.length > 0 ? `${Math.round((filteredTasks.filter((t: any) => t.statut === 'COMPLETEE').length / filteredTasks.length) * 100)}%` : '0%' }} />
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Radar comparison — full width card */}
    <div className="premium-card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyse Radar</p>
          <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">Comparaison Multi-Axes</h2>
        </div>
        {radarProjects.length > 1 && effectiveIds.length < radarProjects.length && (
          <button
            onClick={addSlot}
            style={{ padding: '5px 12px', borderRadius: 8, border: '1.5px solid var(--border-color)', background: 'var(--bg-elevated)', fontSize: 11, fontWeight: 800, color: 'var(--accent)', cursor: 'pointer' }}
          >
            + Ajouter un projet
          </button>
        )}
      </div>

      {radarProjects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: selectors + radar */}
          <div>
            {/* Project dropdowns */}
            <div className="space-y-2 mb-4">
              {effectiveIds.map((id, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Color dot */}
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[idx % CHART_COLORS.length], flexShrink: 0 }} />
                  <select
                    value={id}
                    onChange={e => updateSlot(idx, e.target.value)}
                    style={SELECT_STYLE}
                  >
                    {radarProjects.map((p: any) => (
                      <option key={p.id} value={p.id} disabled={effectiveIds.includes(p.id) && p.id !== id}>
                        {p.nom}
                      </option>
                    ))}
                  </select>
                  {effectiveIds.length > 1 && (
                    <button
                      onClick={() => removeSlot(idx)}
                      style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 6, border: '1.5px solid var(--border-color)', background: 'var(--bg-elevated)', cursor: 'pointer', fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >×</button>
                  )}
                </div>
              ))}
            </div>

            {/* Radar chart */}
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                  <PolarGrid stroke={GRID_COLOR} />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fontWeight: 700, fill: isDark ? '#8B92A8' : '#64748b' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  {selectedProjects.map((p: any, i: number) => (
                    <Radar key={p.id} name={p.nom} dataKey={p.id}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                      fillOpacity={selectedProjects.length === 1 ? 0.12 : 0.07}
                      strokeWidth={2} />
                  ))}
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  {selectedProjects.length > 1 && (
                    <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }} />
                  )}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: comparison table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-subtle)' }}>
                    Métrique
                  </th>
                  {selectedProjects.map((p: any, i: number) => (
                    <th key={p.id} style={{ textAlign: 'center', padding: '6px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                        <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 90 }}>
                          {p.nom}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRICS_LABELS.map((metric, rowIdx) => (
                  <tr key={metric} style={{ background: rowIdx % 2 === 0 ? 'var(--bg-elevated)' : 'var(--bg-card)' }}>
                    <td style={{ padding: '8px 8px', fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-subtle)' }}>
                      {metric}
                    </td>
                    {selectedProjects.map((p: any) => {
                      const m = getProjectMetrics(p).find(x => x.metric === metric)!;
                      return (
                        <td key={p.id} style={{ padding: '8px 8px', textAlign: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
                          {m.isPercent ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                              <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{m.label}</span>
                              <div style={{ width: 48, height: 3, borderRadius: 3, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: 3, background: 'var(--accent)', width: `${m.pct}%` }} />
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{m.label}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : <div className="h-[280px]"><DashboardEmpty /></div>}
    </div>

    {/* Progress bars */}
    <div className="premium-card">
      <div className="mb-5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avancement</p>
        <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">Progression par Projet</h2>
      </div>
      {projProgressData.length > 0 ? (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projProgressData} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="nom" width={95} fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v}%`, 'Progression']} />
              <Bar dataKey="progression" radius={[0, 5, 5, 0]}>
                {projProgressData.map((entry: any, i: number) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <div className="h-[280px]"><DashboardEmpty /></div>}
    </div>

    {/* Priority project cards */}
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Opérations</p>
          <h2 className="text-xl font-black font-montserrat uppercase tracking-tight leading-none text-slate-900">Prioritaires</h2>
        </div>
        <Link to="/projects" className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b-2 border-slate-900 pb-1 hover:text-slate-600 transition-colors">
          Voir tout
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {projects.slice(0, 3).map((project: any) => (
          <div key={project.id} className="premium-card flex flex-col h-full">
            <div className="flex justify-between items-start mb-8">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                <DashboardProjectLogo logo={project.logo} nom={project.nom} />
              </div>
              <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest"
                style={{ backgroundColor: (STATUS_PROJ[project.statut]?.color ?? '#94a3b8') + '18', color: STATUS_PROJ[project.statut]?.color ?? '#94a3b8' }}>
                {project.statut}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">ID_SYS_{project.id.slice(-4).toUpperCase()}</p>
              <h3 className="text-2xl font-black text-slate-900 mb-6 font-montserrat tracking-tight leading-tight uppercase">{project.nom}</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black text-slate-400 tracking-widest">
                  <span>DÉPLOIEMENT</span>
                  <span className="text-slate-900 font-mono">{project.progressionGlobale.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${project.progressionGlobale}%`, backgroundColor: STATUS_PROJ[project.statut]?.color ?? 'var(--accent)' }} />
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
              <div className="flex -space-x-2">
                {project.teams?.length > 0 ? (
                  project.teams.slice(0, 4).map((member: any) => (
                    <div key={member.id} title={`@${member.user?.username ?? member.user?.nom}`}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black text-white uppercase overflow-hidden flex-shrink-0"
                      style={{ border: '2px solid var(--bg-card)', backgroundColor: avatarColor(member.userId) }}>
                      {member.user?.photo ? <img src={member.user.photo} className="w-full h-full object-cover" alt="" /> : member.user?.username?.[0] || member.user?.nom?.[0] || '?'}
                    </div>
                  ))
                ) : <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Aucun membre</span>}
                {project.teams?.length > 4 && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[8px] font-black" style={{ border: '2px solid var(--bg-card)', background: 'var(--bg-icon)', color: 'var(--text-sub)' }}>
                    +{project.teams.length - 4}
                  </div>
                )}
              </div>
              <Link to={`/projects/${project.id}`} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
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

export default DashboardProjectsSection;
