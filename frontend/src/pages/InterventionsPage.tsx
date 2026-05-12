import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@services/api';

/* ── Types ─────────────────────────────────────────────────────────────── */
interface Site       { id: string; nom: string; }
interface Demandeur  { id: string; nom: string; siteId?: string; site?: Site; }
interface UserBrief  { id: string; nom: string; photo?: string; role: string; }
interface Intervention {
  id: string; probleme: string; solution?: string;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'RESOLU' | 'ANNULE';
  dateIntervention?: string; createdAt: string;
  intervenant?: UserBrief; demandeur?: Demandeur; site?: Site;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
const STATUS_CFG = {
  EN_ATTENTE: { label: 'En attente', bg: '#FEF3C7', color: '#D97706', dot: '#F59E0B' },
  EN_COURS:   { label: 'En cours',   bg: '#DBEAFE', color: '#1D4ED8', dot: '#3B82F6' },
  RESOLU:     { label: 'Résolu',     bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
  ANNULE:     { label: 'Annulé',     bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF' },
};

const StatusBadge = ({ s }: { s: keyof typeof STATUS_CFG }) => {
  const c = STATUS_CFG[s] || STATUS_CFG.EN_ATTENTE;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, background: c.bg, color: c.color, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, display: 'block', flexShrink: 0 }} />
      {c.label}
    </span>
  );
};

const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const inp = "w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 font-medium text-sm focus:border-indigo-400 focus:bg-white outline-none transition-all";
const lbl = "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5";

/* ── Quick-add mini-form ────────────────────────────────────────────────── */
const QuickAdd: React.FC<{
  type: 'site' | 'demandeur';
  sites?: Site[];
  onCreated: (item: any) => void;
  onCancel: () => void;
}> = ({ type, sites = [], onCreated, onCancel }) => {
  const [f, setF] = useState<Record<string, string>>({});
  const qc = useQueryClient();

  const save = async () => {
    if (!f.nom?.trim()) return;
    const res = type === 'site'
      ? await apiService.createSite(f)
      : await apiService.createDemandeur(f);
    qc.invalidateQueries({ queryKey: [type === 'site' ? 'sites' : 'demandeurs'] });
    onCreated(res.data);
  };

  return (
    <div style={{ background: '#F8F9FF', border: '1.5px solid #C7D2FE', borderRadius: 12, padding: 14, marginTop: 8 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#4F46E5', marginBottom: 10 }}>
        {type === 'site' ? '+ Nouveau site' : '+ Nouveau demandeur'}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input className={inp} placeholder="Nom *" value={f.nom || ''} onChange={e => setF({ ...f, nom: e.target.value })} />
        {type === 'demandeur' && (
          <select className={inp} value={f.siteId || ''} onChange={e => setF({ ...f, siteId: e.target.value })}>
            <option value="">— Site (optionnel) —</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save} style={{ flex: 1, padding: '8px', background: '#4F46E5', color: '#fff', borderRadius: 9, border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Créer</button>
          <button onClick={onCancel} style={{ padding: '8px 14px', background: '#F3F4F6', color: '#6B7280', borderRadius: 9, border: 'none', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>✕</button>
        </div>
      </div>
    </div>
  );
};

/* ── Modal create / edit ─────────────────────────────────────────────────── */
const EMPTY = { probleme: '', solution: '', statut: 'EN_ATTENTE', dateIntervention: '', intervenantId: '', demandeurId: '', siteId: '' };

const Modal: React.FC<{
  item?: Intervention | null;
  sites: Site[]; demandeurs: Demandeur[]; users: UserBrief[];
  onClose: () => void; onSaved: () => void;
}> = ({ item, sites, demandeurs, users, onClose, onSaved }) => {
  const [f, setF] = useState<typeof EMPTY>(() => item ? {
    probleme: item.probleme, solution: item.solution || '',
    statut: item.statut,
    dateIntervention: item.dateIntervention ? item.dateIntervention.slice(0, 10) : '',
    intervenantId: item.intervenant?.id || '',
    demandeurId: item.demandeur?.id || '',
    siteId: item.site?.id || '',
  } : { ...EMPTY });
  const [qa, setQa] = useState<'site' | 'demandeur' | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof EMPTY, v: string) => setF(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!f.probleme.trim()) return;
    setSaving(true);
    const payload = { ...f, dateIntervention: f.dateIntervention || null, intervenantId: f.intervenantId || null, demandeurId: f.demandeurId || null, siteId: f.siteId || null };
    try {
      item ? await apiService.updateIntervention(item.id, payload) : await apiService.createIntervention(payload);
      onSaved();
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F0F2F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: 17, color: '#1A1D2E' }}>{item ? 'Modifier l\'intervention' : 'Nouvelle intervention'}</h2>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#B0B5CC' }}>Remplissez les informations de l'intervention</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid #EEF0F6', background: '#F9FAFB', cursor: 'pointer', fontSize: 16, color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Problème */}
          <div>
            <label className={lbl}>Problème *</label>
            <textarea className={inp} rows={3} placeholder="Décrivez le problème…" value={f.probleme} onChange={e => set('probleme', e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          {/* Solution */}
          <div>
            <label className={lbl}>Solution</label>
            <textarea className={inp} rows={3} placeholder="Décrivez la solution apportée…" value={f.solution} onChange={e => set('solution', e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

            {/* Statut */}
            <div>
              <label className={lbl}>Statut</label>
              <select className={inp} value={f.statut} onChange={e => set('statut', e.target.value)}>
                <option value="EN_ATTENTE">En attente</option>
                <option value="EN_COURS">En cours</option>
                <option value="RESOLU">Résolu</option>
                <option value="ANNULE">Annulé</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className={lbl}>Date d'intervention</label>
              <input type="date" className={inp} value={f.dateIntervention} onChange={e => set('dateIntervention', e.target.value)} />
            </div>

            {/* Intervenant */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label className={lbl}>Intervenant</label>
              <select className={inp} value={f.intervenantId} onChange={e => set('intervenantId', e.target.value)}>
                <option value="">— Choisir un intervenant —</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.nom} ({u.role})</option>)}
              </select>
            </div>

            {/* Site */}
            <div>
              <label className={lbl}>Site (entreprise)</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <select className={inp} style={{ flex: 1 }} value={f.siteId} onChange={e => set('siteId', e.target.value)}>
                  <option value="">— Choisir —</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
                <button onClick={() => setQa(qa === 'site' ? null : 'site')} title="Ajouter un site"
                  style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #C7D2FE', background: '#EEF2FF', color: '#4F46E5', fontWeight: 700, fontSize: 18, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              {qa === 'site' && <QuickAdd type="site" onCreated={s => { set('siteId', s.id); setQa(null); }} onCancel={() => setQa(null)} />}
            </div>

            {/* Demandeur */}
            <div>
              <label className={lbl}>Demandeur</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <select className={inp} style={{ flex: 1 }} value={f.demandeurId} onChange={e => set('demandeurId', e.target.value)}>
                  <option value="">— Choisir —</option>
                  {demandeurs.map(d => <option key={d.id} value={d.id}>{d.nom}{d.site ? ` (${d.site.nom})` : ''}</option>)}
                </select>
                <button onClick={() => setQa(qa === 'demandeur' ? null : 'demandeur')} title="Ajouter un demandeur"
                  style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #C7D2FE', background: '#EEF2FF', color: '#4F46E5', fontWeight: 700, fontSize: 18, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              {qa === 'demandeur' && <QuickAdd type="demandeur" sites={sites} onCreated={d => { set('demandeurId', d.id); setQa(null); }} onCancel={() => setQa(null)} />}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #F0F2F8', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 11, border: '1px solid #EEF0F6', background: '#F9FAFB', color: '#6B7280', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Annuler</button>
          <button onClick={save} disabled={saving || !f.probleme.trim()} style={{ padding: '10px 24px', borderRadius: 11, border: 'none', background: f.probleme.trim() ? '#4F46E5' : '#EEF2FF', color: f.probleme.trim() ? '#fff' : '#A5B4FC', fontWeight: 700, fontSize: 13, cursor: f.probleme.trim() ? 'pointer' : 'default', minWidth: 120 }}>
            {saving ? 'Enregistrement…' : item ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main page ───────────────────────────────────────────────────────────── */
const FILTERS = ['Tous', 'EN_ATTENTE', 'EN_COURS', 'RESOLU', 'ANNULE'] as const;
type PeriodF = 'tout' | 'semaine' | 'mois' | 'annee';
const PERIOD_OPTS: { value: PeriodF; label: string }[] = [
  { value: 'tout',    label: 'Tout' },
  { value: 'semaine', label: 'Cette semaine' },
  { value: 'mois',    label: 'Ce mois' },
  { value: 'annee',   label: 'Cette année' },
];

const isInPeriod = (iso: string, period: PeriodF) => {
  if (period === 'tout') return true;
  const d = new Date(iso);
  const now = new Date();
  if (period === 'semaine') {
    const mon = new Date(now);
    mon.setDate(mon.getDate() - (mon.getDay() === 0 ? 6 : mon.getDay() - 1));
    mon.setHours(0, 0, 0, 0);
    return d >= mon;
  }
  if (period === 'mois')  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  if (period === 'annee') return d.getFullYear() === now.getFullYear();
  return true;
};

const InterventionsPage: React.FC = () => {
  const qc = useQueryClient();
  const [modal, setModal] = useState<Intervention | null | 'new'>(null);
  const [filter, setFilter] = useState<typeof FILTERS[number]>('Tous');
  const [period, setPeriod] = useState<PeriodF>('tout');
  const [search, setSearch] = useState('');

  const { data: interventions = [], isLoading } = useQuery({ queryKey: ['interventions'], queryFn: () => apiService.getInterventions().then(r => r.data as Intervention[]) });
  const { data: sites      = [] } = useQuery({ queryKey: ['sites'],       queryFn: () => apiService.getSites().then(r => r.data as Site[]) });
  const { data: demandeurs = [] } = useQuery({ queryKey: ['demandeurs'],  queryFn: () => apiService.getDemandeurs().then(r => r.data as Demandeur[]) });
  const { data: users      = [] } = useQuery({ queryKey: ['users'],       queryFn: () => apiService.getUsers().then(r => r.data as UserBrief[]) });

  const refresh = () => qc.invalidateQueries({ queryKey: ['interventions'] });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiService.deleteIntervention(id),
    onSuccess: refresh,
  });

  const filtered = interventions.filter(i => {
    const matchStatus = filter === 'Tous' || i.statut === filter;
    const matchPeriod = isInPeriod(i.createdAt, period);
    const q = search.toLowerCase();
    const matchSearch = !q || i.probleme.toLowerCase().includes(q) || i.site?.nom.toLowerCase().includes(q) || i.demandeur?.nom.toLowerCase().includes(q) || i.intervenant?.nom.toLowerCase().includes(q);
    return matchStatus && matchPeriod && matchSearch;
  });

  const stats = {
    total:     interventions.length,
    enAttente: interventions.filter(i => i.statut === 'EN_ATTENTE').length,
    enCours:   interventions.filter(i => i.statut === 'EN_COURS').length,
    resolu:    interventions.filter(i => i.statut === 'RESOLU').length,
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 pb-4">
      {modal && (
        <Modal
          item={modal === 'new' ? null : modal}
          sites={sites} demandeurs={demandeurs} users={users}
          onClose={() => setModal(null)}
          onSaved={() => { refresh(); setModal(null); }}
        />
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total', value: stats.total, bg: '#F8FAFC', color: '#1A1D2E', border: '#EEF0F6' },
          { label: 'En attente', value: stats.enAttente, bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
          { label: 'En cours', value: stats.enCours, bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
          { label: 'Résolues', value: stats.resolu, bg: '#F0FDF4', color: '#065F46', border: '#A7F3D0' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: '16px 20px' }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
            <p style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 900, color: s.color, fontFamily: 'Montserrat, sans-serif' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher…"
          style={{ flex: 1, minWidth: 180, padding: '9px 14px', borderRadius: 10, border: '1.5px solid #EEF0F6', background: '#F8FAFC', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none' }}
          onFocus={e => (e.target.style.borderColor = '#4F46E5')}
          onBlur={e => (e.target.style.borderColor = '#EEF0F6')}
        />
        {/* Période */}
        <select
          value={period}
          onChange={e => setPeriod(e.target.value as PeriodF)}
          style={{ padding: '9px 12px', borderRadius: 10, border: '1.5px solid #EEF0F6', background: '#F8FAFC', fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#374151', cursor: 'pointer', outline: 'none' }}
        >
          {PERIOD_OPTS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {/* Statut */}
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as typeof FILTERS[number])}
          style={{ padding: '9px 12px', borderRadius: 10, border: '1.5px solid #EEF0F6', background: '#F8FAFC', fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#374151', cursor: 'pointer', outline: 'none' }}
        >
          {FILTERS.map(f => (
            <option key={f} value={f}>{f === 'Tous' ? 'Tous les statuts' : STATUS_CFG[f as keyof typeof STATUS_CFG].label}</option>
          ))}
        </select>
        <button onClick={() => setModal('new')} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: '#4F46E5', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          + Nouvelle intervention
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EEF0F6', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #EEF0F6' }}>
              {['Date', 'Site', 'Demandeur', 'Problème', 'Intervenant', 'Statut', ''].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#C4C9D4', fontSize: 13, fontWeight: 600 }}>
                {search || filter !== 'Tous' ? 'Aucun résultat' : 'Aucune intervention enregistrée'}
              </td></tr>
            )}
            {filtered.map((iv, idx) => (
              <tr key={iv.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F5F7FA' : 'none', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FAFBFF')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '13px 16px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                  {iv.dateIntervention ? fmtDate(iv.dateIntervention) : <span style={{ color: '#D1D5DB' }}>{fmtDate(iv.createdAt)}</span>}
                </td>
                <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: '#1A1D2E', maxWidth: 120 }}>
                  {iv.site?.nom || <span style={{ color: '#D1D5DB' }}>—</span>}
                </td>
                <td style={{ padding: '13px 16px', fontSize: 13, color: '#374151', maxWidth: 130 }}>
                  {iv.demandeur ? iv.demandeur.nom : <span style={{ color: '#D1D5DB' }}>—</span>}
                </td>
                <td style={{ padding: '13px 16px', fontSize: 13, color: '#374151', maxWidth: 240 }}>
                  <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{iv.probleme}</span>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  {iv.intervenant ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
                        {iv.intervenant.photo ? <img src={iv.intervenant.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : iv.intervenant.nom[0]}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{iv.intervenant.nom}</span>
                    </div>
                  ) : <span style={{ color: '#D1D5DB', fontSize: 12 }}>—</span>}
                </td>
                <td style={{ padding: '13px 16px' }}><StatusBadge s={iv.statut} /></td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setModal(iv)} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #EEF0F6', background: '#F9FAFB', color: '#6B7280', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EEF2FF'; (e.currentTarget as HTMLElement).style.color = '#4F46E5'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; (e.currentTarget as HTMLElement).style.color = '#6B7280'; }}>
                      Éditer
                    </button>
                    <button onClick={() => { if (confirm('Supprimer cette intervention ?')) deleteMut.mutate(iv.id); }}
                      style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #FEE2E2', background: '#FFF5F5', color: '#EF4444', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FEE2E2'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#FFF5F5'}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InterventionsPage;
