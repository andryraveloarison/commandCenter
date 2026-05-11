import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiService from '@services/api';
import { type Project, type User } from '@types/index';
import CreateProjectModal from '@components/modals/CreateProjectModal';

const ProjectLogo: React.FC<{ logo?: string; nom: string }> = ({ logo, nom }) => {
  if (!logo) return <span className="text-lg font-black text-slate-400">{nom[0]?.toUpperCase() || '?'}</span>;
  return <img src={logo} alt="" className="w-full h-full object-cover" />;
};

const ProjectsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

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
            <Link key={project.id} to={`/projects/${project.id}`} className="premium-card h-full flex flex-col hover:border-slate-400 group">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    <ProjectLogo logo={project.logo} nom={project.nom} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PJ_{project.id.slice(-4).toUpperCase()}</span>
                </div>
                <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${project.statut === 'CRITIQUE' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'}`}>
                  {project.statut}
                </span>
              </div>

              <h3 className="text-2xl font-black font-montserrat tracking-tight mb-4 text-slate-900 uppercase">{project.nom}</h3>
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
          ))}
        </div>
      </div>

      <CreateProjectModal
        open={showModal}
        onClose={() => setShowModal(false)}
        users={users}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['projects'] })}
      />
    </div>
  );
};

export default ProjectsPage;
