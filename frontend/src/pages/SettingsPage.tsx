import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@store/store';
import { setUser } from '@store/slices/authSlice';
import apiService from '@services/api';
import { getUserColor } from '@components/partials/SubTaskRow';

const ROLE_LABELS: Record<string, { label: string; sub: string }> = {
  DSI: { label: 'DSI', sub: 'Administration système' },
  RESPONSABLE: { label: 'Responsable', sub: 'Chef de projet' },
  DEVELOPPEUR: { label: 'Développeur', sub: 'Équipe technique' },
  TECH_IT: { label: 'Tech IT', sub: 'Support technique' },
};

const SettingsPage: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    nom: '', username: '', email: '', password: '', photo: '', description: '', role: '',
  });

  useEffect(() => {
    if (auth.user) {
      setFormData({
        nom: auth.user.nom || '',
        username: auth.user.username || '',
        email: auth.user.email || '',
        password: '',
        photo: auth.user.photo || '',
        description: auth.user.description || '',
        role: auth.user.role || 'DEVELOPPEUR',
      });
    }
  }, [auth.user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(f => ({ ...f, photo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const isDSI = auth.user?.role === 'DSI';

  const handleUpdate = async () => {
    if (!auth.user?.id) return;
    setLoading(true);
    const updateData: any = { ...formData };
    if (!updateData.password) delete updateData.password;
    if (!isDSI) delete updateData.role;
    try {
      const response = await apiService.updateUser(auth.user.id, updateData);
      dispatch(setUser(response.data));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setFormData(f => ({ ...f, password: '' }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const color = auth.user ? getUserColor(auth.user.id) : '#4F46E5';
  const initials = auth.user?.nom?.[0]?.toUpperCase() ?? '?';
  const roleInfo = ROLE_LABELS[auth.user?.role ?? ''] ?? { label: auth.user?.role ?? '', sub: '' };

  if (auth.isLoading && !auth.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* Profile hero card */}
      <div className="premium-card overflow-hidden p-0">
        {/* Banner */}
        <div className="h-24 w-full" style={{ background: `linear-gradient(135deg, ${color}22 0%, ${color}08 100%)`, borderBottom: `1px solid ${color}18` }} />

        {/* Avatar + identity */}
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-10 mb-6">
            <div className="relative w-fit">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl flex items-center justify-center cursor-pointer group relative"
                style={{ backgroundColor: color }}
              >
                {formData.photo
                  ? <img src={formData.photo} alt="" className="w-full h-full object-cover" />
                  : <span className="text-white text-2xl font-black">{initials}</span>
                }
                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-xl">
                  <span className="text-white text-[9px] font-black uppercase tracking-widest">Modifier</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

            <div className="flex-1 pb-1">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">{auth.user?.nom || '—'}</h2>
              <p className="text-[11px] font-black mt-1" style={{ color }}>@{auth.user?.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest" style={{ background: `${color}15`, color }}>
                  {roleInfo.label}
                </span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{roleInfo.sub}</span>
              </div>
            </div>
          </div>

          {/* Description preview */}
          {formData.description && (
            <p className="text-sm text-slate-500 italic border-l-2 pl-3" style={{ borderColor: `${color}50` }}>
              {formData.description}
            </p>
          )}
        </div>
      </div>

      {/* Form card */}
      <div className="premium-card space-y-6">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-4">Modifier le profil</p>

        {/* Ligne 1 : Nom + Nom de code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Nom opérationnel</label>
            <input type="text" value={formData.nom} onChange={e => setFormData(f => ({ ...f, nom: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-slate-900 font-bold text-sm focus:border-slate-400 outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Nom de code</label>
            <input type="text" value={formData.username} onChange={e => setFormData(f => ({ ...f, username: e.target.value }))}
              placeholder="Ex: Alpha, Falcon..."
              className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-slate-900 font-bold text-sm focus:border-slate-400 outline-none transition-all" />
          </div>
        </div>

        {/* Ligne 2 : Email + Mot de passe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Adresse email</label>
            <input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-slate-900 font-bold text-sm focus:border-slate-400 outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Nouveau mot de passe</label>
            <input type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-slate-900 font-bold text-sm focus:border-slate-400 outline-none transition-all" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Description / Bio</label>
          <textarea rows={3} placeholder="Décrivez votre rôle, vos compétences, votre mission..."
            value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-slate-900 font-medium text-sm focus:border-slate-400 outline-none transition-all resize-none" />
        </div>

        {/* Ligne finale : Rôle système (grand) + Bouton (petit) */}
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 block">
              Rôle système
              {!isDSI && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 uppercase tracking-widest">Lecture seule</span>}
            </label>
            {isDSI ? (
              <select value={formData.role} onChange={e => setFormData(f => ({ ...f, role: e.target.value }))}
                className="w-full border px-4 py-3 rounded-xl font-bold text-sm outline-none transition-all cursor-pointer"
                style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a' }}>
                <option value="DSI">DSI</option>
                <option value="RESPONSABLE">Responsable</option>
                <option value="DEVELOPPEUR">Développeur</option>
                <option value="TECH_IT">Tech IT</option>
              </select>
            ) : (
              <div className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2">
                <span className="text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest" style={{ background: `${color}15`, color }}>
                  {roleInfo.label || '—'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{roleInfo.sub}</span>
              </div>
            )}
          </div>

          <button onClick={handleUpdate} disabled={loading}
            className="px-8 py-3 font-black uppercase tracking-[0.15em] text-[10px] rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
            style={{ background: saved ? '#22c55e' : '#1A1D2E', color: '#fff', whiteSpace: 'nowrap' }}>
            {loading ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sync...</> : saved ? '✓ Sauvegardé' : 'Appliquer'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default SettingsPage;
