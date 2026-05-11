import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '@store/slices/authSlice';
import apiService from '@services/api';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    nom: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await apiService.login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        response = await apiService.register({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          nom: formData.nom,
        });
      }

      const { access_token } = response.data;
      dispatch(setToken(access_token));
      const profile = await apiService.getProfile();
      dispatch(setUser(profile.data));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur d\'authentification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-inter">
      <div className="w-full max-w-md bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Subtle Decorative Gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-16 -mt-16" />
        
        <div className="relative z-10">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <span className="text-3xl font-black text-white">D</span>
            </div>
            <h1 className="text-3xl font-black font-montserrat tracking-tighter text-slate-900 uppercase leading-none">
              DSI <span className="text-slate-400">Dashboard</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-3">Portail d'accès technique</p>
          </div>

          <div className="flex p-1 bg-slate-50 rounded-2xl mb-10 border border-slate-100">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                !isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nom@dsi.com"
                required
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            {!isLogin && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Utilisateur</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="pseudo_dsi"
                    required={!isLogin}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Nom Complet</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Jean Dupont"
                    required={!isLogin}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Mot de passe</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl">
                <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-slate-800 transform hover:-translate-y-1 transition-all disabled:opacity-50"
            >
              {loading ? 'Accès en cours...' : isLogin ? 'DÉVERROUILLER' : 'CRÉER ACCÈS'}
            </button>
          </form>

          <footer className="mt-12 text-center">
            <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.4em]">Propriété de la DSI &copy; 2026</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
