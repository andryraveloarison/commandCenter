import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiService from '@services/api';
import type { User } from '@types/index';
import { getUserColor } from '@components/partials/SubTaskRow';

interface Props {
  user: User;
  onClose: () => void;
}

type Mode   = 'projets' | 'interventions';
type Period = 'semaine' | 'mois' | 'annee' | 'tout';

const ROLE_LABELS: Record<string, string> = {
  DSI: 'DSI', RESPONSABLE: 'Responsable', DEVELOPPEUR: 'Développeur', TECH_IT: 'Tech IT',
};

const PERIOD_LABELS: Record<Period, string> = {
  semaine: 'Semaine', mois: 'Mois', annee: 'Année', tout: 'Tout',
};

const UserStatsModal: React.FC<Props> = ({ user, onClose }) => {
  const [mode, setMode]     = useState<Mode>('projets');
  const [period, setPeriod] = useState<Period>('tout');

  const color = getUserColor(user.id);

  const { data: stats, isLoading, isFetching } = useQuery({
    queryKey: ['user-stats', user.id, period],
    queryFn: () => apiService.getUserStatistics(user.id, period === 'tout' ? undefined : period).then(r => r.data),
    staleTime: 0,
    placeholderData: (prev) => prev,
  });

  const taskRate = stats?.tasks?.total > 0
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) : 0;

  const ivRate = stats?.interventions?.total > 0
    ? Math.round((stats.interventions.resolu / stats.interventions.total) * 100) : 0;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm shadow-2xl overflow-hidden"
        style={{ borderRadius: 24, zIndex: 10000 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-7 pb-5 text-center relative" style={{ background: `${color}10`, borderBottom: '1px solid #f1f5f9' }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-slate-700 text-2xl font-bold w-8 h-8 flex items-center justify-center transition-colors"
          >×</button>

          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-3 overflow-hidden flex items-center justify-center text-white text-2xl font-black"
            style={{ backgroundColor: color }}
          >
            {user.photo
              ? <img src={user.photo} className="w-full h-full object-cover" alt="" />
              : user.nom[0]
            }
          </div>

          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{user.nom}</h2>
          <p className="text-[10px] font-black tracking-widest mt-0.5" style={{ color }}>@{user.username}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 uppercase tracking-widest">
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
              user.statut === 'ACTIF'  ? 'bg-green-100 text-green-600' :
              user.statut === 'OCCUPE' ? 'bg-amber-100 text-amber-600' :
              'bg-slate-100 text-slate-400'
            }`}>
              {user.statut}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 pt-4 pb-0 flex flex-col gap-3">
          {/* Mode switch */}
          <div className="flex rounded-xl overflow-hidden border border-slate-100 self-center">
            {(['projets', 'interventions'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors"
                style={{
                  background: mode === m ? color : '#fff',
                  color: mode === m ? '#fff' : '#9CA3AF',
                }}
              >
                {m === 'projets' ? 'Projets' : 'Interventions'}
              </button>
            ))}
          </div>

          {/* Period filter */}
          <div className="flex justify-center">
            <select
              value={period}
              onChange={e => setPeriod(e.target.value as Period)}
              className="text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-slate-900 transition-colors text-slate-700 cursor-pointer"
            >
              {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([p, label]) => (
                <option key={p} value={p}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="px-8 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-7 h-7 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            </div>
          ) : stats ? (
            <div className="space-y-4">
              {/* Total global badge */}
              <div className="flex items-center justify-center gap-2 py-2 rounded-xl" style={{ background: `${color}08`, border: `1.5px solid ${color}18` }}>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total activité</span>
                <span className="text-2xl font-black font-mono" style={{ color }}>{stats.total}</span>
                <span className="text-[9px] font-bold text-slate-300">tâches + interventions</span>
              </div>

              {mode === 'projets' ? (
                <>
                  {/* Task rate */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Taux de complétion</p>
                      <span className="text-xl font-black font-mono text-slate-900">{taskRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${taskRate}%`, backgroundColor: taskRate >= 80 ? '#22c55e' : taskRate >= 50 ? '#6366f1' : '#f97316' }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Total',     value: stats.tasks.total,      color: '#1A1D2E' },
                      { label: 'En cours',  value: stats.tasks.inProgress, color: '#6366f1' },
                      { label: 'Terminées', value: stats.tasks.completed,  color: '#22c55e' },
                    ].map(s => (
                      <div key={s.label} className="text-center p-3 rounded-2xl" style={{ background: `${s.color}08`, border: `1.5px solid ${s.color}18` }}>
                        <p className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {stats.tasks.total === 0 && (
                    <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Aucune tâche sur cette période</p>
                  )}
                </>
              ) : (
                <>
                  {/* Intervention rate */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Taux de résolution</p>
                      <span className="text-xl font-black font-mono text-slate-900">{ivRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${ivRate}%`, backgroundColor: ivRate >= 80 ? '#22c55e' : ivRate >= 50 ? '#6366f1' : '#f97316' }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Total',     value: stats.interventions.total,     color: '#1A1D2E' },
                      { label: 'En cours',  value: stats.interventions.enCours,   color: '#f59e0b' },
                      { label: 'Résolues',  value: stats.interventions.resolu,    color: '#22c55e' },
                    ].map(s => (
                      <div key={s.label} className="text-center p-3 rounded-2xl" style={{ background: `${s.color}08`, border: `1.5px solid ${s.color}18` }}>
                        <p className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {stats.interventions.total === 0 && (
                    <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Aucune intervention sur cette période</p>
                  )}
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UserStatsModal;
