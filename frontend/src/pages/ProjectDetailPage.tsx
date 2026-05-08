import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@services/api';
import { type Project, type User } from '@types/index';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState<string | null>(null); // moduleId
  const [editingTask, setEditingTask] = useState<string | null>(null); // taskId
  const [taskProgress, setTaskProgress] = useState<number>(0);

  const [newModule, setNewModule] = useState({ nom: '', description: '' });
  const [newTask, setNewTask] = useState({ titre: '', description: '', assigneeId: '', priorite: 'MOYENNE' });

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => apiService.getProject(id!).then(r => r.data as Project),
    enabled: !!id,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.getUsers().then(r => r.data as User[]),
  });

  const moduleMutation = useMutation({
    mutationFn: (data: any) => apiService.createModule({ ...data, projectId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setShowModuleModal(false);
      setNewModule({ nom: '', description: '' });
    },
  });

  const taskMutation = useMutation({
    mutationFn: (data: any) => apiService.createTask({ ...data, projectId: id, moduleId: showTaskModal }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setShowTaskModal(null);
      setNewTask({ titre: '', description: '', assigneeId: '', priorite: 'MOYENNE' });
    },
  });

  const updateTaskProgressMutation = useMutation({
    mutationFn: ({ taskId, progress }: { taskId: string, progress: number }) =>
      apiService.updateTask(taskId, { progression: progress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setEditingTask(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 text-center bg-red-50 rounded-2xl border border-red-100">
        <p className="text-red-500 font-bold uppercase tracking-widest">Projet introuvable</p>
        <Link to="/projects" className="mt-4 inline-block text-xs font-bold text-slate-500 hover:text-slate-900 underline">Retour aux projets</Link>
      </div>
    );
  }

  const chartData = [...(project.history || [])]
    .reverse()
    .map(h => ({
      date: new Date(h.createdAt).toLocaleDateString(),
      progression: h.progression
    }));

  return (
    <div className="space-y-8 mx-auto px-4 ">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-2">
          <Link to="/projects" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
            ← Retour aux projets
          </Link>
          <h1 className="text-4xl font-black font-montserrat tracking-tighter text-slate-900 uppercase">{project.nom}</h1>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {project.id.slice(-8).toUpperCase()}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lancement: {new Date(project.dateDebut).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowModuleModal(true)}
            className="px-6 py-3 bg-slate-100 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
          >
            + Nouveau Module
          </button>
          <div className="w-px h-10 bg-slate-100 mx-2" />
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Statut</p>
            <span className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest ${project.statut === 'CRITIQUE' ? 'bg-red-100 text-red-600' :
              project.statut === 'TERMINE' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              }`}>
              {project.statut}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Chart */}
          <div className="premium-card">
            <h2 className="premium-title text-sm mb-8">Historique de Progression</h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" fontSize={10} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                  <YAxis fontSize={10} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="progression" stroke="#0f172a" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hierarchy */}
          <div className="space-y-6">
            <h2 className="premium-title text-sm">Modules & Tâches</h2>
            {project.modules?.length ? project.modules.map(module => (
              <div key={module.id} className="premium-card p-0 overflow-hidden border border-slate-100 shadow-sm">
                <div className="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tight">{module.nom}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{module.tasks?.length || 0} Tâches</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-xl font-black font-mono text-slate-900">{module.progression.toFixed(0)}%</span>
                      <div className="w-24 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                        <div className="bg-slate-900 h-full" style={{ width: `${module.progression}%` }} />
                      </div>
                    </div>
                    <button
                      onClick={() => setShowTaskModal(module.id)}
                      className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {module.tasks?.map(task => (
                    <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 group">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${task.statut === 'COMPLETEE' ? 'bg-green-500' : 'bg-blue-400'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-700">{task.titre}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-black text-slate-300 uppercase">Assigné à:</span>
                            <span className="text-[9px] font-black text-slate-900 uppercase tracking-tighter">{task.assignee?.nom || 'Non assigné'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {editingTask === task.id ? (
                          <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-slate-200 shadow-inner">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={taskProgress}
                              onChange={e => setTaskProgress(parseInt(e.target.value))}
                              className="w-12 text-center text-xs font-black font-mono outline-none"
                            />
                            <button
                              onClick={() => updateTaskProgressMutation.mutate({ taskId: task.id, progress: taskProgress })}
                              className="bg-slate-900 text-white px-2 py-1 rounded text-[8px] font-black uppercase"
                            >
                              OK
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => { setEditingTask(task.id); setTaskProgress(task.progression); }}
                            className="cursor-pointer flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="text-[10px] font-black font-mono text-slate-400">{task.progression}%</span>
                            <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="bg-slate-400 h-full" style={{ width: `${task.progression}%` }} />
                            </div>
                          </div>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${task.priorite === 'CRITIQUE' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'
                          }`}>
                          {task.priorite}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-slate-300 text-sm font-bold uppercase tracking-widest">Aucun module configuré</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="premium-card">
            <h2 className="premium-title text-[10px] text-slate-400 mb-6">Résumé Opérationnel</h2>
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Progression Globale</p>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-4xl font-black font-mono text-slate-900">{project.progressionGlobale.toFixed(0)}%</span>
                  <span className="text-[10px] font-bold text-green-500 uppercase">En progression</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
                  <div className="bg-slate-900 h-full" style={{ width: `${project.progressionGlobale}%` }} />
                </div>
              </div>

              <div className="premium-card p-6 bg-slate-900 text-white border-none">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Description</p>
                <p className="text-sm leading-relaxed font-medium italic text-white/80">
                  "{project.description || 'Pas de spécifications enregistrées.'}"
                </p>
              </div>
            </div>
          </div>

          <div className="premium-card">
            <h2 className="premium-title text-[10px] text-slate-400 mb-6">Intervenants</h2>
            <div className="space-y-3">
              {project.teams?.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-900 border border-slate-200 shadow-sm overflow-hidden">
                    {member.user?.photo ? <img src={member.user.photo} className="w-full h-full object-cover" /> : member.user?.nom?.[0]}
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{member.user?.nom}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals are unchanged from previous turn, just ensuring they exist */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-10 rounded-[32px] shadow-2xl space-y-6">
            <h2 className="text-xl font-black font-montserrat uppercase tracking-tight text-slate-900">Nouveau <span className="text-slate-400">Module</span></h2>
            <form onSubmit={(e) => { e.preventDefault(); moduleMutation.mutate(newModule); }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom du Module</label>
                <input type="text" required value={newModule.nom} onChange={e => setNewModule({ ...newModule, nom: e.target.value })} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold outline-none focus:border-slate-900" />
              </div>
              <button type="submit" disabled={moduleMutation.isPending} className="w-full py-4 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-slate-800 transition-all">
                {moduleMutation.isPending ? 'Création...' : 'Créer Module'}
              </button>
              <button type="button" onClick={() => setShowModuleModal(false)} className="w-full py-4 text-slate-400 font-black uppercase text-xs tracking-widest hover:text-slate-900">Annuler</button>
            </form>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-10 rounded-[32px] shadow-2xl space-y-6">
            <h2 className="text-xl font-black font-montserrat uppercase tracking-tight text-slate-900">Assigner <span className="text-slate-400">Tâche</span></h2>
            <form onSubmit={(e) => { e.preventDefault(); taskMutation.mutate(newTask); }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Titre</label>
                <input type="text" required value={newTask.titre} onChange={e => setNewTask({ ...newTask, titre: e.target.value })} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold outline-none focus:border-slate-900" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigner à</label>
                <select required value={newTask.assigneeId} onChange={e => setNewTask({ ...newTask, assigneeId: e.target.value })} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold outline-none focus:border-slate-900">
                  <option value="">Sélectionner un membre</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.nom}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Priorité</label>
                <select value={newTask.priorite} onChange={e => setNewTask({ ...newTask, priorite: e.target.value })} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold outline-none focus:border-slate-900">
                  <option value="BASSE">BASSE</option>
                  <option value="MOYENNE">MOYENNE</option>
                  <option value="HAUTE">HAUTE</option>
                  <option value="CRITIQUE">CRITIQUE</option>
                </select>
              </div>
              <button type="submit" disabled={taskMutation.isPending} className="w-full py-4 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-slate-800 transition-all">
                {taskMutation.isPending ? 'Assignation...' : 'Assigner Tâche'}
              </button>
              <button type="button" onClick={() => setShowTaskModal(null)} className="w-full py-4 text-slate-400 font-black uppercase text-xs tracking-widest hover:text-slate-900">Annuler</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
