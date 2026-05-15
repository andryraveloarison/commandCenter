import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@services/api';
import { type ProjectVersion } from '@types/index';

interface Props {
  versions: ProjectVersion[];
  projectId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateClick: () => void;
  canDelete?: boolean;
  onAccessDenied?: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  BASSE: '#6B7280',
  MOYENNE: '#3B82F6',
  HAUTE: '#F59E0B',
  CRITIQUE: '#EF4444',
};

const STATUS_COLORS: Record<string, string> = {
  TODO: '#9CA3AF',
  EN_COURS: '#3B82F6',
  EN_REVIEW: '#8B5CF6',
  COMPLETEE: '#22C55E',
  BLOQUEE: '#EF4444',
};

export function getStatusLabel(s: string) {
  return { TODO: 'À faire', EN_COURS: 'En cours', EN_REVIEW: 'En review', COMPLETEE: 'Terminée', BLOQUEE: 'Bloquée' }[s] ?? s;
}

export function getPriorityLabel(p: string) {
  return { BASSE: 'Basse', MOYENNE: 'Moyenne', HAUTE: 'Haute', CRITIQUE: 'Critique' }[p] ?? p;
}

export { STATUS_COLORS, PRIORITY_COLORS };

const VersionHistoryList: React.FC<Props> = ({
  versions, projectId, selectedId, onSelect, onCreateClick, canDelete = true, onAccessDenied,
}) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteVersion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
    },
  });

  const handleDelete = (e: React.MouseEvent, id: string, nom: string) => {
    e.stopPropagation();
    if (!canDelete) { onAccessDenied?.(); return; }
    if (confirm(`Supprimer la version "${nom}" ?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="premium-card">
      <div className="flex justify-between items-center mb-5">
        <h2 className="premium-title text-sm">Historique des Versions</h2>
        <button
          onClick={onCreateClick}
          className="px-4 py-2 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-all"
        >
          + Nouvelle version
        </button>
      </div>

      {versions.length === 0 ? (
        <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
          <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">Aucune version créée</p>
          <p className="text-slate-300 text-[10px] font-bold mt-1">Créez votre première version pour suivre l'évolution</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-slate-100" />

          <div className="space-y-3">
            {[...versions].reverse().map((v, idx) => {
              const isSelected = v.id === selectedId;
              const isLatest = idx === 0;

              return (
                <div
                  key={v.id}
                  onClick={() => onSelect(v.id)}
                  className="relative pl-10 cursor-pointer group"
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute left-[11px] top-3.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: isSelected ? '#0f172a' : '#fff',
                      borderColor: isSelected ? '#0f172a' : isLatest ? '#22c55e' : '#cbd5e1',
                    }}
                  >
                    {isLatest && !isSelected && (
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    )}
                  </div>

                  <div
                    className="p-4 rounded-2xl border transition-all"
                    style={{
                      backgroundColor: isSelected ? '#f8fafc' : '#fff',
                      borderColor: isSelected ? '#0f172a' : '#f1f5f9',
                      boxShadow: isSelected ? '0 0 0 1px #0f172a' : 'none',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{v.nom}</span>
                          {isLatest && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[8px] font-black uppercase tracking-widest rounded-md">
                              Dernière
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {new Date(v.date).toLocaleString('fr-FR', {
                            day: '2-digit', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                        {v.description && (
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{v.description}</p>
                        )}
                        {v.createdBy && (
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-wider mt-1">
                            par @{v.createdBy.username ?? v.createdBy.nom}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, v.id, v.nom)}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-slate-300 hover:text-red-500 transition-all text-sm flex-shrink-0"
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionHistoryList;
