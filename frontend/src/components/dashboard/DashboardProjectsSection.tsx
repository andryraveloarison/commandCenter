import React from 'react';
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

const DashboardProjectsSection: React.FC<Props> = ({
  projects, filteredTasks, evolutionData, tasksByUser,
  ranking, projProgressData, radarData, radarProjects,
}) => (
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
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="nom" fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
              <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="4 2" strokeWidth={1} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v}%`, 'Progression']} />
              <Area type="monotone" dataKey="progression" stroke="#0f172a" strokeWidth={2.5} fill="url(#areaGrad)"
                dot={{ r: 5, fill: '#0f172a', stroke: 'white', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#0f172a', stroke: '#3b82f6', strokeWidth: 3 }} />
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
                      <div className="h-full rounded-full bg-slate-900" style={{ width: `${u.rate}%` }} />
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
              <div className="h-full rounded-full bg-slate-900"
                style={{ width: filteredTasks.length > 0 ? `${Math.round((filteredTasks.filter((t: any) => t.statut === 'COMPLETEE').length / filteredTasks.length) * 100)}%` : '0%' }} />
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Radar + Progress bars */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="premium-card">
        <div className="mb-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyse Radar</p>
          <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">Performance Multi-Axes</h2>
        </div>
        {radarProjects.length > 0 ? (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                {radarProjects.map((p: any, i: number) => (
                  <Radar key={p.id} name={p.nom.length > 14 ? p.nom.slice(0, 12) + '…' : p.nom}
                    dataKey={p.id} stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.08} strokeWidth={2} />
                ))}
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : <div className="h-[280px]"><DashboardEmpty /></div>}
      </div>

      <div className="premium-card">
        <div className="mb-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avancement</p>
          <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">Progression par Projet</h2>
        </div>
        {projProgressData.length > 0 ? (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projProgressData} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
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
                    style={{ width: `${project.progressionGlobale}%`, backgroundColor: STATUS_PROJ[project.statut]?.color ?? '#0f172a' }} />
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
              <div className="flex -space-x-2">
                {project.teams?.length > 0 ? (
                  project.teams.slice(0, 4).map((member: any) => (
                    <div key={member.id} title={member.user?.nom}
                      className="w-7 h-7 rounded-lg border-2 border-white flex items-center justify-center text-[9px] font-black text-white uppercase overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: avatarColor(member.userId) }}>
                      {member.user?.photo ? <img src={member.user.photo} className="w-full h-full object-cover" alt="" /> : member.user?.nom?.[0] || '?'}
                    </div>
                  ))
                ) : <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Aucun membre</span>}
                {project.teams?.length > 4 && (
                  <div className="w-7 h-7 rounded-lg border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-600">
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

export default DashboardProjectsSection;
