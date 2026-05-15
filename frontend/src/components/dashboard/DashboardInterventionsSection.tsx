import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TOOLTIP_STYLE, STATUS_INTERV, avatarColor, fmtDate } from './dashboardTypes';
import type { Period } from './dashboardTypes';
import DashboardSectionHeader from './DashboardSectionHeader';
import DashboardDonutLabel from './DashboardDonutLabel';
import DashboardLegend from './DashboardLegend';
import DashboardEmpty from './DashboardEmpty';

interface IntervStats {
  total: number;
  enAttente: number;
  enCours: number;
  resolu: number;
}

interface Props {
  filteredInterventions: any[];
  intervStats: IntervStats;
  intervStatusData: { label: string; color: string; value: number }[];
  intervByUser: any[];
  intervRanking: any[];
  intervEvolution: any[];
  recentInterventions: any[];
  siteData: { label: string; value: number; color: string }[];
  demandeurRanking: { nom: string; count: number }[];
  period: Period;
}

const LEGEND_INTERV = [
  { label: 'Résolues',   color: '#10B981' },
  { label: 'En cours',   color: '#3B82F6' },
  { label: 'En attente', color: '#F59E0B' },
];

const PERIOD_LABEL: Record<string, string> = {
  semaine: 'par jour',
  mois:    'par semaine',
  annee:   'par mois',
  tout:    'par mois',
  custom:  'sur la période',
};

const DashboardInterventionsSection: React.FC<Props> = ({
  intervStats, intervStatusData, intervByUser,
  intervRanking, intervEvolution, recentInterventions,
  siteData, demandeurRanking, period,
}) => (
  <div className="space-y-8">
    <DashboardSectionHeader label="Support IT" title="Interventions" linkTo="/interventions" linkLabel="Voir toutes les interventions" />

    {/* Stat cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {[
        { label: 'Total',      value: intervStats.total,     color: 'var(--text-primary)' },
        { label: 'En attente', value: intervStats.enAttente, color: '#D97706' },
        { label: 'En cours',   value: intervStats.enCours,   color: '#3B82F6' },
        { label: 'Résolues',   value: intervStats.resolu,    color: '#16A34A' },
      ].map((s, i) => (
        <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 20px' }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 24 }}>{s.label}</p>
          <p style={{ margin: 0, fontSize: 48, fontWeight: 900, color: s.color, fontFamily: 'monospace', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {s.value.toString().padStart(2, '0')}
          </p>
        </div>
      ))}
    </div>

    {/* Evolution curve — full width */}
    <div className="premium-card">
      <div className="mb-6">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historique</p>
        <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">
          Courbe des Interventions <span className="text-slate-300 font-medium normal-case text-base">{PERIOD_LABEL[period]}</span>
        </h2>
      </div>
      {intervEvolution.some((d: any) => d.total > 0) ? (
        <>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={intervEvolution} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradResolu"    x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10B981" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradEnCours"   x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradEnAttente" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="label" fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="resolu"    name="Résolues"   stroke="#10B981" strokeWidth={2} fill="url(#gradResolu)"    dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="enCours"   name="En cours"   stroke="#3B82F6" strokeWidth={2} fill="url(#gradEnCours)"   dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="enAttente" name="En attente" stroke="#F59E0B" strokeWidth={2} fill="url(#gradEnAttente)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <DashboardLegend items={LEGEND_INTERV} />
        </>
      ) : <div className="h-[230px]"><DashboardEmpty /></div>}
    </div>

    {/* Site donut + bar by technician */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="premium-card">
        <div className="mb-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Répartition</p>
          <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">Sites</h2>
        </div>
        {siteData.length > 0 ? (
          <>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={siteData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="label" labelLine={false} label={DashboardDonutLabel}>
                    {siteData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => `${value} intervention${value !== 1 ? 's' : ''}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <DashboardLegend items={siteData} />
          </>
        ) : <div className="h-[200px]"><DashboardEmpty /></div>}
      </div>

      <div className="lg:col-span-2 premium-card">
        <div className="mb-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Charge de travail</p>
          <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">Interventions par Technicien</h2>
        </div>
        {intervByUser.length > 0 ? (
          <>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={intervByUser} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="nom" fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                  <YAxis fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="resolu"    name="Résolues"   stackId="a" fill="#10B981" />
                  <Bar dataKey="enCours"   name="En cours"   stackId="a" fill="#3B82F6" />
                  <Bar dataKey="enAttente" name="En attente" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <DashboardLegend items={LEGEND_INTERV} />
          </>
        ) : <div className="h-[220px]"><DashboardEmpty /></div>}
      </div>
    </div>

    {/* Demandeurs ranking + Top technicians */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="premium-card">
        <div className="mb-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classement</p>
          <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">Top Demandeurs</h2>
        </div>
        {demandeurRanking.length > 0 ? (
          <div className="space-y-4">
            {demandeurRanking.map((d, i) => {
              const maxCount = demandeurRanking[0].count;
              return (
                <div key={d.nom} className="flex items-center gap-3">
                  <span className={`text-[11px] font-black w-5 text-center flex-shrink-0 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-400' : 'text-slate-200'}`}>
                    #{i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                    style={{ background: ['#6366F1','#10B981','#F59E0B','#EF4444','#3B82F6'][i] }}>
                    {d.nom[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-900 uppercase truncate">{d.nom}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.round((d.count / maxCount) * 100)}%` }} />
                      </div>
                      <span className="text-[9px] font-black font-mono text-slate-400 flex-shrink-0">
                        {d.count} intervention{d.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <div className="h-[200px]"><DashboardEmpty /></div>}
      </div>

      <div className="premium-card">
        <div className="mb-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classement IT</p>
          <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">Top Techniciens</h2>
        </div>
        {intervRanking.length > 0 ? (
          <div className="space-y-4">
            {intervRanking.slice(0, 5).map((u: any, i: number) => (
              <div key={u.id} className="flex items-center gap-3">
                <span className={`text-[11px] font-black w-5 text-center flex-shrink-0 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-400' : 'text-slate-200'}`}>#{i + 1}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 overflow-hidden" style={{ backgroundColor: avatarColor(u.id) }}>
                  {u.photo ? <img src={u.photo} className="w-full h-full object-cover" alt="" /> : u.fullNom[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-slate-900 uppercase truncate">{u.fullNom}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${u.rate}%` }} />
                    </div>
                    <span className="text-[9px] font-black font-mono text-slate-400 flex-shrink-0">{u.rate}% résolu</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="h-[200px]"><DashboardEmpty /></div>}
        {intervRanking.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-50 space-y-2">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Taux de résolution global</p>
            <div className="flex justify-between text-xs font-black text-slate-700">
              <span>{intervStats.resolu} résolues</span>
              <span>{intervStats.total} total</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500"
                style={{ width: intervStats.total > 0 ? `${Math.round((intervStats.resolu / intervStats.total) * 100)}%` : '0%' }} />
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Recent interventions table */}
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Historique</p>
          <h2 className="text-xl font-black font-montserrat uppercase tracking-tight leading-none text-slate-900">Dernières Interventions</h2>
        </div>
      </div>
      <div className="premium-card overflow-hidden p-0">
        {recentInterventions.length === 0 ? (
          <div className="p-10 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">Aucune intervention sur cette période</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border-color)' }}>
                {['Date', 'Problème', 'Site', 'Demandeur', 'Intervenant', 'Statut'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentInterventions.map((iv: any, idx: number) => {
                const sc = STATUS_INTERV[iv.statut as keyof typeof STATUS_INTERV];
                return (
                  <tr key={iv.id} style={{ borderBottom: idx < recentInterventions.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(iv.dateIntervention || iv.createdAt)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-sub)', maxWidth: 220 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{iv.probleme}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{iv.site?.nom || <span style={{ color: 'var(--text-faint)' }}>—</span>}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-sub)' }}>{iv.demandeur?.nom || <span style={{ color: 'var(--text-faint)' }}>—</span>}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {iv.intervenants?.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ display: 'flex' }}>
                            {iv.intervenants.slice(0, 3).map((ir: any, i: number) => (
                              <div key={ir.user.id} title={`@${ir.user.username}`} style={{ width: 30, height: 30, borderRadius: '50%', background: '#4F46E5', border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden', marginLeft: i > 0 ? -10 : 0 }}>
                                {ir.user.photo ? <img src={ir.user.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : ir.user.username?.[0]?.toUpperCase()}
                              </div>
                            ))}
                            {iv.intervenants.length > 3 && (
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-soft)', border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--accent)', marginLeft: -10 }}>
                                +{iv.intervenants.length - 3}
                              </div>
                            )}
                          </div>
                          {iv.intervenants.length === 1 && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>@{iv.intervenants[0].user.username}</span>
                          )}
                        </div>
                      ) : <span style={{ color: '#D1D5DB', fontSize: 11 }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, background: sc?.bg, color: sc?.color, fontSize: 10, fontWeight: 700 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc?.dot, display: 'block' }} />
                        {sc?.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
);

export default DashboardInterventionsSection;
