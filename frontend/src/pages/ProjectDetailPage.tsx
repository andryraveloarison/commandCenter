import React, { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@services/api';
import { type Project, type User, type ProjectVersion } from '@types/index';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import SubTaskRow, { getUserColor } from '@components/partials/SubTaskRow';
import ModuleModal from '@components/modals/ModuleModal';
import TaskModal from '@components/modals/TaskModal';
import TeamModal from '@components/modals/TeamModal';
import EditProjectModal from '@components/modals/EditProjectModal';
import CreateVersionModal from '@components/modals/CreateVersionModal';
import AccessDeniedModal from '@components/modals/AccessDeniedModal';
import TaskDetailModal from '@components/modals/TaskDetailModal';
import UserStatsModal from '@components/modals/UserStatsModal';
import { VersionHistoryList, VersionDetailPanel } from '@components/versions';
import { useAppSelector } from '@hooks/useAppRedux';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const currentUser = useAppSelector(s => s.auth.user);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState<string | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [selectedDay, setSelectedDay] = useState<{ date: string; progression: number; entries: any[] } | null>(null);
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'taches' | 'versions'>('taches');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'semaine' | 'mois' | 'annee' | 'tout'>('tout');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedStatUser, setSelectedStatUser] = useState<User | null>(null);

  const toggleCollapse = (moduleId: string) => {
    setCollapsedModules(prev => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });
  };
  const [editForm, setEditForm] = useState({ nom: '', description: '', logo: '', priorite: '', statut: '' });

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => apiService.getProject(id!).then(r => r.data as Project),
    enabled: !!id,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.getUsers().then(r => r.data as User[]),
  });

  const { data: versions = [] } = useQuery<ProjectVersion[]>({
    queryKey: ['versions', id],
    queryFn: () => apiService.getVersions(id!).then(r => r.data),
    enabled: !!id,
  });

  const refresh = useCallback(() => queryClient.invalidateQueries({ queryKey: ['project', id] }), [id, queryClient]);

  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId: string) => apiService.deleteModule(moduleId),
    onSuccess: () => refresh(),
  });

  const isMember = (proj: Project) =>
    currentUser?.role === 'DSI' ||
    proj.teams?.some(t => (t.userId ?? t.user?.id) === currentUser?.id);

  const guard = (proj: Project, action: () => void) => {
    if (isMember(proj)) action();
    else setShowAccessDenied(true);
  };

  const openEditModal = () => {
    setEditForm({
      nom: project?.nom || '',
      description: project?.description || '',
      logo: project?.logo || '',
      priorite: project?.priorite || 'MOYENNE',
      statut: project?.statut || 'EN_COURS',
    });
    setShowEditModal(true);
  };

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

  const now = new Date();
  const filterStart: Record<typeof historyFilter, Date> = {
    semaine: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    mois: new Date(now.getFullYear(), now.getMonth(), 1),
    annee: new Date(now.getFullYear(), 0, 1),
    tout: new Date(0),
  };
  const historyAsc = [...(project.history || [])]
    .filter(h => {
      const d = new Date(h.createdAt);
      return d <= now && d >= filterStart[historyFilter];
    })
    .reverse();

  const dayGroupMap = new Map<string, { entries: typeof historyAsc; lastProgression: number }>();
  for (const h of historyAsc) {
    const dateKey = new Date(h.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    if (!dayGroupMap.has(dateKey)) dayGroupMap.set(dateKey, { entries: [], lastProgression: 0 });
    const g = dayGroupMap.get(dateKey)!;
    g.entries.push(h);
    g.lastProgression = Math.round(h.progression);
  }

  const chartData = Array.from(dayGroupMap.entries()).map(([date, g]) => ({
    date,
    progression: g.lastProgression,
    entries: g.entries,
  }));

  if (chartData.length > 0) {
    const todayStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    if (chartData[chartData.length - 1].date !== todayStr) {
      chartData.push({ date: todayStr, progression: Math.round(project.progressionGlobale), entries: [] });
    }
  }

  const projectUsers = (project.teams?.map(t => t.user).filter(Boolean) || []) as User[];

  const statusColor = project.statut === 'TERMINE' ? 'bg-green-100 text-green-700'
    : project.statut === 'CRITIQUE' ? 'bg-red-100 text-red-600'
      : 'bg-blue-100 text-blue-600';

  return (
    <div className="mx-auto px-4 pb-4">
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8">
          <div className="space-y-2">
            <Link to="/projects" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">← Retour aux projets</Link>
            <div className="flex items-center gap-4">
              {project.logo && (
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  {project.logo.startsWith('http') || project.logo.startsWith('data:')
                    ? <img src={project.logo} alt="" className="w-full h-full object-cover" />
                    : <span className="text-2xl">{project.logo}</span>
                  }
                </div>
              )}
              <h1 className="text-4xl font-black font-montserrat tracking-tighter text-slate-900 uppercase">{project.nom}</h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {project.id.slice(-8).toUpperCase()}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Lancement: {new Date(project.dateDebut).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => guard(project, openEditModal)} className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">
              Éditer
            </button>
            <button onClick={() => guard(project, () => setShowModuleModal(true))} className="px-5 py-2.5 bg-slate-100 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all">
              + Module
            </button>
            <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
              {project.statut}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-100 pb-0">
          {(['taches', 'versions'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2.5 font-black text-[10px] uppercase tracking-widest rounded-t-xl transition-all"
              style={{
                backgroundColor: activeTab === tab ? '#0f172a' : 'transparent',
                color: activeTab === tab ? '#fff' : '#9CA3AF',
              }}
            >
              {tab === 'taches' ? 'Tâches & Modules' : `Versions (${versions.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'versions' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <VersionHistoryList
              versions={versions}
              projectId={id!}
              selectedId={selectedVersionId}
              onSelect={(vid) => setSelectedVersionId(prev => prev === vid ? null : vid)}
              onCreateClick={() => guard(project, () => setShowVersionModal(true))}
              canDelete={isMember(project)}
              onAccessDenied={() => setShowAccessDenied(true)}
            />
            {selectedVersionId && (
              <VersionDetailPanel
                versionId={selectedVersionId}
                onClose={() => setSelectedVersionId(null)}
              />
            )}
          </div>
        )}

        {activeTab === 'taches' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">

              {/* History Chart */}
              <div className="premium-card">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                  <h2 className="premium-title text-sm">Historique de Progression</h2>
                  <select
                    value={historyFilter}
                    onChange={e => { setHistoryFilter(e.target.value as typeof historyFilter); setSelectedDay(null); }}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-700 uppercase tracking-widest focus:outline-none focus:border-slate-900 cursor-pointer"
                  >
                    <option value="semaine">Cette semaine</option>
                    <option value="mois">Ce mois</option>
                    <option value="annee">Cette année</option>
                    <option value="tout">Tout</option>
                  </select>
                </div>
                {selectedDay && (
                  <div className="mb-4 text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cliquer sur un autre point ou sur ✕</span>
                  </div>
                )}
                {chartData.length > 0 ? (
                  <div className="h-[220px]" style={{ cursor: 'pointer' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                        onClick={(e) => {
                          if (e && e.activePayload && e.activePayload.length > 0) {
                            const point = e.activePayload[0].payload;
                            setSelectedDay(prev => prev?.date === point.date ? null : point);
                          }
                        }}
                      >
                        <CartesianGrid stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="date" fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                        <YAxis fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} domain={[0, 100]} />
                        <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="4 2" strokeWidth={1} />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 700 }}
                          formatter={(v: any) => [`${v}%`, 'Progression']}
                          labelFormatter={(label) => `${label} — cliquer pour voir les actions`}
                        />
                        <Line
                          type="monotone"
                          dataKey="progression"
                          stroke="#0f172a"
                          strokeWidth={2.5}
                          dot={(props: any) => {
                            const isSelected = selectedDay?.date === props.payload?.date;
                            return (
                              <circle
                                key={props.key}
                                cx={props.cx} cy={props.cy}
                                r={isSelected ? 7 : 4}
                                fill="#0f172a"
                                stroke={isSelected ? '#3b82f6' : '#fff'}
                                strokeWidth={isSelected ? 3 : 2}
                              />
                            );
                          }}
                          activeDot={{ r: 7, fill: '#0f172a', stroke: '#3b82f6', strokeWidth: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[100px] flex items-center justify-center">
                    <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">Aucune donnée historique</p>
                  </div>
                )}

                {selectedDay && (
                  <div className="mt-5 border border-slate-100 rounded-2xl overflow-hidden">
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions du</span>
                        <span className="text-sm font-black text-slate-900 font-mono">{selectedDay.date}</span>
                        <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-md font-mono">
                          {selectedDay.progression}%
                        </span>
                      </div>
                      <button onClick={() => setSelectedDay(null)} className="text-slate-300 hover:text-slate-900 font-black text-sm transition-colors">✕</button>
                    </div>
                    <div className="divide-y divide-slate-50 bg-white max-h-48 overflow-y-auto">
                      {selectedDay.entries.length === 0 ? (
                        <p className="text-center text-slate-300 text-[10px] font-black uppercase py-6 tracking-widest">
                          Point de référence — aucune action enregistrée
                        </p>
                      ) : selectedDay.entries.map((entry: any, i: number) => (
                        <div key={i} className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 leading-snug">{entry.note || 'Progression mise à jour'}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {entry.user && (
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">@{entry.user.username}</span>
                              )}
                              <span className="text-slate-200">·</span>
                              <span className="text-[9px] font-mono text-slate-400">
                                {new Date(entry.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-slate-200">·</span>
                              <span className="text-[9px] font-black font-mono text-slate-500">{Math.round(entry.progression)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modules & Tasks */}
              <div className="space-y-5">
                <h2 className="premium-title text-sm">Modules & Tâches</h2>
                {project.modules?.length ? project.modules.map(module => (
                  <div key={module.id} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
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
                        <button
                          onClick={() => guard(project, () => setShowTaskModal(module.id))}
                          className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-sm font-black"
                          title="Ajouter une tâche"
                        >+</button>
                        <button
                          onClick={() => toggleCollapse(module.id)}
                          className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 transition-all text-sm font-black"
                          title={collapsedModules.has(module.id) ? 'Afficher les tâches' : 'Masquer les tâches'}
                          style={{ transform: collapsedModules.has(module.id) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                        >
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <polyline points="18 15 12 9 6 15" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          onClick={() => guard(project, () => { if (confirm('Supprimer ce module ?')) deleteModuleMutation.mutate(module.id); })}
                          className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all text-sm font-black"
                          title="Supprimer le module"
                        >×</button>
                      </div>
                    </div>
                    {!collapsedModules.has(module.id) && (
                      <div className="divide-y divide-slate-50/80 bg-white">
                        {module.tasks?.length ? module.tasks.map((task: any) => (
                          <SubTaskRow key={task.id} task={task} depth={0} projectId={id!} users={users} projectUsers={projectUsers} onRefresh={refresh} onTaskClick={setSelectedTaskId} />
                        )) : (
                          <p className="text-center text-slate-300 text-[10px] font-black uppercase py-4">Aucune tâche</p>
                        )}
                      </div>
                    )}
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

              <div className="premium-card">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Squad</p>
                  <button onClick={() => guard(project, () => setShowTeamModal(true))} className="text-[10px] font-black text-slate-900 uppercase hover:underline">Gérer Squad</button>
                </div>
                <div className="space-y-2">
                  {project.teams?.map(member => (
                    <div
                      key={member.id}
                      onClick={() => member.user && setSelectedStatUser(member.user as User)}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group"
                    >
                      <div
                        className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-[10px] font-black text-white"
                        style={{ backgroundColor: getUserColor(member.user?.id || member.userId) }}
                      >
                        {member.user?.photo
                          ? <img src={member.user.photo} className="w-full h-full object-cover" alt="" />
                          : member.user?.nom?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black uppercase" style={{ color: getUserColor(member.user?.id || member.userId) }}>
                          @{member.user?.username ?? member.user?.nom}
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: member.role === 'COLONEL' ? '#6366f1' : '#9CA3AF' }}>
                          {member.role === 'COLONEL' ? '🎖 Colonel' : '🪖 Soldat'}
                        </p>
                      </div>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5" className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity"><polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ModuleModal
        open={showModuleModal}
        onClose={() => setShowModuleModal(false)}
        projectId={id!}
        onSuccess={refresh}
      />
      <TaskModal
        moduleId={showTaskModal}
        onClose={() => setShowTaskModal(null)}
        projectId={id!}
        projectUsers={projectUsers}
        onSuccess={refresh}
      />
      <TeamModal
        open={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        project={project}
        allUsers={users}
        onSuccess={refresh}
      />
      <EditProjectModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        projectId={id!}
        form={editForm}
        setForm={setEditForm}
        onSuccess={refresh}
      />
      <CreateVersionModal
        open={showVersionModal}
        projectId={id!}
        projectCreatedAt={project.createdAt}
        lastVersion={versions.length > 0 ? versions[versions.length - 1] : null}
        onClose={() => setShowVersionModal(false)}
        onSuccess={() => { }}
      />
      <AccessDeniedModal
        open={showAccessDenied}
        onClose={() => setShowAccessDenied(false)}
      />
      <TaskDetailModal
        taskId={selectedTaskId}
        projectUsers={projectUsers}
        onClose={() => setSelectedTaskId(null)}
        onSuccess={refresh}
      />
      {selectedStatUser && (
        <UserStatsModal user={selectedStatUser} onClose={() => setSelectedStatUser(null)} />
      )}
    </div>
  );
};

export default ProjectDetailPage;
