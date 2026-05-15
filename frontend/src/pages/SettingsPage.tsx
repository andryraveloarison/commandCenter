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
    nom: '', email: '', password: '', photo: '', role: '', description: '',
  });

  useEffect(() => {
    if (auth.user) {
      setFormData({
        nom: auth.user.nom || '',
        email: auth.user.email || '',
        password: '',
        photo: auth.user.photo || '',
        role: auth.user.role || 'DEVELOPPEUR',
        description: auth.user.description || '',
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
    if (!isDSI) delete updateData.role; // non-DSI cannot change role
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
  const roleInfo = ROLE_LABELS[formData.role] ?? { label: formData.role, sub: '' };

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Nom opérationnel</label>
            <input
              type="text"
              value={formData.nom}
              onChange={e => setFormData(f => ({ ...f, nom: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-slate-900 font-bold text-sm focus:border-slate-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Adresse email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-slate-900 font-bold text-sm focus:border-slate-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Nouveau mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-slate-900 font-bold text-sm focus:border-slate-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 block">
              Rôle système
              {!isDSI && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 uppercase tracking-widest">Lecture seule</span>
              )}
            </label>
            <select
              value={formData.role}
              onChange={e => isDSI && setFormData(f => ({ ...f, role: e.target.value }))}
              disabled={!isDSI}
              className="w-full border px-4 py-3 rounded-xl font-bold text-sm outline-none transition-all"
              style={{
                background: isDSI ? '#f8fafc' : '#f1f5f9',
                borderColor: isDSI ? '#e2e8f0' : '#e2e8f0',
                color: isDSI ? '#0f172a' : '#94a3b8',
                cursor: isDSI ? 'pointer' : 'not-allowed',
                opacity: isDSI ? 1 : 0.8,
              }}
            >
              <option value="DSI">DSI</option>
              <option value="RESPONSABLE">Responsable</option>
              <option value="DEVELOPPEUR">Développeur</option>
              <option value="TECH_IT">Tech IT</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Description / Bio</label>
          <textarea
            rows={3}
            placeholder="Décrivez votre rôle, vos compétences, votre mission..."
            value={formData.description}
            onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-slate-900 font-medium text-sm focus:border-slate-400 outline-none transition-all resize-none"
          />
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full py-4 font-black uppercase tracking-[0.2em] text-[11px] rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          style={{
            background: saved ? '#22c55e' : '#1A1D2E',
            color: '#fff',
          }}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Synchronisation...
            </>
          ) : saved ? (
            '✓ Profil mis à jour'
          ) : (
            'Appliquer les modifications'
          )}
        </button>
      </div>

    </div>
  );
};

export default SettingsPage;
