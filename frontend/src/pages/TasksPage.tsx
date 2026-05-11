import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiService from '@services/api';
import { type Task } from '@types/index';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
const avatarColor = (id: string) => COLORS[id.charCodeAt(id.length - 1) % COLORS.length];

const TasksPage: React.FC = () => {
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
    <div className="space-y-12 pb-4">

      {/* Table Card */}
      <div className="premium-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Désignation</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priorité</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progression</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Intervenant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="p-5 font-mono text-[10px] text-slate-300">
                    {task.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="p-5">
                    <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">{task.titre}</p>
                  </td>
                  <td className="p-5">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${task.statut === 'COMPLETEE' ? 'bg-green-100 text-green-600' :
                      task.statut === 'BLOQUEE' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                      {task.statut}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${task.priorite === 'HAUTE' || task.priorite === 'CRITIQUE' ? 'bg-red-500' : 'bg-slate-300'
                        }`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {task.priorite}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 w-48">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-900 h-full rounded-full"
                          style={{ width: `${task.progression}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black font-mono text-slate-400">{task.progression}%</span>
                    </div>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
