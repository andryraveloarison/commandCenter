import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiService from '@services/api';
import { useSpellCheck } from '@services/spellcheck';
import SpellCheckButton from '@components/partials/SpellCheckButton';

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
}

const ModuleModal: React.FC<Props> = ({ open, onClose, projectId, onSuccess }) => {
  const [form, setForm] = useState({ nom: '', description: '' });
  const { check, checking, corrected, reset } = useSpellCheck();

  const mutation = useMutation({
    mutationFn: () => apiService.createModule({ ...form, projectId }),
    onSuccess: () => { onSuccess(); onClose(); setForm({ nom: '', description: '' }); reset(); },
  });

  const handleCorrect = () =>
    check({ nom: form.nom, description: form.description }, r => setForm(f => ({ ...f, ...r })));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(26,29,46,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white w-full max-w-lg shadow-2xl overflow-hidden" style={{ borderRadius: 24 }}>
        <div className="px-8 pt-6 pb-0 flex justify-between items-center">
          <h2 style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Nouveau Module
          </h2>
          <div className="flex items-center gap-2">
            <SpellCheckButton checking={checking} corrected={corrected} disabled={!form.nom && !form.description} onClick={handleCorrect} />
            <button onClick={onClose} className="text-slate-300 hover:text-slate-700 text-2xl font-bold w-8 h-8 flex items-center justify-center transition-colors">×</button>
          </div>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="px-8 pt-5 pb-8 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Nom du Module</label>
            <input type="text" required autoFocus value={form.nom} onChange={e => { setForm({ ...form, nom: e.target.value }); reset(); }} className="input-clean" placeholder="Ex: Interface utilisateur" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Description</label>
            <textarea rows={2} value={form.description} onChange={e => { setForm({ ...form, description: e.target.value }); reset(); }} className="input-clean resize-none" placeholder="Description optionnelle..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Annuler</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {mutation.isPending ? 'Création…' : 'Créer Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleModal;
