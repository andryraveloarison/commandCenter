import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiService from '@services/api';
import type { User } from '@types/index';

interface Props {
  moduleId: string | null;
  onClose: () => void;
  projectId: string;
  projectUsers: User[];
  onSuccess: () => void;
}

const TaskModal: React.FC<Props> = ({ moduleId, onClose, projectId, projectUsers, onSuccess }) => {
  const [form, setForm] = useState({
    titre: '',
    assigneeId: '',
    priorite: 'MOYENNE',
    dateDebut: '',
    dateFin: '',
    situation: '',
    blocage: '',
  });

  const mutation = useMutation({
    mutationFn: () => apiService.createTask({
      ...form,
      projectId,
      moduleId,
      dateDebut: form.dateDebut || undefined,
      dateFin: form.dateFin || undefined,
      situation: form.situation || undefined,
      blocage: form.blocage || undefined,
    }),
    onSuccess: () => {
      onSuccess();
      onClose();
      setForm({ titre: '', assigneeId: '', priorite: 'MOYENNE', dateDebut: '', dateFin: '', situation: '', blocage: '' });
    },
  });

  if (!moduleId) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(26,29,46,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white w-full max-w-lg shadow-2xl overflow-hidden" style={{ borderRadius: 24 }}>
        <div className="px-8 pt-6 pb-0 flex justify-between items-center">
          <h2 style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Assigner une Tâche
          </h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-700 text-2xl font-bold w-8 h-8 flex items-center justify-center transition-colors">×</button>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="px-8 pt-5 pb-8 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Titre *</label>
            <input
              type="text" required autoFocus
              value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })}
              className="input-clean"
              placeholder="Titre de la tâche..."
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Assigné à *</label>
            <select
              required
              value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })}
              className="input-clean"
            >
              <option value="">Sélectionner un membre</option>
              {projectUsers.map(u => <option key={u.id} value={u.id}>{u.nom}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Priorité</label>
            <select
              value={form.priorite} onChange={e => setForm({ ...form, priorite: e.target.value })}
              className="input-clean"
            >
              <option value="BASSE">Basse</option>
              <option value="MOYENNE">Moyenne</option>
              <option value="HAUTE">Haute</option>
              <option value="CRITIQUE">Critique</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Date début</label>
              <input
                type="date"
                value={form.dateDebut} onChange={e => setForm({ ...form, dateDebut: e.target.value })}
                className="input-clean"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Date fin</label>
              <input
                type="date"
                value={form.dateFin} onChange={e => setForm({ ...form, dateFin: e.target.value })}
                className="input-clean"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Situation</label>
            <input
              type="text"
              value={form.situation} onChange={e => setForm({ ...form, situation: e.target.value })}
              className="input-clean"
              placeholder="Situation actuelle de la tâche..."
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Blocage</label>
            <input
              type="text"
              value={form.blocage} onChange={e => setForm({ ...form, blocage: e.target.value })}
              className="input-clean"
              placeholder="Point de blocage éventuel..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Annuler</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {mutation.isPending ? 'Création…' : 'Créer Tâche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
