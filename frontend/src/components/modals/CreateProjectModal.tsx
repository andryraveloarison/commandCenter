import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@services/api';
import type { User } from '@types/index';

interface Props {
  open: boolean;
  onClose: () => void;
  users: User[];
  onSuccess: () => void;
}

const EMPTY_FORM = () => ({
  nom: '',
  description: '',
  logo: '',
  dateDebut: new Date().toISOString().split('T')[0],
  priorite: 'MOYENNE',
  teamUserIds: [] as string[],
});

const CreateProjectModal: React.FC<Props> = ({ open, onClose, users, onSuccess }) => {
  const logoRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const mutation = useMutation({
    mutationFn: () => apiService.createProject(form),
    onSuccess: () => { onSuccess(); onClose(); setForm(EMPTY_FORM); },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, logo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const toggleMember = (userId: string) => {
    setForm(prev => ({
      ...prev,
      teamUserIds: prev.teamUserIds.includes(userId)
        ? prev.teamUserIds.filter(id => id !== userId)
        : [...prev.teamUserIds, userId],
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(26,29,46,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white w-full max-w-xl shadow-2xl overflow-y-auto" style={{ borderRadius: 24, maxHeight: '90vh' }}>

        <div className="px-8 pt-6 pb-0 flex justify-between items-center sticky top-0 bg-white z-10" style={{ borderRadius: '24px 24px 0 0' }}>
          <h2 style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Nouveau Projet
          </h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-700 text-2xl font-bold w-8 h-8 flex items-center justify-center transition-colors">×</button>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="px-8 pt-5 pb-8 space-y-5">
          {/* Logo */}
          <div className="flex items-center gap-5">
            <div
              onClick={() => logoRef.current?.click()}
              className="relative cursor-pointer group flex-shrink-0"
              style={{ width: 80, height: 80, borderRadius: 16, border: '2px dashed #e2e8f0', overflow: 'hidden', background: 'var(--bg-app)' }}
            >
              {form.logo
                ? <img src={form.logo} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-3xl text-slate-300">+</div>
              }
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center" style={{ borderRadius: 14 }}>
                <span className="text-white text-[9px] font-bold uppercase tracking-widest">Logo</span>
              </div>
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logo du Projet</p>
              <p className="text-[9px] text-slate-300 font-medium">JPG, PNG, WEBP</p>
              {form.logo && (
                <button type="button" onClick={() => setForm(f => ({ ...f, logo: '' }))} className="text-[9px] font-bold text-red-400 hover:text-red-600 uppercase tracking-wider">
                  Supprimer
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Nom du Projet</label>
            <input
              type="text" required
              value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
              placeholder="EX: MIGRATION CLOUD 2026"
              className="input-clean"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Description</label>
            <textarea
              rows={2}
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Spécifications et objectifs..."
              className="input-clean resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Date de Lancement</label>
              <input
                type="date" required
                value={form.dateDebut} onChange={e => setForm(f => ({ ...f, dateDebut: e.target.value }))}
                className="input-clean"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Priorité</label>
              <select value={form.priorite} onChange={e => setForm(f => ({ ...f, priorite: e.target.value }))} className="input-clean">
                <option value="BASSE">Basse</option>
                <option value="MOYENNE">Moyenne</option>
                <option value="HAUTE">Haute</option>
                <option value="CRITIQUE">Critique</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Équipe Assignée</label>
            <div className="max-h-32 overflow-y-auto rounded-xl p-2 space-y-0.5" style={{ background: 'var(--bg-app)' }}>
              {users.length === 0 && (
                <p className="text-[10px] text-slate-300 font-bold uppercase text-center py-2">Aucun utilisateur disponible</p>
              )}
              {users.map(u => (
                <label key={u.id} className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-white cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={form.teamUserIds.includes(u.id)}
                    onChange={() => toggleMember(u.id)}
                    className="w-4 h-4 accent-slate-900 rounded flex-shrink-0"
                  />
                  <div className="w-6 h-6 rounded-lg bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600 overflow-hidden flex-shrink-0">
                    {u.photo ? <img src={u.photo} className="w-full h-full object-cover" alt="" /> : u.nom[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{u.nom}</p>
                    <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{u.role}</p>
                  </div>
                </label>
              ))}
            </div>
            {form.teamUserIds.length > 0 && (
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                {form.teamUserIds.length} membre{form.teamUserIds.length > 1 ? 's' : ''} sélectionné{form.teamUserIds.length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Annuler</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {mutation.isPending ? 'Création…' : 'Créer Projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
