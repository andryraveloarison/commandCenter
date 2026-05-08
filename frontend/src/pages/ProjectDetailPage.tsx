import React, { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@services/api';
import { type Project, type User } from '@types/index';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// ─── Deterministic color from user ID ───────────────────────────────────────
const USER_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
];
const userColorCache: Record<string, string> = {};
const getUserColor = (userId: string): string => {
  if (!userColorCache[userId]) {
    const idx = Object.keys(userColorCache).length % USER_COLORS.length;
    userColorCache[userId] = USER_COLORS[idx];
  }
  return userColorCache[userId];
};

// ─── Recursive SubTask Component ────────────────────────────────────────────
const SubTaskRow: React.FC<{
  task: any;
  depth: number;
  projectId: string;
  users: User[];
  onRefresh: () => void;
}> = ({ task, depth, projectId, users, onRefresh }) => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [progress, setProgress] = useState(task.progression);
  const [showAddSub, setShowAddSub] = useState(false);
  const [subTitle, setSubTitle] = useState('');
  const [subAssignee, setSubAssignee] = useState('');

  const updateMutation = useMutation({
    mutationFn: () => apiService.updateTask(task.id, { progression: progress }),
    onSuccess: () => { setEditing(false); onRefresh(); },
  });

  const addSubMutation = useMutation({
    mutationFn: () => apiService.createSubtask(task.id, {
      titre: subTitle,
      projectId,
      assigneeId: subAssignee || undefined,
    }),
    onSuccess: () => { setShowAddSub(false); setSubTitle(''); setSubAssignee(''); onRefresh(); },
  });

  const dotColor = task.assignee ? getUserColor(task.assignee.id) : '#cbd5e1';

  return (
    <div>
      <div
        className={`flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/50 group border-l-2 transition-colors`}
        style={{ marginLeft: `${depth * 20}px`, borderLeftColor: dotColor + '40' }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: dotColor }}
            title={task.assignee?.nom || 'Non assigné'}
          />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold text-slate-700 truncate ${task.progression >= 100 ? 'line-through text-slate-400' : ''}`}>
              {task.titre}
            </p>
            {task.assignee && (
              <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: dotColor }}>
                {task.assignee.nom}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {editing ? (
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1">
              <input
                type="number" min="0" max="100"
                value={progress}
                onChange={e => setProgress(parseInt(e.target.value) || 0)}
                className="w-10 text-center text-xs font-black font-mono outline-none"
              />
              <button
                onClick={() => updateMutation.mutate()}
                className="bg-slate-900 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase"
              >OK</button>
            </div>
          ) : (
            <button
              onClick={() => { setEditing(true); setProgress(task.progression); }}
              className="flex items-center gap-2 opacity-50 group-hover:opacity-100"
            >
              <span className="text-[10px] font-black font-mono text-slate-500">{Math.round(task.progression)}%</span>
              <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${task.progression}%`, backgroundColor: dotColor }} />
              </div>
            </button>
          )}
          <button
            onClick={() => setShowAddSub(!showAddSub)}
            className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-100 text-[10px] font-black"
            title="Ajouter sous-tâche"
          >+</button>
        </div>
      </div>

      {showAddSub && (
        <div className="flex items-center gap-2 py-1.5 px-3 bg-slate-50 border-l-2 border-slate-200" style={{ marginLeft: `${(depth + 1) * 20}px` }}>
          <input
            type="text" placeholder="Titre sous-tâche..."
            value={subTitle}
            onChange={e => setSubTitle(e.target.value)}
            className="flex-1 text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none"
          />
          <select value={subAssignee} onChange={e => setSubAssignee(e.target.value)} className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none">
            <option value="">— Assigné —</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.nom}</option>)}
          </select>
          <button
            onClick={() => { if (subTitle.trim()) addSubMutation.mutate(); }}
            disabled={!subTitle.trim() || addSubMutation.isPending}
            className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase disabled:opacity-40"
          >Ajouter</button>
          <button onClick={() => setShowAddSub(false)} className="text-slate-300 hover:text-slate-900 text-[10px] font-black">✕</button>
        </div>
      )}

      {task.subtasks?.map((sub: any) => (
        <SubTaskRow key={sub.id} task={sub} depth={depth + 1} projectId={projectId} users={users} onRefresh={onRefresh} />
      ))}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState<string | null>(null);
  const [newModule, setNewModule] = useState({ nom: '', description: '', responsibleIds: [] as string[] });
  const [newTask, setNewTask] = useState({ titre: '', assigneeId: '', priorite: 'MOYENNE' });

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => apiService.getProject(id!).then(r => r.data as Project),
    enabled: !!id,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.getUsers().then(r => r.data as User[]),
  });

  const refresh = useCallback(() => queryClient.invalidateQueries({ queryKey: ['project', id] }), [id, queryClient]);

  const moduleMutation = useMutation({
    mutationFn: (data: any) => apiService.createModule({ ...data, projectId: id }),
    onSuccess: () => { refresh(); setShowModuleModal(false); setNewModule({ nom: '', description: '', responsibleIds: [] }); },
  });

  const taskMutation = useMutation({
    mutationFn: (data: any) => apiService.createTask({ ...data, projectId: id, moduleId: showTaskModal }),
    onSuccess: () => { refresh(); setShowTaskModal(null); setNewTask({ titre: '', assigneeId: '', priorite: 'MOYENNE' }); },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
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

  const chartData = [...(project.history || [])].reverse().map(h => ({
    date: new Date(h.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    progression: Math.round(h.progression),
    note: h.note,
  }));

  const toggleResponsible = (userId: string) => {
    setNewModule(prev => ({
      ...prev,
      responsibleIds: prev.responsibleIds.includes(userId)
        ? prev.responsibleIds.filter(id => id !== userId)
        : [...prev.responsibleIds, userId],
    }));
  };

  const statusColor = project.statut === 'TERMINE' ? 'bg-green-100 text-green-700'
    : project.statut === 'CRITIQUE' ? 'bg-red-100 text-red-600'
    : 'bg-blue-100 text-blue-600';

  return (
    <div className="space-y-8 mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-2">
          <Link to="/projects" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">← Retour aux projets</Link>
          <h1 className="text-4xl font-black font-montserrat tracking-tighter text-slate-900 uppercase">{project.nom}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {project.id.slice(-8).toUpperCase()}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Lancement: {new Date(project.dateDebut).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowModuleModal(true)} className="px-5 py-2.5 bg-slate-100 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all">
            + Module
          </button>
          <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
            {project.statut}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* History Chart */}
          <div className="premium-card">
            <h2 className="premium-title text-sm mb-6">Historique de Progression</h2>
            {chartData.length > 0 ? (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <YAxis fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} domain={[0, 100]} />
                    <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="4 2" strokeWidth={1} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 700 }}
                      formatter={(v: any) => [`${v}%`, 'Progression']}
                    />
                    <Line type="monotone" dataKey="progression" stroke="#0f172a" strokeWidth={2.5} dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[100px] flex items-center justify-center">
                <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">Aucune donnée historique</p>
              </div>
            )}
          </div>

          {/* Modules & Tasks */}
          <div className="space-y-5">
            <h2 className="premium-title text-sm">Modules & Tâches</h2>
            {project.modules?.length ? project.modules.map(module => (
              <div key={module.id} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                {/* Module Header */}
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tight">{module.nom}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {(module as any).responsibles?.map((r: any) => (
                        <span key={r.id} className="text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider text-white" style={{ backgroundColor: getUserColor(r.id) }}>
                          {r.nom}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="text-xl font-black font-mono text-slate-900">{Math.round(module.progression)}%</p>
                      <div className="w-20 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                        <div className="bg-slate-900 h-full" style={{ width: `${module.progression}%` }} />
                      </div>
                    </div>
                    <button onClick={() => setShowTaskModal(module.id)} className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-sm font-black">+</button>
                  </div>
                </div>

                {/* Tasks */}
                <div className="divide-y divide-slate-50/80 bg-white">
                  {module.tasks?.length ? module.tasks.map((task: any) => (
                    <SubTaskRow key={task.id} task={task} depth={0} projectId={id!} users={users} onRefresh={refresh} />
                  )) : (
                    <p className="text-center text-slate-300 text-[10px] font-black uppercase py-4">Aucune tâche</p>
                  )}
                </div>
              </div>
            )) : (
              <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-slate-300 text-sm font-bold uppercase tracking-widest">Aucun module configuré</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="premium-card">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Progression Globale</p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-5xl font-black font-mono text-slate-900">{Math.round(project.progressionGlobale)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${project.progressionGlobale}%`, backgroundColor: project.progressionGlobale >= 100 ? '#22c55e' : '#0f172a' }} />
            </div>
            {project.progressionGlobale >= 100 && (
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mt-2">✅ Projet terminé</p>
            )}
          </div>

          {/* Legend */}
          {users.length > 0 && (
            <div className="premium-card">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Légende des Intervenants</p>
              <div className="space-y-2">
                {users.filter(u => userColorCache[u.id]).map(u => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getUserColor(u.id) }} />
                    <span className="text-xs font-bold text-slate-700">{u.nom}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team */}
          <div className="premium-card">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Équipe Assignée</p>
            <div className="space-y-2">
              {project.teams?.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl">
                  <div
                    className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-[10px] font-black text-white"
                    style={{ backgroundColor: getUserColor(member.user?.id || member.userId) }}
                  >
                    {member.user?.photo
                      ? <img src={member.user.photo} className="w-full h-full object-cover" alt="" />
                      : member.user?.nom?.[0]}
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 uppercase">{member.user?.nom}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg p-10 rounded-[32px] shadow-2xl space-y-6">
            <h2 className="text-xl font-black font-montserrat uppercase tracking-tight text-slate-900">Nouveau <span className="text-slate-400">Module</span></h2>
            <form onSubmit={e => { e.preventDefault(); moduleMutation.mutate(newModule); }} className="space-y-5">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom du Module</label>
                <input type="text" required value={newModule.nom} onChange={e => setNewModule({ ...newModule, nom: e.target.value })} className="mt-1 w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold outline-none focus:border-slate-900" />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Responsables du Module</label>
                <div className="grid grid-cols-2 gap-2">
                  {users.map(u => (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => toggleResponsible(u.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-left ${newModule.responsibleIds.includes(u.id) ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 bg-slate-50 text-slate-700'}`}
                    >
                      <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: getUserColor(u.id) }} />
                      <span className="text-[10px] font-black uppercase truncate">{u.nom}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModuleModal(false)} className="flex-1 py-3.5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900">Annuler</button>
                <button type="submit" disabled={moduleMutation.isPending} className="flex-1 py-3.5 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-800 disabled:opacity-50">
                  {moduleMutation.isPending ? 'Création...' : 'Créer Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-10 rounded-[32px] shadow-2xl space-y-5">
            <h2 className="text-xl font-black font-montserrat uppercase tracking-tight text-slate-900">Assigner <span className="text-slate-400">Tâche</span></h2>
            <form onSubmit={e => { e.preventDefault(); taskMutation.mutate(newTask); }} className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Titre</label>
                <input type="text" required value={newTask.titre} onChange={e => setNewTask({ ...newTask, titre: e.target.value })} className="mt-1 w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold outline-none focus:border-slate-900" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigné à</label>
                <select required value={newTask.assigneeId} onChange={e => setNewTask({ ...newTask, assigneeId: e.target.value })} className="mt-1 w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold outline-none focus:border-slate-900">
                  <option value="">Sélectionner un membre</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Priorité</label>
                <select value={newTask.priorite} onChange={e => setNewTask({ ...newTask, priorite: e.target.value })} className="mt-1 w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold outline-none focus:border-slate-900">
                  <option value="BASSE">BASSE</option>
                  <option value="MOYENNE">MOYENNE</option>
                  <option value="HAUTE">HAUTE</option>
                  <option value="CRITIQUE">CRITIQUE</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowTaskModal(null)} className="flex-1 py-3.5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900">Annuler</button>
                <button type="submit" disabled={taskMutation.isPending} className="flex-1 py-3.5 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-800 disabled:opacity-50">
                  {taskMutation.isPending ? 'Assignation...' : 'Créer Tâche'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
