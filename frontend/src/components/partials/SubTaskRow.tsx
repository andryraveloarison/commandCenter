import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiService from '@services/api';
import type { User } from '@types/index';

const USER_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#ec4899'];
const colorCache: Record<string, string> = {};
export const getUserColor = (id: string): string => {
  if (!colorCache[id]) {
    const idx = Object.keys(colorCache).length % USER_COLORS.length;
    colorCache[id] = USER_COLORS[idx];
  }
  return colorCache[id];
};

interface Props {
  task: any;
  depth: number;
  projectId: string;
  users: User[];
  projectUsers: User[];
  onRefresh: () => void;
}

const SubTaskRow: React.FC<Props> = ({ task, depth, projectId, users, projectUsers, onRefresh }) => {
  const [editing, setEditing]       = useState(false);
  const [progress, setProgress]     = useState(task.progression);
  const [showAddSub, setShowAddSub] = useState(false);
  const [subTitle, setSubTitle]     = useState('');
  const [subAssignee, setSubAssignee] = useState('');

  const updateMutation = useMutation({
    mutationFn: () => apiService.updateTask(task.id, { progression: progress }),
    onSuccess: () => { setEditing(false); onRefresh(); },
  });

  const addSubMutation = useMutation({
    mutationFn: () => apiService.createSubtask(task.id, {
      titre: subTitle, projectId, assigneeId: subAssignee || undefined,
    }),
    onSuccess: () => { setShowAddSub(false); setSubTitle(''); setSubAssignee(''); onRefresh(); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiService.deleteTask(task.id),
    onSuccess: () => onRefresh(),
  });

  const dotColor = task.assignee ? getUserColor(task.assignee.id) : '#cbd5e1';

  return (
    <div>
      <div
        className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/50 group border-l-2 transition-colors"
        style={{ marginLeft: `${depth * 20}px`, borderLeftColor: dotColor + '40' }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: dotColor }}
            title={task.assignee?.nom || 'Non assigné'}
          />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold truncate ${task.progression >= 100 ? 'line-through text-slate-400' : 'text-slate-700'}`}>
              {task.titre}
            </p>
            {task.assignee && (
              <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: dotColor }}>
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
                className="w-10 text-center text-xs font-bold font-mono outline-none"
              />
              <button
                onClick={() => updateMutation.mutate()}
                className="bg-slate-900 text-white px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
              >OK</button>
            </div>
          ) : (
            <button
              onClick={() => { setEditing(true); setProgress(task.progression); }}
              className="flex items-center gap-2 opacity-50 group-hover:opacity-100"
            >
              <span className="text-[10px] font-bold font-mono text-slate-500">{Math.round(task.progression)}%</span>
              <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${task.progression}%`, backgroundColor: dotColor }} />
              </div>
            </button>
          )}
          <button
            onClick={() => setShowAddSub(!showAddSub)}
            className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-100 text-[10px] font-bold"
            title="Ajouter sous-tâche"
          >+</button>
          <button
            onClick={() => { if (confirm('Supprimer cette tâche ?')) deleteMutation.mutate(); }}
            className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 text-[10px] font-bold ml-1"
            title="Supprimer"
          >×</button>
        </div>
      </div>

      {showAddSub && (
        <div
          className="flex items-center gap-2 py-1.5 px-3 bg-slate-50 border-l-2 border-slate-200"
          style={{ marginLeft: `${(depth + 1) * 20}px` }}
        >
          <input
            type="text" placeholder="Titre sous-tâche..."
            value={subTitle} onChange={e => setSubTitle(e.target.value)}
            className="flex-1 text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none"
          />
          <select
            value={subAssignee} onChange={e => setSubAssignee(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none"
          >
            <option value="">— Assigné —</option>
            {projectUsers.map(u => <option key={u.id} value={u.id}>{u.nom}</option>)}
          </select>
          <button
            onClick={() => { if (subTitle.trim()) addSubMutation.mutate(); }}
            disabled={!subTitle.trim() || addSubMutation.isPending}
            className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase disabled:opacity-40"
          >Ajouter</button>
          <button onClick={() => setShowAddSub(false)} className="text-slate-300 hover:text-slate-900 text-[10px]">✕</button>
        </div>
      )}

      {task.subtasks?.map((sub: any) => (
        <SubTaskRow
          key={sub.id} task={sub} depth={depth + 1}
          projectId={projectId} users={users} projectUsers={projectUsers} onRefresh={onRefresh}
        />
      ))}
    </div>
  );
};

export default SubTaskRow;
