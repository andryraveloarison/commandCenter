import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@services/api';
import { type ProjectVersion } from '@types/index';
import { useSpellCheck } from '@services/spellcheck';
import SpellCheckButton from '@components/partials/SpellCheckButton';

interface Props {
  open: boolean;
  projectId: string;
  projectCreatedAt?: string;
  lastVersion?: ProjectVersion | null;
  onClose: () => void;
  onSuccess: () => void;
}

function formatDisplay(isoUtcStr: string): string {
  return new Date(isoUtcStr).toLocaleString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const CreateVersionModal: React.FC<Props> = ({ open, projectId, projectCreatedAt, lastVersion, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ nom: '', description: '' });
  const [error, setError] = useState('');
  const [nowUtc, setNowUtc] = useState('');
  const { check, checking, corrected, reset } = useSpellCheck();

  useEffect(() => {
    if (open) {
      setNowUtc(new Date().toISOString());
      setForm({ nom: '', description: '' });
      setError('');
      reset();
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: () => apiService.createVersion({ projectId, nom: form.nom, description: form.description, date: nowUtc }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['versions', projectId] }); onSuccess(); onClose(); },
    onError: () => setError('Erreur lors de la création de la version'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.nom.trim()) { setError('Le nom est requis'); return; }
    mutation.mutate();
  };

  const handleCorrect = () =>
    check({ nom: form.nom, description: form.description }, r => setForm(f => ({ ...f, ...r })));

  if (!open) return null;

  const fromDate = lastVersion?.date ?? projectCreatedAt;
  const fromLabel = fromDate ? formatDisplay(fromDate) : '—';
  const fromSublabel = lastVersion ? `fin de ${lastVersion.nom}` : projectCreatedAt ? 'création du projet' : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Nouvelle Version</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Marquer un jalon dans l'historique</p>
            </div>
            <div className="flex items-center gap-2">
              <SpellCheckButton checking={checking} corrected={corrected} disabled={!form.nom && !form.description} onClick={handleCorrect} />
              <button onClick={onClose} className="text-slate-300 hover:text-slate-900 font-black text-xl transition-colors">✕</button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          <div className="rounded-2xl overflow-hidden border border-slate-100">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Période couverte</p>
            </div>
            <div className="flex items-stretch">
              <div className="flex-1 px-4 py-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Début</p>
                <p className="text-[11px] font-bold text-slate-600">{fromLabel}</p>
                {fromSublabel && <p className="text-[9px] text-slate-300 mt-0.5 font-bold uppercase tracking-wider">{fromSublabel}</p>}
              </div>
              <div className="flex items-center px-2 text-slate-200 font-black text-lg select-none">→</div>
              <div className="flex-1 px-4 py-3 border-l border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Fin — maintenant</p>
                <p className="text-[11px] font-bold text-slate-900">{nowUtc ? formatDisplay(nowUtc) : '…'}</p>
                <p className="text-[9px] text-green-500 mt-0.5 font-black uppercase tracking-wider">● Live</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nom de la version *</label>
            <input type="text" placeholder="ex: v1.0, Sprint 3, Livraison Q1" value={form.nom} onChange={e => { setForm(f => ({ ...f, nom: e.target.value })); reset(); }} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:border-slate-900 transition-colors" autoFocus />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description (optionnel)</label>
            <textarea placeholder="Notes sur cette version..." value={form.description} onChange={e => { setForm(f => ({ ...f, description: e.target.value })); reset(); }} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-slate-900 transition-colors resize-none" />
          </div>

          {error && <p className="text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all">Annuler</button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 px-4 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50">
              {mutation.isPending ? 'Création...' : 'Créer la version'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVersionModal;
