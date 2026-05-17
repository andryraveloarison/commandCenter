import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '@store/slices/authSlice';
import apiService from '@services/api';

const BG: React.CSSProperties = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at 50% -10%, #C8D6DA 0%, #1A3A3A 65%, #0A2020 100%)',
  backgroundImage: [
    'radial-gradient(ellipse at 50% -10%, #C8D6DA 0%, #1A3A3A 65%, #0A2020 100%)',
    'repeating-linear-gradient(90deg, rgba(255,255,255,0.032) 0px, rgba(255,255,255,0.032) 1px, transparent 1px, transparent 4px)',
  ].join(', '),
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'Inter, sans-serif',
  overflow: 'hidden',
};

const INP: React.CSSProperties = {
  width: '100%',
  padding: '13px 18px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'rgba(255,255,255,0.07)',
  color: '#fff',
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: 'rgba(255,255,255,0.45)',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  display: 'block',
  marginBottom: 6,
};

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '', username: '', nom: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let response;
      if (isLogin) {
        response = await apiService.login({ email: formData.email, password: formData.password });
      } else {
        response = await apiService.register({ email: formData.email, password: formData.password, username: formData.username, nom: formData.nom });
      }
      const { access_token } = response.data;
      dispatch(setToken(access_token));
      const profile = await apiService.getProfile();
      dispatch(setUser(profile.data));
      navigate('/home');
    } catch (err: any) {
      if (!err.response) {
        setError('Erreur réseau — vérifiez votre connexion.');
      } else {
        const msg: string = Array.isArray(err.response?.data?.message)
          ? err.response.data.message[0]
          : (err.response?.data?.message ?? '');
        if (msg.toLowerCase().includes('email')) {
          setError('Aucun compte associé à cet email.');
        } else if (msg.toLowerCase().includes('mot de passe') || msg.toLowerCase().includes('password')) {
          setError('Mot de passe incorrect.');
        } else if (msg.toLowerCase().includes('compte') || msg.toLowerCase().includes('aucun')) {
          setError('Aucun compte associé à cet email.');
        } else if (err.response.status === 401) {
          setError('Email ou mot de passe incorrect.');
        } else if (err.response.status >= 500) {
          setError('Erreur serveur — réessayez dans un moment.');
        } else {
          setError(msg || 'Erreur d\'authentification.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={BG}>
      {/* Corner decorations */}
      <span style={{ position: 'absolute', top: 22, left: 24, color: 'rgba(255,255,255,0.35)', fontSize: 22, fontWeight: 300, lineHeight: 1 }}>+</span>
      <span style={{ position: 'absolute', top: 22, right: 24, color: 'rgba(255,255,255,0.35)', fontSize: 22, fontWeight: 300, lineHeight: 1 }}>+</span>
      <span style={{ position: 'absolute', bottom: 22, left: 24, color: 'rgba(255,255,255,0.18)', fontSize: 22, fontWeight: 300, lineHeight: 1 }}>+</span>
      <span style={{ position: 'absolute', bottom: 22, right: 24, color: 'rgba(255,255,255,0.18)', fontSize: 22, fontWeight: 300, lineHeight: 1 }}>+</span>

      {/* Top nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '38px 32px' }}>

        {/* Toggle connexion / inscription */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, padding: 4, border: '1px solid rgba(255,255,255,0.12)' }}>
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{
              padding: '7px 22px', borderRadius: 9999, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s',
              background: isLogin ? '#fff' : 'transparent',
              color: isLogin ? '#0A2020' : 'rgba(255, 255, 255, 1)',
            }}
          >
            Connexion
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{
              padding: '7px 22px', borderRadius: 9999, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s',
              background: !isLogin ? '#fff' : 'transparent',
              color: !isLogin ? '#0A2020' : 'rgba(255, 255, 255, 1)',
            }}
          >
            Inscription
          </button>
        </div>

      </nav>

      {/* Main centered content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px 48px' }}>

        {/* Logo */}
        <img src="/logo.png" alt="Logo" style={{ height: 120, objectFit: 'contain', marginBottom: 28, filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.4))' }} />

        {/* Hero title */}
        <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Command{' '}
          <em style={{ fontStyle: 'italic', fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400 }}>
            Center
          </em>
        </h1>
        <p style={{ margin: '0 0 36px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: 440, lineHeight: 1.6 }}>
          Système de gestion de projet IT du groupe Futurama.
        </p>

        {/* Form card */}
        <div style={{ width: '100%', maxWidth: 400, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '22px 28px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={LABEL}>Email</label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="nom@dsi.com" required style={INP}
                onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.45)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.18)')}
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label style={LABEL}>Nom de code</label>
                  <input
                    type="text" name="username" value={formData.username} onChange={handleChange}
                    placeholder="pseudo" required style={INP}
                    onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.45)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.18)')}
                  />
                </div>
                <div>
                  <label style={LABEL}>Nom complet</label>
                  <input
                    type="text" name="nom" value={formData.nom} onChange={handleChange}
                    placeholder="Jean Dupont" required style={INP}
                    onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.45)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.18)')}
                  />
                </div>
              </>
            )}

            <div>
              <label style={LABEL}>Mot de passe</label>
              <input
                type="password" name="password" value={formData.password} onChange={handleChange}
                placeholder="••••••••" required style={INP}
                onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.45)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.18)')}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 16px' }}>
                <p style={{ margin: 0, color: '#FCA5A5', fontSize: 11, fontWeight: 700, textAlign: 'center', letterSpacing: '0.08em' }}>{error}</p>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                marginTop: 4,
                padding: '14px 40px', borderRadius: 9999, border: 'none', cursor: loading ? 'default' : 'pointer',
                background: loading ? 'rgba(255,255,255,0.7)' : '#fff',
                color: '#0A2020', fontWeight: 800, fontSize: 13, fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.06em', transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              }}
              onMouseEnter={e => !loading && ((e.target as HTMLButtonElement).style.transform = 'translateY(-1px)')}
              onMouseLeave={e => ((e.target as HTMLButtonElement).style.transform = 'translateY(0)')}
            >
              {loading ? 'Connexion…' : isLogin ? 'Se connecter' : 'Créer un compte'}
            </button>
          </form>
        </div>

      </main>
    </div>
  );
};

export default LoginPage;
