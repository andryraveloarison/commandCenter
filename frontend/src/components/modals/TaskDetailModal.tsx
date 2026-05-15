import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@services/api';
import { useAppSelector } from '@hooks/useAppRedux';
import type { User } from '@types/index';
import { useSpellCheck } from '@services/spellcheck';
import SpellCheckButton from '@components/partials/SpellCheckButton';

interface Props {
  taskId: string | null;
  projectUsers: User[];
  onClose: () => void;
  onSuccess: () => void;
}

const STATUT_LABELS: Record<string, string> = {
  TODO: 'À faire', EN_COURS: 'En cours', EN_REVIEW: 'En review',
  COMPLETEE: 'Terminée', BLOQUEE: 'Bloquée',
};
const PRIORITE_LABELS: Record<string, string> = {
  BASSE: 'Basse', MOYENNE: 'Moyenne', HAUTE: 'Haute', CRITIQUE: 'Critique',
};
const STATUT_COLORS: Record<string, string> = {
  TODO: '#9CA3AF', EN_COURS: '#3B82F6', EN_REVIEW: '#8B5CF6',
  COMPLETEE: '#22C55E', BLOQUEE: '#EF4444',
};
const PRIORITE_COLORS: Record<string, string> = {
  BASSE: '#6B7280', MOYENNE: '#3B82F6', HAUTE: '#F59E0B', CRITIQUE: '#EF4444',
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    {children}
  </div>
);

const TaskDetailModal: React.FC<Props> = ({ taskId, projectUsers, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const currentUser = useAppSelector(s => s.auth.user);

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => apiService.getTask(taskId!).then(r => r.data),
    enabled: !!taskId,
  });

  const canEdit = task && (
    currentUser?.role === 'DSI' ||
    currentUser?.id === task.assigneeId
  );

  const [form, setForm] = useState({
    titre: '', description: '', statut: '', priorite: '',
    progression: 0, dateDebut: '', dateFin: '', situation: '', blocage: '', assigneeId: '',
  });

  useEffect(() => {
    if (task) {
      setForm({
        titre: task.titre ?? '',
        description: task.description ?? '',
        statut: task.statut ?? 'TODO',
        priorite: task.priorite ?? 'MOYENNE',
        progression: task.progression ?? 0,
        dateDebut: task.dateDebut ? task.dateDebut.slice(0, 10) : '',
        dateFin: task.dateFin ? task.dateFin.slice(0, 10) : '',
        situation: task.situation ?? '',
        blocage: task.blocage ?? '',
        assigneeId: task.assigneeId ?? '',
      });
    }
  }, [task]);

  const { check, checking, corrected, reset } = useSpellCheck();

  const handleCorrect = () => check(
    { titre: form.titre, description: form.description, situation: form.situation, blocage: form.blocage },
    r => setForm(f => ({ ...f, ...r }))
  );

  const mutation = useMutation({
    mutationFn: () => apiService.updateTask(taskId!, {
      ...form,
      dateDebut: form.dateDebut || undefined,
      dateFin: form.dateFin || undefined,
      situation: form.situation || undefined,
      blocage: form.blocage || undefined,
      assigneeId: form.assigneeId || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      onSuccess();
      onClose();
    },
  });

  if (!taskId) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(26,29,46,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white w-full max-w-2xl shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-start justify-between gap-4 flex-shrink-0">
          <div className="flex-1 min-w-0">
            {canEdit ? (
              <input
                type="text"
                value={form.titre}
                onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                className="w-full text-xl font-black text-slate-900 uppercase tracking-tight bg-transparent border-b-2 border-slate-200 focus:border-slate-900 outline-none pb-1 transition-colors"
              />
            ) : (
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{task?.titre}</h2>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {task && (
                <>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider text-white"
                    style={{ backgroundColor: STATUT_COLORS[task.statut] }}>
                    {STATUT_LABELS[task.statut]}
                  </span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider"
                    style={{ backgroundColor: `${PRIORITE_COLORS[task.priorite]}18`, color: PRIORITE_COLORS[task.priorite] }}>
                    {PRIORITE_LABELS[task.priorite]}
                  </span>
                  {!canEdit && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 uppercase tracking-wider">
                      Lecture seule
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {canEdit && <SpellCheckButton checking={checking} corrected={corrected} disabled={!form.titre && !form.description && !form.situation && !form.blocage} onClick={handleCorrect} />}
            <button onClick={onClose} className="text-slate-300 hover:text-slate-900 text-2xl font-bold transition-colors">×</button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            </div>
          ) : task ? (
            <div className="px-8 py-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">

                {/* Statut */}
                <Field label="Statut">
                  {canEdit ? (
                    <select value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value }))} className="input-clean">
                      <option value="TODO">À faire</option>
                      <option value="EN_COURS">En cours</option>
                      <option value="EN_REVIEW">En review</option>
                      <option value="COMPLETEE">Terminée</option>
                      <option value="BLOQUEE">Bloquée</option>
                    </select>
                  ) : (
                    <p className="text-sm font-bold text-slate-700">{STATUT_LABELS[task.statut]}</p>
                  )}
                </Field>

                {/* Priorité */}
                <Field label="Priorité">
                  {canEdit ? (
                    <select value={form.priorite} onChange={e => setForm(f => ({ ...f, priorite: e.target.value }))} className="input-clean">
                      <option value="BASSE">Basse</option>
                      <option value="MOYENNE">Moyenne</option>
                      <option value="HAUTE">Haute</option>
                      <option value="CRITIQUE">Critique</option>
                    </select>
                  ) : (
                    <p className="text-sm font-bold text-slate-700">{PRIORITE_LABELS[task.priorite]}</p>
                  )}
                </Field>

                {/* Progression */}
                <Field label="Progression">
                  {canEdit ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="range" min="0" max="100" step="5"
                        value={form.progression}
                        onChange={e => setForm(f => ({ ...f, progression: Number(e.target.value) }))}
                        className="flex-1"
                      />
                      <span className="text-sm font-black font-mono text-slate-900 w-10 text-right">{form.progression}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 rounded-full" style={{ width: `${task.progression}%` }} />
                      </div>
                      <span className="text-sm font-black font-mono text-slate-900">{Math.round(task.progression)}%</span>
                    </div>
                  )}
                </Field>

                {/* Assigné */}
                <Field label="Assigné à">
                  {canEdit ? (
                    <select value={form.assigneeId} onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))} className="input-clean">
                      <option value="">— Non assigné —</option>
                      {projectUsers.map(u => <option key={u.id} value={u.id}>{u.nom}</option>)}
                    </select>
                  ) : (
                    <p className="text-sm font-bold text-slate-700">{task.assignee ? `@${task.assignee.username}` : '—'}</p>
                  )}
                </Field>

                {/* Date début */}
                <Field label="Date début">
                  {canEdit ? (
                    <input type="date" value={form.dateDebut} onChange={e => setForm(f => ({ ...f, dateDebut: e.target.value }))} className="input-clean" />
                  ) : (
                    <p className="text-sm font-bold text-slate-700">
                      {task.dateDebut ? new Date(task.dateDebut).toLocaleDateString('fr-FR') : '—'}
                    </p>
                  )}
                </Field>

                {/* Date fin */}
                <Field label="Date fin">
                  {canEdit ? (
                    <input type="date" value={form.dateFin} onChange={e => setForm(f => ({ ...f, dateFin: e.target.value }))} className="input-clean" />
                  ) : (
                    <p className="text-sm font-bold text-slate-700">
                      {task.dateFin ? new Date(task.dateFin).toLocaleDateString('fr-FR') : '—'}
                    </p>
                  )}
                </Field>
              </div>

              {/* Description */}
              <Field label="Description">
                {canEdit ? (
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    placeholder="Description de la tâche..."
                    className="input-clean resize-none"
                  />
                ) : (
                  <p className="text-sm text-slate-700 leading-relaxed">{task.description || '—'}</p>
                )}
              </Field>

              {/* Situation */}
              <Field label="Situation">
                {canEdit ? (
                  <input type="text" value={form.situation} onChange={e => setForm(f => ({ ...f, situation: e.target.value }))} placeholder="Situation actuelle..." className="input-clean" />
                ) : (
                  <p className="text-sm text-slate-700">{task.situation || '—'}</p>
                )}
              </Field>

              {/* Blocage */}
              <Field label="Blocage">
                {canEdit ? (
                  <input type="text" value={form.blocage} onChange={e => setForm(f => ({ ...f, blocage: e.target.value }))} placeholder="Point de blocage..." className="input-clean" />
                ) : (
                  <p className="text-sm text-slate-700">{task.blocage || <span className="text-slate-300">Aucun blocage</span>}</p>
                )}
              </Field>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {canEdit && (
          <div className="px-8 py-5 border-t border-slate-100 flex gap-3 flex-shrink-0">
            <button onClick={onClose} className="btn-ghost flex-1 justify-center">Annuler</button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="btn-primary flex-1 justify-center disabled:opacity-50"
            >
              {mutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        )}
        {!canEdit && task && (
          <div className="px-8 py-4 border-t border-slate-100 flex-shrink-0">
            <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Seul {task.assignee ? `@${task.assignee.username}` : "l'assigné"} peut modifier cette tâche
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;
