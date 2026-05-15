import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiService from '@services/api';
import { type ProjectVersion } from '@types/index';
import { STATUS_COLORS, PRIORITY_COLORS, getStatusLabel, getPriorityLabel } from './VersionHistoryList';

interface Props {
  versionId: string;
  onClose: () => void;
}

const VersionDetailPanel: React.FC<Props> = ({ versionId, onClose }) => {
  function fmt(dateStr: string) {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  const { data: version, isLoading } = useQuery<ProjectVersion>({
    queryKey: ['version', versionId],
    queryFn: () => apiService.getVersion(versionId).then(r => r.data),
    enabled: !!versionId,
  });

  if (isLoading) {
    return (
      <div className="premium-card flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!version) return null;

  const tasks = version.tasks ?? [];
  const fromDate = version.previousVersion
    ? new Date(version.previousVersion.date)
    : null;

  return (
    <div className="premium-card">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="premium-title text-sm">{version.nom}</h2>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            {fmt(version.date)}
          </p>
          {version.description && (
            <p className="text-xs text-slate-500 mt-2">{version.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-300 hover:text-slate-900 font-black text-lg transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Période couverte */}
      <div className="mb-5 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Période couverte</p>
        <p className="text-xs font-bold text-slate-700">
          {fromDate
            ? `Du ${fmt(fromDate.toISOString())}`
            : 'Depuis le début du projet'}
          {' → '}
          {fmt(version.date)}
        </p>
        {version.previousVersion && (
          <p className="text-[9px] text-slate-400 mt-1">
            Version précédente : <span className="font-black">{version.previousVersion.nom}</span>
          </p>
        )}
      </div>

      {/* Compteur */}
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 bg-green-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
          {tasks.length} tâche{tasks.length !== 1 ? 's' : ''} terminée{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Liste des tâches */}
      {tasks.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
          <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">Aucune tâche terminée</p>
          <p className="text-slate-300 text-[10px] mt-1">pendant cette période</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {tasks.map(task => (
            <div
              key={task.id}
              className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[task.statut] ?? '#9CA3AF' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 leading-snug">{task.titre}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${STATUS_COLORS[task.statut]}20`,
                        color: STATUS_COLORS[task.statut],
                      }}
                    >
                      {getStatusLabel(task.statut)}
                    </span>
                    <span
                      className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${PRIORITY_COLORS[task.priorite]}15`,
                        color: PRIORITY_COLORS[task.priorite],
                      }}
                    >
                      {getPriorityLabel(task.priorite)}
                    </span>
                    {(task as any).module && (
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                        {(task as any).module.nom}
                      </span>
                    )}
                    {task.assignee && (
                      <span className="text-[8px] font-bold text-slate-400">
                        → @{(task.assignee as any).username ?? task.assignee.nom}
                      </span>
                    )}
                    <span className="text-[8px] font-mono text-slate-300 ml-auto">
                      terminée le {new Date((task as any).completedAt ?? task.updatedAt).toLocaleString('fr-FR', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VersionDetailPanel;
