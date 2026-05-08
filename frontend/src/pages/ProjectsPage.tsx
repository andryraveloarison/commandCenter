import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiService from '@services/api';
import { type Project } from '@types/index';

const ProjectsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({
    nom: '',
    description: '',
    dateDebut: new Date().toISOString().split('T')[0],
    priorite: 'MOYENNE',
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiService.getProjects().then(r => r.data as Project[]),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowModal(false);
      setNewProject({
        nom: '',
        description: '',
        dateDebut: new Date().toISOString().split('T')[0],
        priorite: 'MOYENNE',
      });
    },
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
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-end items-end md:items-end gap-6">

        <button
          onClick={() => setShowModal(true)}
          className="px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-slate-800 transition-all"
        >
          + Nouveau Projet
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div key={project.id}>
            <Link
              to={`/projects/${project.id}`}
              className="premium-card h-full flex flex-col hover:border-slate-400 group"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-900" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PJ_{project.id.slice(-4).toUpperCase()}</span>
                </div>
                <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${project.statut === 'CRITIQUE' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'
                  }`}>
                  {project.statut}
                </span>
              </div>

              <h3 className="text-2xl font-black font-montserrat tracking-tight mb-4 text-slate-900 uppercase">
                {project.nom}
              </h3>

              <p className="text-sm text-slate-500 font-medium mb-10 line-clamp-2 leading-relaxed italic">
                "{project.description || 'Pas de description technique.'}"
              </p>

              <div className="mt-auto space-y-4">
                <div className="flex justify-between text-[10px] font-black text-slate-900 tracking-widest uppercase">
                  <span>Progression Globale</span>
                  <span className="font-mono">{project.progressionGlobale.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                  <div
                    className="bg-slate-900 h-full rounded-full"
                    style={{ width: `${project.progressionGlobale}%` }}
                  />
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

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl p-10 rounded-[32px] shadow-2xl space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black font-montserrat uppercase tracking-tight text-slate-900">Initialiser un <span className="text-slate-400">Projet</span></h2>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-slate-900 font-bold">×</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(newProject); }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Nom du Projet</label>
                <input
                  type="text"
                  required
                  value={newProject.nom}
                  onChange={(e) => setNewProject({ ...newProject, nom: e.target.value })}
                  placeholder="EX: MIGRATION CLOUD 2026"
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-900 font-bold focus:border-slate-900 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Description Technique</label>
                <textarea
                  rows={3}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Spécifications et objectifs..."
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-900 font-bold focus:border-slate-900 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Date de Lancement</label>
                  <input
                    type="date"
                    required
                    value={newProject.dateDebut}
                    onChange={(e) => setNewProject({ ...newProject, dateDebut: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-900 font-bold focus:border-slate-900 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Priorité</label>
                  <select
                    value={newProject.priorite}
                    onChange={(e) => setNewProject({ ...newProject, priorite: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-900 font-bold focus:border-slate-900 outline-none transition-all"
                  >
                    <option value="BASSE">BASSE</option>
                    <option value="MOYENNE">MOYENNE</option>
                    <option value="HAUTE">HAUTE</option>
                    <option value="CRITIQUE">CRITIQUE</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-400 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 shadow-xl transition-all disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Initialisation...' : 'Créer Projet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
