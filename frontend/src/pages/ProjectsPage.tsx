import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@store/store';
import apiService from '@services/api';
import { type Project, type User } from '@types/index';
import CreateProjectModal from '@components/modals/CreateProjectModal';

const ProjectLogo: React.FC<{ logo?: string; nom: string }> = ({ logo, nom }) => {
  if (!logo) return <span className="text-lg font-black text-slate-400">{nom[0]?.toUpperCase() || '?'}</span>;
  return <img src={logo} alt="" className="w-full h-full object-cover" />;
};

const ProjectsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiService.deleteProject(deleteTarget.id);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiService.getProjects().then(r => r.data as Project[]),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.getUsers().then(r => r.data as User[]),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="space-y-12 ">
        <div className="flex justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-slate-800 transition-all"
          >
            + Nouveau Projet
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="premium-card h-full flex flex-col group relative">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    <ProjectLogo logo={project.logo} nom={project.nom} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PJ_{project.id.slice(-4).toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                    project.statut === 'CRITIQUE' ? 'bg-red-50 text-red-500' :
                    project.statut === 'EN_COURS' ? 'bg-blue-50 text-blue-600' :
                    project.statut === 'TERMINE'  ? 'bg-green-50 text-green-600' :
                    project.statut === 'EN_PAUSE' ? 'bg-amber-50 text-amber-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {project.statut.replace('_', ' ')}
                  </span>
                  {currentUser?.role === 'DSI' && (
                    <button
                      onClick={() => setDeleteTarget(project)}
                      title="Supprimer le projet"
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600"
                    >
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <Link to={`/projects/${project.id}`} className="flex-1 flex flex-col min-h-0">
                <h3 className="text-2xl font-black font-montserrat tracking-tight mb-4 text-slate-900 uppercase hover:underline">{project.nom}</h3>
                <p className="text-sm text-slate-500 font-medium mb-10 line-clamp-2 leading-relaxed italic">
                  "{project.description || 'Pas de description technique.'}"
                </p>

                <div className="mt-auto space-y-4">
                  <div className="flex justify-between text-[10px] font-black text-slate-900 tracking-widest uppercase">
                    <span>Progression Globale</span>
                    <span className="font-mono">{project.progressionGlobale.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                    <div className="bg-slate-900 h-full rounded-full" style={{ width: `${project.progressionGlobale}%` }} />
                  </div>
                  <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Priorité</p>
                      <p className="text-xs font-black text-slate-900 uppercase">{project.priorite}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Date Début</p>
                      <p className="text-xs font-black text-slate-900 uppercase">{new Date(project.dateDebut).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <CreateProjectModal
        open={showModal}
        onClose={() => setShowModal(false)}
        users={users}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['projects'] })}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Action irréversible</p>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Supprimer le projet</h3>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Vous allez supprimer <span className="font-black text-slate-900">"{deleteTarget.nom}"</span> ainsi que toutes ses tâches. Cette action est définitive.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
