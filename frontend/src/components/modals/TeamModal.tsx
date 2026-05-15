import React from 'react';
import apiService from '@services/api';
import type { Project, User } from '@types/index';
import { getUserColor } from '@components/partials/SubTaskRow';

interface Props {
  open: boolean;
  onClose: () => void;
  project: Project;
  allUsers: User[];
  onSuccess: () => void;
}

const TeamModal: React.FC<Props> = ({ open, onClose, project, allUsers, onSuccess }) => {
  if (!open) return null;

  const handleRemove = async (userId: string, nom: string) => {
    if (!confirm(`Retirer @${nom} du squad ?`)) return;
    await apiService.removeProjectTeamMember(project.id, userId);
    onSuccess();
  };

  const handleAdd = async (userId: string) => {
    await apiService.addProjectTeamMember(project.id, { userId, role: 'SOLDAT' });
    onSuccess();
  };

  const availableUsers = allUsers.filter(u => !project.teams?.some(t => t.userId === u.id));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(26,29,46,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white w-full max-w-lg shadow-2xl overflow-y-auto" style={{ borderRadius: 24, maxHeight: '90vh' }}>

        <div className="px-8 pt-6 pb-0 flex justify-between items-center sticky top-0 bg-white z-10" style={{ borderRadius: '24px 24px 0 0' }}>
          <h2 style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Gérer le Squad
          </h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-700 text-2xl font-bold w-8 h-8 flex items-center justify-center transition-colors">×</button>
        </div>

        <div className="px-8 pt-5 pb-8 space-y-6">
          {/* Membres actuels */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Squad Actuel</p>
            <div className="space-y-2">
              {project.teams?.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-app)' }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: getUserColor(member.user?.id || member.userId) }}
                    >
                      {member.user?.photo
                        ? <img src={member.user.photo} className="w-full h-full object-cover" alt="" />
                        : member.user?.nom?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>@{member.user?.username ?? member.user?.nom}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: member.role === 'COLONEL' ? '#6366f1' : 'var(--text-muted)' }}>
                        {member.role === 'COLONEL' ? '🎖 Colonel' : '🪖 Soldat'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(member.userId, member.user?.username || member.user?.nom || '')}
                    className="text-[10px] font-bold text-slate-300 hover:text-red-500 uppercase tracking-widest transition-colors"
                  >
                    Retirer
                  </button>
                </div>
              ))}
              {(!project.teams || project.teams.length === 0) && (
                <p className="text-center text-slate-300 text-[10px] font-bold uppercase py-4">Aucun membre</p>
              )}
            </div>
          </div>

          {/* Ajouter des membres */}
          {availableUsers.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ajouter Soldats</p>
              <div className="space-y-1 max-h-48 overflow-y-auto rounded-xl p-2" style={{ background: 'var(--bg-app)' }}>
                {availableUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white hover:shadow-sm transition-all">
                    <div
                      className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: getUserColor(u.id) }}
                    >
                      {u.photo ? <img src={u.photo} className="w-full h-full object-cover" alt="" /> : u.nom[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>@{u.username}</p>
                      <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{u.role}</p>
                    </div>
                    <button
                      onClick={() => handleAdd(u.id)}
                      className="btn-primary py-1.5 px-3 text-[10px]"
                    >
                      Ajouter
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={onClose} className="btn-ghost w-full justify-center">Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default TeamModal;
