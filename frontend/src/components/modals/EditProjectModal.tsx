import React, { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiService from '@services/api';
import { useSpellCheck } from '@services/spellcheck';
import SpellCheckButton from '@components/partials/SpellCheckButton';

interface EditForm {
  nom: string;
  description: string;
  logo: string;
  priorite: string;
  statut: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  form: EditForm;
  setForm: React.Dispatch<React.SetStateAction<EditForm>>;
  onSuccess: () => void;
}

const EditProjectModal: React.FC<Props> = ({ open, onClose, projectId, form, setForm, onSuccess }) => {
  const logoRef = useRef<HTMLInputElement>(null);
  const { check, checking, corrected, reset } = useSpellCheck();

  const mutation = useMutation({
    mutationFn: () => apiService.updateProject(projectId, form),
    onSuccess: () => { onSuccess(); onClose(); reset(); },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, logo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleCorrect = () =>
    check({ nom: form.nom, description: form.description }, r => setForm(f => ({ ...f, ...r })));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(26,29,46,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white w-full max-w-xl shadow-2xl overflow-y-auto" style={{ borderRadius: 24, maxHeight: '90vh' }}>

        <div className="px-8 pt-6 pb-0 flex justify-between items-center sticky top-0 bg-white z-10" style={{ borderRadius: '24px 24px 0 0' }}>
          <h2 style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Modifier le Projet
          </h2>
          <div className="flex items-center gap-2">
            <SpellCheckButton checking={checking} corrected={corrected} disabled={!form.nom && !form.description} onClick={handleCorrect} />
            <button onClick={onClose} className="text-slate-300 hover:text-slate-700 text-2xl font-bold w-8 h-8 flex items-center justify-center transition-colors">×</button>
          </div>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="px-8 pt-5 pb-8 space-y-5">
          {/* Logo upload */}
          <div className="flex items-center gap-5">
            <div onClick={() => logoRef.current?.click()} className="relative cursor-pointer group flex-shrink-0" style={{ width: 80, height: 80, borderRadius: 16, border: '2px dashed #e2e8f0', overflow: 'hidden', background: 'var(--bg-app)' }}>
              {form.logo
                ? <img src={form.logo} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-3xl text-slate-300">+</div>
              }
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center" style={{ borderRadius: 14 }}>
                <span className="text-white text-[9px] font-bold uppercase tracking-widest">Changer</span>
              </div>
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logo du Projet</p>
              <p className="text-[9px] text-slate-300 font-medium">JPG, PNG, WEBP</p>
              {form.logo && <button type="button" onClick={() => setForm(f => ({ ...f, logo: '' }))} className="text-[9px] font-bold text-red-400 hover:text-red-600 uppercase tracking-wider">Supprimer</button>}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Nom du Projet</label>
            <input type="text" required value={form.nom} onChange={e => { setForm(f => ({ ...f, nom: e.target.value })); reset(); }} className="input-clean" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Description</label>
            <textarea rows={2} value={form.description} onChange={e => { setForm(f => ({ ...f, description: e.target.value })); reset(); }} className="input-clean resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Priorité</label>
              <select value={form.priorite} onChange={e => setForm(f => ({ ...f, priorite: e.target.value }))} className="input-clean">
                <option value="BASSE">Basse</option>
                <option value="MOYENNE">Moyenne</option>
                <option value="HAUTE">Haute</option>
                <option value="CRITIQUE">Critique</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Statut</label>
              <select value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value }))} className="input-clean">
                <option value="PREPARATION">Préparation</option>
                <option value="EN_COURS">En Cours</option>
                <option value="CRITIQUE">Critique</option>
                <option value="TERMINE">Terminé</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Annuler</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {mutation.isPending ? 'Enregistrement…' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
