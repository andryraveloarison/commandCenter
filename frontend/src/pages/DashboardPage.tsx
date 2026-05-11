import React, { useMemo, useState } from 'react';
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
const CHART_COLORS = ['#0f172a', '#114496ff', '#22c55e', '#7c2121ff', '#88491bff', '#8b5cf6', '#881e53ff', '#14b8a6'];
const AVATAR_COLORS = ['#881c1cff', '#97480fff', '#eab308', '#13813cff', '#1b9183ff', '#153974ff', '#3b207aff', '#8f1a55ff'];
const avatarColor = (id: string) => AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];

const STATUS_PROJ: Record<string, { label: string; color: string }> = {
  PREPARATION: { label: 'Préparation', color: '#94a3b8' },
  EN_COURS:    { label: 'En Cours',    color: '#204e99ff' },
  CRITIQUE:    { label: 'Critique',    color: '#941111a2' },
  TERMINE:     { label: 'Terminé',     color: '#1ca54eff' },
};
const STATUS_TASK: Record<string, { label: string; color: string }> = {
  TODO:      { label: 'À Faire',   color: '#cbd5e1' },
  EN_COURS:  { label: 'En Cours',  color: '#3b82f6' },
  EN_REVIEW: { label: 'En Review', color: '#ac5618ff' },
  COMPLETEE: { label: 'Complétée', color: '#1d9248ff' },
  BLOQUEE:   { label: 'Bloquée',   color: '#881a1aff' },
};
const PRIO: Record<string, { label: string; color: string }> = {
  BASSE:    { label: 'Basse',    color: '#22c55e' },
  MOYENNE:  { label: 'Moyenne',  color: '#ad5c22ff' },
  HAUTE:    { label: 'Haute',    color: '#832020ff' },
  CRITIQUE: { label: 'Critique', color: '#5224a0ff' },
};
const STATUS_INTERV: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  EN_ATTENTE: { label: 'En attente', color: '#D97706', bg: '#FFFBEB', dot: '#F59E0B' },
  EN_COURS:   { label: 'En cours',   color: '#1D4ED8', bg: '#DBEAFE', dot: '#3B82F6' },
  RESOLU:     { label: 'Résolu',     color: '#065F46', bg: '#D1FAE5', dot: '#10B981' },
  ANNULE:     { label: 'Annulé',     color: '#6B7280', bg: '#F3F4F6', dot: '#9CA3AF' },
};

const TOOLTIP_STYLE = {
  borderRadius: '12px', border: 'none',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  fontSize: '11px', fontWeight: 700,
};

type Period = 'tout' | 'semaine' | 'mois' | 'annee' | 'custom';
const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'tout',    label: 'Tout' },
  { value: 'semaine', label: 'Cette semaine' },
  { value: 'mois',    label: 'Ce mois' },
  { value: 'annee',   label: 'Cette année' },
  { value: 'custom',  label: 'Plage…' },
];

// ── Helpers période ──────────────────────────────────────────────────────────
const getPeriodRange = (period: Period, cs: string, ce: string): [Date, Date] | null => {
  if (period === 'tout') return null;
  if (period === 'custom') return cs && ce ? [new Date(cs), new Date(ce + 'T23:59:59')] : null;
  const now = new Date();
  const start = new Date();
  if (period === 'semaine') {
    const d = start.getDay();
    start.setDate(start.getDate() - (d === 0 ? 6 : d - 1));
    start.setHours(0, 0, 0, 0);
  } else if (period === 'mois') {
    start.setDate(1); start.setHours(0, 0, 0, 0);
  } else if (period === 'annee') {
    start.setMonth(0, 1); start.setHours(0, 0, 0, 0);
  }
  return [start, now];
};

const filterByRange = (items: any[], key: string, range: [Date, Date] | null) => {
  if (!range) return items;
  const [s, e] = range;
  return items.filter(item => { const d = new Date(item[key]); return d >= s && d <= e; });
};

const mkPoint = (label: string, chunk: any[]) => ({
  label,
  total:     chunk.length,
  resolu:    chunk.filter((i: any) => i.statut === 'RESOLU').length,
  enCours:   chunk.filter((i: any) => i.statut === 'EN_COURS').length,
  enAttente: chunk.filter((i: any) => i.statut === 'EN_ATTENTE').length,
});

const buildEvolution = (items: any[], period: Period, cs: string, ce: string) => {
  const now = new Date();
  const inRange = (iso: string, s: Date, e: Date) => { const d = new Date(iso); return d >= s && d < e; };

  if (period === 'semaine') {
    const mon = new Date(now);
    mon.setDate(mon.getDate() - (mon.getDay() === 0 ? 6 : mon.getDay() - 1));
    mon.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const s = new Date(mon); s.setDate(mon.getDate() + i);
      const e = new Date(s); e.setDate(s.getDate() + 1);
      return mkPoint(s.toLocaleDateString('fr-FR', { weekday: 'short' }), items.filter((iv: any) => inRange(iv.createdAt, s, e)));
    });
  }

  if (period === 'mois') {
    const yr = now.getFullYear(), mo = now.getMonth();
    const daysInMonth = new Date(yr, mo + 1, 0).getDate();
    const weeks: any[] = [];
    for (let w = 0; w < 6; w++) {
      const s = new Date(yr, mo, 1 + w * 7);
      if (s.getDate() > daysInMonth || s.getMonth() !== mo) break;
      const e = new Date(yr, mo, Math.min(1 + (w + 1) * 7, daysInMonth + 1));
      weeks.push(mkPoint(`S${w + 1}`, items.filter((iv: any) => inRange(iv.createdAt, s, e))));
    }
    return weeks;
  }

  if (period === 'custom' && cs && ce) {
    const s0 = new Date(cs), e0 = new Date(ce + 'T23:59:59');
    const days = Math.round((e0.getTime() - s0.getTime()) / 86400000);
    if (days <= 0) return [];
    if (days <= 60) {
      return Array.from({ length: days + 1 }, (_, i) => {
        const s = new Date(s0); s.setDate(s0.getDate() + i);
        const e = new Date(s); e.setDate(s.getDate() + 1);
        if (s > e0) return null;
        return mkPoint(s.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }), items.filter((iv: any) => inRange(iv.createdAt, s, e)));
      }).filter(Boolean) as any[];
    }
    const months: any[] = [];
    const cur = new Date(s0.getFullYear(), s0.getMonth(), 1);
    while (cur <= e0) {
      const nm = new Date(cur); nm.setMonth(cur.getMonth() + 1);
      months.push(mkPoint(cur.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), items.filter((iv: any) => inRange(iv.createdAt, cur, nm))));
      cur.setMonth(cur.getMonth() + 1);
    }
    return months;
  }

  // annee / tout → 12 months
  return Array.from({ length: 12 }, (_, i) => {
    const ms = period === 'annee'
      ? new Date(now.getFullYear(), i, 1)
      : new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const me = new Date(ms); me.setMonth(ms.getMonth() + 1);
    return mkPoint(ms.toLocaleDateString('fr-FR', { month: 'short' }), items.filter((iv: any) => inRange(iv.createdAt, ms, me)));
  });
};

// ── Helpers visuels ──────────────────────────────────────────────────────────
const DonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.06) return null;
  const rad = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  return (
    <text x={cx + r * Math.cos(-midAngle * rad)} y={cy + r * Math.sin(-midAngle * rad)}
      fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="900">
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
  <div className="h-full flex items-center justify-center text-slate-200 text-[10px] font-black uppercase tracking-widest">Aucune donnée</div>
);

const ProjectLogo: React.FC<{ logo?: string; nom: string }> = ({ logo, nom }) => {
  if (!logo) return <span className="text-xl">{nom[0]?.toUpperCase() || '?'}</span>;
  if (logo.startsWith('http') || logo.startsWith('data:'))
    return <img src={logo} alt="" className="w-full h-full object-cover rounded-xl" />;
  return <span className="text-xl">{logo}</span>;
};

const SectionHeader: React.FC<{ label: string; title: string; linkTo?: string; linkLabel?: string }> = ({ label, title, linkTo, linkLabel }) => (
  <div className="flex justify-between items-end mb-8">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <h2 className="text-2xl font-black font-montserrat uppercase tracking-tight leading-none text-slate-900">{title}</h2>
    </div>
    {linkTo && (
      <Link to={linkTo} className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b-2 border-slate-900 pb-1 hover:text-slate-600 transition-colors">{linkLabel}</Link>
    )}
  </div>
);

const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—';

const ACCENT = '#4F46E5';
const inp = { padding: '6px 12px', borderRadius: 9, border: '1.5px solid #EEF0F6', background: '#F8FAFC', fontSize: 12, fontFamily: 'Inter, sans-serif', outline: 'none', color: '#1A1D2E' };

// ── Page ─────────────────────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<Period>('tout');
  const [customStart, setCustomStart] = useState('');
  const [customEnd,   setCustomEnd]   = useState('');

  const { data: projects      = [] } = useQuery({ queryKey: ['projects'],      queryFn: () => apiService.getProjects().then(r => r.data) });
  const { data: tasks         = [] } = useQuery({ queryKey: ['tasks'],         queryFn: () => apiService.getTasks().then(r => r.data) });
  const { data: users         = [] } = useQuery({ queryKey: ['users'],         queryFn: () => apiService.getUsers().then(r => r.data) });
  const { data: interventions = [] } = useQuery({ queryKey: ['interventions'], queryFn: () => apiService.getInterventions().then(r => r.data) });

  const range = useMemo(() => getPeriodRange(period, customStart, customEnd), [period, customStart, customEnd]);

  const filteredTasks         = useMemo(() => filterByRange(tasks,         'createdAt', range), [tasks,         range]);
  const filteredInterventions = useMemo(() => filterByRange(interventions, 'createdAt', range), [interventions, range]);

  // ── Données projets ──────────────────────────────────────────────────────
  const projStatusData = Object.entries(STATUS_PROJ)
    .map(([k, v]) => ({ ...v, value: projects.filter((p: any) => p.statut === k).length })).filter(d => d.value > 0);
  const taskStatusData = Object.entries(STATUS_TASK)
    .map(([k, v]) => ({ ...v, value: filteredTasks.filter((t: any) => t.statut === k).length })).filter(d => d.value > 0);
  const prioData = Object.entries(PRIO)
    .map(([k, v]) => ({ ...v, value: projects.filter((p: any) => p.priorite === k).length })).filter(d => d.value > 0);

  const evolutionData = [...projects]
    .sort((a: any, b: any) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
    .map((p: any) => ({ nom: p.nom.length > 14 ? p.nom.slice(0, 12) + '…' : p.nom, progression: Math.round(p.progressionGlobale) }));

  const tasksByUser = users.map((u: any) => ({
    nom: u.nom.length > 12 ? u.nom.slice(0, 10) + '…' : u.nom,
    fullNom: u.nom, id: u.id, photo: u.photo,
    done:       filteredTasks.filter((t: any) => t.assigneeId === u.id && t.statut === 'COMPLETEE').length,
    inProgress: filteredTasks.filter((t: any) => t.assigneeId === u.id && t.statut === 'EN_COURS').length,
    todo:       filteredTasks.filter((t: any) => t.assigneeId === u.id && t.statut === 'TODO').length,
    total:      filteredTasks.filter((t: any) => t.assigneeId === u.id).length,
  })).filter((u: any) => u.total > 0).sort((a: any, b: any) => b.total - a.total);

  const ranking = [...tasksByUser]
    .map((u: any) => ({ ...u, rate: u.total > 0 ? Math.round((u.done / u.total) * 100) : 0 }))
    .sort((a: any, b: any) => b.rate - a.rate || b.done - a.done);

  const projProgressData = [...projects]
    .sort((a: any, b: any) => b.progressionGlobale - a.progressionGlobale)
    .map((p: any) => ({ nom: p.nom.length > 16 ? p.nom.slice(0, 14) + '…' : p.nom, progression: Math.round(p.progressionGlobale), fill: STATUS_PROJ[p.statut]?.color ?? '#0f172a' }));

  const radarProjects = projects.slice(0, 5);
  const radarData = [
    { metric: 'Progression', ...Object.fromEntries(radarProjects.map((p: any) => [p.id, Math.round(p.progressionGlobale)])) },
    { metric: 'Équipe',      ...Object.fromEntries(radarProjects.map((p: any) => [p.id, Math.min((p.teams?.length ?? 0) * 20, 100)])) },
    { metric: 'Tâches',      ...Object.fromEntries(radarProjects.map((p: any) => [p.id, Math.min((p.tasks?.length ?? 0) * 12, 100)])) },
    { metric: 'Priorité',    ...Object.fromEntries(radarProjects.map((p: any) => [p.id, { BASSE: 25, MOYENNE: 50, HAUTE: 75, CRITIQUE: 100 }[p.priorite as string] ?? 50])) },
  ];

  // ── Données interventions ────────────────────────────────────────────────
  const intervStats = {
    total:     filteredInterventions.length,
    enAttente: filteredInterventions.filter((i: any) => i.statut === 'EN_ATTENTE').length,
    enCours:   filteredInterventions.filter((i: any) => i.statut === 'EN_COURS').length,
    resolu:    filteredInterventions.filter((i: any) => i.statut === 'RESOLU').length,
  };

  const intervStatusData = Object.entries(STATUS_INTERV)
    .map(([k, v]) => ({ label: v.label, color: v.dot, value: filteredInterventions.filter((i: any) => i.statut === k).length }))
    .filter(d => d.value > 0);

  const intervByUser = users.map((u: any) => ({
    nom: u.nom.length > 12 ? u.nom.slice(0, 10) + '…' : u.nom,
    fullNom: u.nom, id: u.id, photo: u.photo,
    resolu:    filteredInterventions.filter((i: any) => i.intervenantId === u.id && i.statut === 'RESOLU').length,
    enCours:   filteredInterventions.filter((i: any) => i.intervenantId === u.id && i.statut === 'EN_COURS').length,
    enAttente: filteredInterventions.filter((i: any) => i.intervenantId === u.id && i.statut === 'EN_ATTENTE').length,
    total:     filteredInterventions.filter((i: any) => i.intervenantId === u.id).length,
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

  return (
    <div className="space-y-14 pb-4">

      {/* ── Filtre de période ─────────────────────────────────────────────── */}
      <div style={{
        background: '#fff', borderRadius: 14, border: '1px solid #EEF0F6',
        padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.12em', flexShrink: 0 }}>
          Période
        </span>
        <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 10, padding: 3 }}>
          {PERIOD_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setPeriod(opt.value)} style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 11, transition: 'all 0.15s',
              background: period === opt.value ? '#fff' : 'transparent',
              color: period === opt.value ? ACCENT : '#9CA3AF',
              boxShadow: period === opt.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>
              {opt.label}
            </button>
          ))}
        </div>
        {period === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={inp} />
            <span style={{ color: '#9CA3AF', fontWeight: 700, fontSize: 13 }}>→</span>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={inp} />
          </div>
        )}
        {range && (
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#C4C9D4', fontFamily: 'monospace' }}>
            {range[0].toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })} → {range[1].toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 — GLOBAL
      ════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        <SectionHeader label="Vue d'ensemble" title="Global" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Projets Totaux', value: projects.length,                                        color: 'text-slate-900' },
            { label: 'Tâches',         value: filteredTasks.length,                                   color: 'text-blue-600' },
            { label: 'Interventions',  value: filteredInterventions.length,                           color: 'text-indigo-600' },
            { label: 'Membres Équipe', value: users.filter((u: any) => u.statut === 'ACTIF').length,  color: 'text-green-500' },
          ].map((s, i) => (
            <div key={i} className="premium-card">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{s.label}</p>
              <p className={`text-5xl font-black ${s.color} font-mono tracking-tighter leading-none`}>
                {s.value.toString().padStart(2, '0')}
              </p>
            </div>
          ))}
        </div>

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
                        <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={86} paddingAngle={3} dataKey="value" labelLine={false} label={DonutLabel}>
                          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <Legend2 items={data} />
                </>
              ) : <div className="h-[190px]"><Empty /></div>}
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2 — PROJETS
      ════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        <SectionHeader label="Suivi" title="Projets" linkTo="/projects" linkLabel="Voir tous les projets" />

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
          ) : <div className="h-[220px]"><Empty /></div>}
        </div>

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
                <Legend2 items={[{ label: 'Complétées', color: '#22c55e' }, { label: 'En Cours', color: '#3b82f6' }, { label: 'À Faire', color: '#cbd5e1' }]} />
              </>
            ) : <div className="h-[230px]"><Empty /></div>}
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
            ) : <div className="h-[230px]"><Empty /></div>}
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
            ) : <div className="h-[280px]"><Empty /></div>}
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
                      {projProgressData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-[280px]"><Empty /></div>}
          </div>
        </div>

        {/* Opérations prioritaires */}
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
                    <ProjectLogo logo={project.logo} nom={project.nom} />
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

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3 — INTERVENTIONS
      ════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        <SectionHeader label="Support IT" title="Interventions" linkTo="/interventions" linkLabel="Voir toutes les interventions" />

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total',      value: intervStats.total,     color: 'text-slate-900',   bg: '#F8FAFC', border: '#EEF0F6' },
            { label: 'En attente', value: intervStats.enAttente, color: 'text-yellow-600',  bg: '#FFFBEB', border: '#FDE68A' },
            { label: 'En cours',   value: intervStats.enCours,   color: 'text-blue-700',    bg: '#EFF6FF', border: '#BFDBFE' },
            { label: 'Résolues',   value: intervStats.resolu,    color: 'text-emerald-700', bg: '#F0FDF4', border: '#A7F3D0' },
          ].map((s, i) => (
            <div key={i} className="premium-card" style={{ background: s.bg, borderColor: s.border }}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{s.label}</p>
              <p className={`text-5xl font-black ${s.color} font-mono tracking-tighter leading-none`}>
                {s.value.toString().padStart(2, '0')}
              </p>
            </div>
          ))}
        </div>

        {/* Donut + Bar par technicien */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="premium-card">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Répartition statuts</p>
            {intervStatusData.length > 0 ? (
              <>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={intervStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" labelLine={false} label={DonutLabel}>
                        {intervStatusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <Legend2 items={intervStatusData} />
              </>
            ) : <div className="h-[200px]"><Empty /></div>}
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
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="nom" fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                      <YAxis fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="resolu"    name="Résolues"   stackId="a" fill="#10B981" />
                      <Bar dataKey="enCours"   name="En cours"   stackId="a" fill="#3B82F6" />
                      <Bar dataKey="enAttente" name="En attente" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <Legend2 items={[{ label: 'Résolues', color: '#10B981' }, { label: 'En cours', color: '#3B82F6' }, { label: 'En attente', color: '#F59E0B' }]} />
              </>
            ) : <div className="h-[220px]"><Empty /></div>}
          </div>
        </div>

        {/* Évolution + Top Intervenant */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Évolution des interventions */}
          <div className="lg:col-span-2 premium-card">
            <div className="mb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historique</p>
              <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight mt-1">Évolution des Interventions</h2>
            </div>
            {intervEvolution.some((d: any) => d.total > 0) ? (
              <>
                <div className="h-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={intervEvolution} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="label" fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                      <YAxis fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} allowDecimals={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="resolu"    name="Résolues"   stackId="a" fill="#10B981" />
                      <Bar dataKey="enCours"   name="En cours"   stackId="a" fill="#3B82F6" />
                      <Bar dataKey="enAttente" name="En attente" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <Legend2 items={[{ label: 'Résolues', color: '#10B981' }, { label: 'En cours', color: '#3B82F6' }, { label: 'En attente', color: '#F59E0B' }]} />
              </>
            ) : <div className="h-[230px]"><Empty /></div>}
          </div>

          {/* Top intervenant */}
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
                        <span className="text-[9px] font-black font-mono text-slate-400 flex-shrink-0">{u.rate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px]"><Empty /></div>
            )}
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

        {/* Dernières interventions */}
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
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #EEF0F6' }}>
                    {['Date', 'Problème', 'Site', 'Demandeur', 'Intervenant', 'Statut'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentInterventions.map((iv: any, idx: number) => {
                    const sc = STATUS_INTERV[iv.statut as keyof typeof STATUS_INTERV];
                    return (
                      <tr key={iv.id} style={{ borderBottom: idx < recentInterventions.length - 1 ? '1px solid #F5F7FA' : 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#FAFBFF')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '12px 16px', fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{fmtDate(iv.dateIntervention || iv.createdAt)}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151', maxWidth: 220 }}>
                          <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{iv.probleme}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#1A1D2E' }}>{iv.site?.nom || <span style={{ color: '#D1D5DB' }}>—</span>}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151' }}>{iv.demandeur?.nom || <span style={{ color: '#D1D5DB' }}>—</span>}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {iv.intervenant ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
                                {iv.intervenant.photo ? <img src={iv.intervenant.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : iv.intervenant.nom[0]}
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{iv.intervenant.nom}</span>
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

    </div>
  );
};

export default DashboardPage;
