import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@services/api';
import { type Task } from '@types/index';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
const avatarColor = (id: string) => COLORS[id.charCodeAt(id.length - 1) % COLORS.length];

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const StatusBadge: React.FC<{ statut: string }> = ({ statut }) => {
  const styles: Record<string, string> = {
    COMPLETEE: 'bg-green-100 text-green-700',
    BLOQUEE: 'bg-red-100 text-red-700',
    EN_COURS: 'bg-blue-100 text-blue-700',
    EN_REVIEW: 'bg-purple-100 text-purple-700',
    TODO: 'bg-slate-100 text-slate-500',
  };
  const labels: Record<string, string> = {
    COMPLETEE: 'Complétée', BLOQUEE: 'Bloquée', EN_COURS: 'En cours', EN_REVIEW: 'En review', TODO: 'À faire',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${styles[statut] || 'bg-slate-100 text-slate-500'}`}>
      {labels[statut] || statut}
    </span>
  );
};

interface EditRowProps {
  task: Task;
  onClose: () => void;
  onSaved: () => void;
}

const EditRow: React.FC<EditRowProps> = ({ task, onClose, onSaved }) => {
  const [form, setForm] = useState({
    dateDebut: task.dateDebut ? task.dateDebut.substring(0, 10) : '',
    dateFin: task.dateFin ? task.dateFin.substring(0, 10) : '',
    situation: task.situation || '',
    blocage: task.blocage || '',
    statut: task.statut,
  });

  const mutation = useMutation({
    mutationFn: () => apiService.updateTask(task.id, {
      dateDebut: form.dateDebut || undefined,
      dateFin: form.dateFin || undefined,
      situation: form.situation || undefined,
      blocage: form.blocage || undefined,
      statut: form.statut,
    }),
    onSuccess: () => { onSaved(); onClose(); },
  });

  return (
    <tr className="bg-indigo-50/50 border-b border-indigo-100">
      <td colSpan={8} className="px-5 py-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Date début</label>
            <input type="date" value={form.dateDebut} onChange={e => setForm({ ...form, dateDebut: e.target.value })}
              className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-400 bg-white" />
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Date fin</label>
            <input type="date" value={form.dateFin} onChange={e => setForm({ ...form, dateFin: e.target.value })}
              className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-400 bg-white" />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Situation</label>
            <input type="text" value={form.situation} onChange={e => setForm({ ...form, situation: e.target.value })}
              placeholder="Situation actuelle..." className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-400 bg-white" />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Blocage</label>
            <input type="text" value={form.blocage} onChange={e => setForm({ ...form, blocage: e.target.value })}
              placeholder="Point de blocage..." className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-400 bg-white" />
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Statut</label>
            <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value as Task['statut'] })}
              className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-400 bg-white">
              <option value="TODO">À faire</option>
              <option value="EN_COURS">En cours</option>
              <option value="EN_REVIEW">En review</option>
              <option value="COMPLETEE">Complétée</option>
              <option value="BLOQUEE">Bloquée</option>
            </select>
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose} className="text-xs font-bold text-slate-400 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 bg-white">Annuler</button>
            <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
              className="text-xs font-bold text-white px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
              {mutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
};

const TasksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiService.getTasks().then(r => r.data as Task[]),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <div className="premium-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Désignation</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priorité</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dates</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Situation</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Blocage</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Intervenant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.map((task) => (
                <React.Fragment key={task.id}>
                  <tr
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => setEditingId(editingId === task.id ? null : task.id)}
                  >
                    <td className="p-5 font-mono text-[10px] text-slate-300">
                      {task.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">{task.titre}</p>
                    </td>
                    <td className="p-5">
                      <StatusBadge statut={task.statut} />
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${task.priorite === 'HAUTE' || task.priorite === 'CRITIQUE' ? 'bg-red-500' : 'bg-slate-300'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{task.priorite}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      {task.dateDebut || task.dateFin ? (
                        <div className="text-[10px] text-slate-500 space-y-0.5">
                          {task.dateDebut && <div className="flex items-center gap-1"><span className="text-slate-300">▶</span>{fmtDate(task.dateDebut)}</div>}
                          {task.dateFin && <div className="flex items-center gap-1"><span className="text-slate-300">■</span>{fmtDate(task.dateFin)}</div>}
                        </div>
                      ) : <span className="text-slate-200 text-[10px]">—</span>}
                    </td>
                    <td className="p-5 max-w-[160px]">
                      {task.situation
                        ? <p className="text-[11px] text-slate-600 truncate" title={task.situation}>{task.situation}</p>
                        : <span className="text-slate-200 text-[10px]">—</span>}
                    </td>
                    <td className="p-5 max-w-[160px]">
                      {task.blocage
                        ? <p className="text-[11px] text-red-500 font-semibold truncate" title={task.blocage}>{task.blocage}</p>
                        : <span className="text-slate-200 text-[10px]">—</span>}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: task.assignee ? avatarColor(task.assignee.id) : '#cbd5e1' }}
                        >
                          {task.assignee?.photo
                            ? <img src={task.assignee.photo} alt="" className="w-full h-full object-cover" />
                            : task.assignee?.nom?.substring(0, 2).toUpperCase() || '??'
                          }
                        </div>
                        <span className="text-xs font-bold text-slate-700">{task.assignee?.nom || 'Non attribué'}</span>
                      </div>
                    </td>
                  </tr>
                  {editingId === task.id && (
                    <EditRow
                      task={task}
                      onClose={() => setEditingId(null)}
                      onSaved={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
                    />
                  )}
                </React.Fragment>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-300 text-sm font-semibold">Aucune tâche trouvée</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[10px] text-slate-300 text-center font-medium">Cliquez sur une ligne pour modifier les dates, situation et blocage</p>
    </div>
  );
};

export default TasksPage;
