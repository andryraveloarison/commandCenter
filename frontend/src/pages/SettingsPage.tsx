import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@store/store';
import { setUser } from '@store/slices/authSlice';
import apiService from '@services/api';

const SettingsPage: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    password: '',
    photo: '',
    role: '',
  });

  // Sync local state when Redux user data arrives (crucial for page refreshes)
  useEffect(() => {
    if (auth.user) {
      setFormData({
        nom: auth.user.nom || '',
        email: auth.user.email || '',
        password: '',
        photo: auth.user.photo || '',
        role: auth.user.role || 'DEVELOPPEUR',
      });
    }
  }, [auth.user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (!auth.user?.id) return;
    setLoading(true);

    const updateData: any = { ...formData };
    if (!updateData.password) delete updateData.password;

    try {
      const response = await apiService.updateUser(auth.user.id, updateData);
      dispatch(setUser(response.data));
      alert('Profil technique mis à jour avec succès !');
      setFormData({ ...formData, password: '' });
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la mise à jour des systèmes');
    } finally {
      setLoading(false);
    }
  };

  if (auth.isLoading && !auth.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-12">


      <div className="premium-card">
        <h2 className="premium-title text-sm mb-10 border-b border-slate-100 pb-4">Identité Utilisateur</h2>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Photo Section */}
          <div className="flex flex-col items-center gap-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-48 h-48 rounded-[40px] bg-slate-50 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center relative group cursor-pointer"
            >
              {formData.photo ? (
                <img src={formData.photo} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl text-slate-200 font-black">DSI</span>
              )}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Importer</span>
                <div className="w-8 h-px bg-white/30" />
                <span className="text-white/60 text-[8px] font-bold uppercase tracking-widest">JPG, PNG, WEBP</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] text-center">Avatar Système v2.0</p>
          </div>

          {/* Form Section */}
          <div className="flex-1 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Nom Opérationnel</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-900 font-bold focus:border-slate-900 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Adresse Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-900 font-bold focus:border-slate-900 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Nouveau Mot de Passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-900 font-bold focus:border-slate-900 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Rôle Système</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-900 font-bold focus:border-slate-900 outline-none transition-all cursor-pointer"
                >
                  <option value="DSI">DSI — Administration</option>
                  <option value="RESPONSABLE">Responsable — Chef de projet</option>
                  <option value="DEVELOPPEUR">Développeur — Équipe technique</option>
                  <option value="TECH_IT">Tech IT — Support technique</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Synchronisation...' : 'Appliquer les Modifications'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[32px] text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight">Besoin d'aide ?</h3>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Contactez le support technique interne</p>
        </div>
        <button className="px-8 py-3 bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-100 transition-all">
          Ouvrir un Ticket
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
