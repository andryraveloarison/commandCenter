import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '@store/store';
import apiService from '@services/api';
import type { User } from '@types/index';
import { getUserColor } from '@components/partials/SubTaskRow';

interface Props {
  user: User;
  onClose: () => void;
}

type Mode = 'projets' | 'interventions';
type Period = 'semaine' | 'mois' | 'annee' | 'tout';

const ROLE_LABELS: Record<string, string> = {
  DSI: 'DSI', RESPONSABLE: 'Responsable', DEVELOPPEUR: 'Développeur', TECH_IT: 'Tech IT',
};

const RANK_ICONS: Record<string, string> = {
  DSI: '★', RESPONSABLE: '▲', DEVELOPPEUR: '◆', TECH_IT: '●',
};

const PERIOD_LABELS: Record<Period, string> = {
  semaine: 'Semaine', mois: 'Mois', annee: 'Année', tout: 'Tout',
};

const UserStatsModal: React.FC<Props> = ({ user, onClose }) => {
  const [mode, setMode] = useState<Mode>('projets');
  const [period, setPeriod] = useState<Period>('tout');
  const [roleEdit, setRoleEdit] = useState(false);
  const [newRole, setNewRole] = useState(user.role);
  const [savingRole, setSavingRole] = useState(false);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isDSI = currentUser?.role === 'DSI';
  const queryClient = useQueryClient();

  const color = getUserColor(user.id);

  const handleRoleSave = async () => {
    if (newRole === user.role) { setRoleEdit(false); return; }
    setSavingRole(true);
    try {
      await apiService.updateUser(user.id, { role: newRole });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      user.role = newRole as User['role'];
      setRoleEdit(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingRole(false);
    }
  };

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats', user.id, period],
    queryFn: () => apiService.getUserStatistics(user.id, period === 'tout' ? undefined : period).then(r => r.data),
    staleTime: 0,
    placeholderData: (prev) => prev,
  });

  const taskRate = stats?.tasks?.total > 0
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) : 0;
  const ivRate = stats?.interventions?.total > 0
    ? Math.round((stats.interventions.resolu / stats.interventions.total) * 100) : 0;
  const rate = mode === 'projets' ? taskRate : ivRate;
  const rateColor = rate >= 80 ? '#4ade80' : rate >= 50 ? '#a78bfa' : '#fb923c';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,20,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden relative"
        style={{
          background: 'linear-gradient(160deg, #0f1623 0%, #0a0f1a 100%)',
          border: `1px solid ${color}30`,
          borderRadius: 4,
          boxShadow: `0 0 60px ${color}18, 0 0 0 1px #ffffff08`,
          zIndex: 10000,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: color }} />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: color }} />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: color }} />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: color }} />

        {/* Top strip */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 relative">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center transition-colors"
            style={{ color: '#ffffff30' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#ffffff30')}
          >✕</button>

          {/* Classification tag */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1" style={{ background: `${color}40` }} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em]" style={{ color: `${color}80` }}>
              DOSSIER OPÉRATIONNEL
            </span>
            <div className="h-px flex-1" style={{ background: `${color}40` }} />
          </div>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-16 h-16 overflow-hidden flex items-center justify-center text-white text-xl font-black"
                style={{
                  background: `linear-gradient(135deg, ${color}40, ${color}15)`,
                  border: `1.5px solid ${color}50`,
                  borderRadius: 4,
                }}
              >
                {user.photo
                  ? <img src={user.photo} className="w-full h-full object-cover" alt="" />
                  : <span style={{ color }}>{user.nom[0]}</span>
                }
              </div>
              {/* Status dot */}
              <div
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 flex items-center justify-center"
                style={{
                  background: user.statut === 'ACTIF' ? '#4ade80' : user.statut === 'OCCUPE' ? '#fbbf24' : '#475569',
                  border: '2px solid #0a0f1a',
                  borderRadius: 2,
                }}
              />
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px]" style={{ color }}>{RANK_ICONS[user.role] ?? '◆'}</span>
                <p className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: `${color}90` }}>
                  {ROLE_LABELS[user.role] ?? user.role}
                </p>
              </div>
              <h2 className="text-base font-black text-white uppercase tracking-wide leading-none truncate">{user.nom}</h2>
              <p className="text-[10px] font-black mt-0.5" style={{ color: `${color}b0` }}>@{user.username}</p>
            </div>
          </div>

          {/* Description */}
          {user.description && (
            <p className="mt-3 text-[10px] leading-relaxed" style={{ color: '#ffffff50', borderLeft: `2px solid ${color}40`, paddingLeft: '8px' }}>
              {user.description}
            </p>
          )}

          {/* Role editor — DSI only */}
          {isDSI && (
            <div className="mt-4" style={{ borderTop: `1px solid ${color}20`, paddingTop: '12px' }}>
              {roleEdit ? (
                <div className="flex items-center gap-2">
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as User['role'])}
                    autoFocus
                    className="flex-1 text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer"
                    style={{ background: '#ffffff0a', border: `1px solid ${color}40`, color: '#fff', borderRadius: 3, padding: '5px 8px' }}
                  >
                    <option value="DSI" style={{ background: '#0f1623' }}>★ DSI</option>
                    <option value="RESPONSABLE" style={{ background: '#0f1623' }}>▲ Responsable</option>
                    <option value="DEVELOPPEUR" style={{ background: '#0f1623' }}>◆ Développeur</option>
                    <option value="TECH_IT" style={{ background: '#0f1623' }}>● Tech IT</option>
                  </select>
                  <button
                    onClick={handleRoleSave}
                    disabled={savingRole}
                    className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 transition-all"
                    style={{ background: color, color: '#0a0f1a', borderRadius: 3, opacity: savingRole ? 0.6 : 1 }}
                  >
                    {savingRole ? '...' : 'OK'}
                  </button>
                  <button
                    onClick={() => { setRoleEdit(false); setNewRole(user.role); }}
                    className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 transition-all"
                    style={{ background: '#ffffff10', color: '#ffffff60', borderRadius: 3 }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setRoleEdit(true)}
                  className="w-full text-[9px] font-black uppercase tracking-[0.2em] py-1.5 transition-all"
                  style={{ background: '#ffffff08', border: `1px solid ${color}25`, color: `${color}90`, borderRadius: 3 }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}15`; e.currentTarget.style.color = color; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#ffffff08'; e.currentTarget.style.color = `${color}90`; }}
                >
                  ✦ Modifier le poste
                </button>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-6 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }} />

        {/* Controls */}
        <div className="px-6 py-3 flex items-center justify-between gap-3">
          {/* Mode toggle */}
          <div className="flex gap-1" style={{ background: '#ffffff08', borderRadius: 3, padding: 3 }}>
            {(['projets', 'interventions'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all"
                style={{
                  background: mode === m ? color : 'transparent',
                  color: mode === m ? '#0a0f1a' : '#ffffff50',
                  borderRadius: 2,
                }}
              >
                {m === 'projets' ? 'Projets' : 'Interv.'}
              </button>
            ))}
          </div>

          {/* Period */}
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as Period)}
            className="text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer transition-all"
            style={{
              background: '#ffffff08',
              border: `1px solid ${color}30`,
              color: `${color}cc`,
              borderRadius: 3,
              padding: '4px 8px',
            }}
          >
            {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([p, label]) => (
              <option key={p} value={p} style={{ background: '#0f1623' }}>{label}</option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }} />

        {/* Stats */}
        <div className="px-6 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 gap-3">
              <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: `${color}30`, borderTopColor: color }} />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: `${color}60` }}>Chargement...</span>
            </div>
          ) : stats ? (
            <div className="space-y-4">

              {/* Total activité */}
              <div className="flex items-center gap-3 p-3" style={{ background: '#ffffff06', border: `1px solid ${color}20`, borderRadius: 3 }}>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: '#ffffff40' }}>Activité totale</p>
                  <p className="text-3xl font-black font-mono leading-none mt-0.5" style={{ color }}>{stats.total}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: '#ffffff30' }}>tâches + interventions</p>
                </div>
              </div>

              {/* Taux + barre */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: '#ffffff40' }}>
                    {mode === 'projets' ? 'Complétion' : 'Résolution'}
                  </p>
                  <span className="text-lg font-black font-mono" style={{ color: rateColor }}>{rate}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#ffffff10' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${rate}%`, background: `linear-gradient(90deg, ${rateColor}80, ${rateColor})` }}
                  />
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-2">
                {(mode === 'projets' ? [
                  { label: 'Total', value: stats.tasks.total, c: '#ffffff' },
                  { label: 'En cours', value: stats.tasks.inProgress, c: '#a78bfa' },
                  { label: 'Terminées', value: stats.tasks.completed, c: '#4ade80' },
                ] : [
                  { label: 'Total', value: stats.interventions.total, c: '#ffffff' },
                  { label: 'En cours', value: stats.interventions.enCours, c: '#fbbf24' },
                  { label: 'Résolues', value: stats.interventions.resolu, c: '#4ade80' },
                ]).map(s => (
                  <div key={s.label} className="text-center p-3" style={{ background: `${s.c}06`, border: `1px solid ${s.c}15`, borderRadius: 3 }}>
                    <p className="text-2xl font-black font-mono leading-none" style={{ color: s.c }}>{s.value}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest mt-1.5" style={{ color: '#ffffff30' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Empty state */}
              {((mode === 'projets' && stats.tasks.total === 0) || (mode === 'interventions' && stats.interventions.total === 0)) && (
                <p className="text-center text-[9px] font-black uppercase tracking-widest" style={{ color: '#ffffff20' }}>
                  Aucune donnée sur cette période
                </p>
              )}
            </div>
          ) : null}
        </div>

        {/* Bottom strip */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />
      </div>
    </div>
  );
};

export default UserStatsModal;
