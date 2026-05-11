import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@store/store';
import { logout } from '@store/slices/authSlice';
import apiService from '@services/api';
import ChatPanel from './ChatPanel';

interface LayoutProps { children: React.ReactNode; }

/* ── SVG Icons ───────────────────────────────────────────────────────────── */
const Icon = {
  dashboard: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  warroom: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  projects: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <path d="M3 7a2 2 0 012-2h3.17a2 2 0 011.42.59l1.82 1.82A2 2 0 0012.83 8H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  tasks: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  users: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  settings: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  bell: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chat: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  logout: (c = 'currentColor') => (
    <svg width={15} height={15} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  userIcon: (c = 'currentColor') => (
    <svg width={15} height={15} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

/* ── Nav config ──────────────────────────────────────────────────────────── */
const mainNav = [
  { path: '/dashboard', label: 'Tableau de bord', icon: 'dashboard' },
  { path: '/war-room',  label: 'Centre Technique', icon: 'warroom'   },
  { path: '/projects',  label: 'Projets',           icon: 'projects'  },
  { path: '/tasks',     label: 'Missions',           icon: 'tasks'     },
  { path: '/users',     label: 'Équipe',             icon: 'users'     },
];
const helpNav = [{ path: '/settings', label: 'Configuration', icon: 'settings' }];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/war-room':  'Centre Technique',
  '/projects':  'Projets',
  '/tasks':     'Missions',
  '/users':     'Équipe',
  '/settings':  'Configuration',
};

const SIDEBAR_W = 228;
const TOPBAR_H  = 62;
const ACCENT    = '#4F46E5';
const ACCENT_BG = '#EEF2FF';

/* ── Layout ──────────────────────────────────────────────────────────────── */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const location   = useLocation();
  const auth       = useSelector((state: RootState) => state.auth);

  const [showMenu, setShowMenu]     = useState(false);
  const [chatOpen, setChatOpen]     = useState(false);
  const [msgCount, setMsgCount]     = useState(0);
  const [seenCount, setSeenCount]   = useState(0);

  const menuRef = useRef<HTMLDivElement>(null);

  /* Heartbeat */
  useEffect(() => {
    apiService.heartbeat().catch(() => {});
    const id = setInterval(() => apiService.heartbeat().catch(() => {}), 15000);
    return () => clearInterval(id);
  }, []);

  /* Poll message count for badge */
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await apiService.getMessageCount();
        setMsgCount(res.data.count);
      } catch {}
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

  /* Mark messages as seen when chat opens */
  useEffect(() => {
    if (chatOpen) setSeenCount(msgCount);
  }, [chatOpen, msgCount]);

  const unread = Math.max(0, msgCount - seenCount);

  /* Close profile menu on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };
  const userInitial  = auth.user?.nom?.[0]?.toUpperCase() || 'U';
  const pageTitle    = Object.entries(pageTitles).find(([k]) => location.pathname.startsWith(k))?.[1] ?? 'DSI Admin';

  const NavLink = ({ path, label, icon }: { path: string; label: string; icon: string }) => {
    const isActive = location.pathname === path || (path !== '/projects' && location.pathname.startsWith(path + '/'));
    const iconFn = Icon[icon as keyof typeof Icon];
    return (
      <Link
        to={path}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 10,
          textDecoration: 'none', fontWeight: 600, fontSize: 13.5,
          color: isActive ? ACCENT : '#6B7280',
          background: isActive ? ACCENT_BG : 'transparent',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <span style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isActive ? '#E0E7FF' : '#F3F4F6',
        }}>
          {iconFn(isActive ? ACCENT : '#9CA3AF')}
        </span>
        {label}
      </Link>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F7FA', fontFamily: 'Inter, sans-serif' }}>

      {/* ═══════════ TOPBAR (full width, z highest) ══════════════════════ */}
      <header style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: TOPBAR_H,
        background: '#FFFFFF',
        borderBottom: '1px solid #EEF0F6',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px 0 20px',
        zIndex: 60,
        boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
      }}>
        {/* Brand (visible in topbar on the left) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: SIDEBAR_W - 20 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, background: '#1A1D2E',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 16, fontFamily: 'Montserrat, sans-serif' }}>D</span>
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 14.5, color: '#1A1D2E', margin: 0, letterSpacing: '-0.025em', lineHeight: 1.1 }}>DSI Admin</p>
            <p style={{ fontSize: 10, color: '#B0B5CC', fontWeight: 500, margin: '2px 0 0' }}>Command Center</p>
          </div>
        </div>

        {/* Page title */}
        <h1 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700, fontSize: 16,
          color: '#1A1D2E', margin: 0, letterSpacing: '-0.02em',
          flex: 1, paddingLeft: 16,
        }}>
          {pageTitle}
        </h1>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 11px', background: '#F0FDF4', borderRadius: 99,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'block' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#16A34A' }}>Opérationnel</span>
          </div>

          {/* Chat button with badge */}
          <button
            onClick={() => { setChatOpen(v => !v); }}
            style={{
              position: 'relative',
              width: 38, height: 38, borderRadius: 10,
              border: chatOpen ? `1.5px solid ${ACCENT}` : '1px solid #EEF0F6',
              background: chatOpen ? ACCENT_BG : '#FAFAFA',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!chatOpen) (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; }}
            onMouseLeave={e => { if (!chatOpen) (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
          >
            {Icon.chat(chatOpen ? ACCENT : '#9CA3AF')}
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -5,
                minWidth: 18, height: 18, borderRadius: 99,
                background: '#EF4444', color: '#fff',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px',
                border: '2px solid #fff',
              }}>
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </button>

          {/* Bell */}
          <button style={{
            width: 38, height: 38, borderRadius: 10,
            border: '1px solid #EEF0F6', background: '#FAFAFA',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
          >
            {Icon.bell('#9CA3AF')}
          </button>

          {/* Profile pill + dropdown */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '5px 12px 5px 5px',
                borderRadius: 99,
                border: showMenu ? `1.5px solid ${ACCENT}` : '1px solid #EEF0F6',
                background: showMenu ? ACCENT_BG : '#FAFAFA',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!showMenu) (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; }}
              onMouseLeave={e => { if (!showMenu) (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: '#1A1D2E',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}>
                {auth.user?.photo
                  ? <img src={auth.user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: '#fff', fontWeight: 800, fontSize: 12 }}>{userInitial}</span>
                }
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1D2E' }}>
                {auth.user?.nom?.split(' ')[0] || 'Utilisateur'}
              </span>
              <svg width={12} height={12} fill="none" stroke="#B0B5CC" strokeWidth={2} viewBox="0 0 24 24"
                style={{ transition: 'transform 0.2s', transform: showMenu ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Dropdown */}
            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                width: 200,
                background: '#FFFFFF',
                borderRadius: 14,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.05)',
                border: '1px solid #EEF0F6',
                overflow: 'hidden',
                zIndex: 100,
              }}>
                {/* User info (no avatar, just text) */}
                <div style={{ padding: '13px 16px', borderBottom: '1px solid #F5F7FA' }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1D2E', margin: 0, lineHeight: 1.2 }}>
                    {auth.user?.nom}
                  </p>
                  <p style={{ fontSize: 11, color: '#B0B5CC', margin: '3px 0 0', fontWeight: 500 }}>
                    {auth.user?.role} · {auth.user?.email}
                  </p>
                </div>

                {/* Modifier profil */}
                <Link
                  to="/settings"
                  onClick={() => setShowMenu(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 16px', textDecoration: 'none',
                    color: '#374151', fontSize: 13, fontWeight: 500,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span style={{ width: 26, height: 26, borderRadius: 7, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {Icon.userIcon('#6B7280')}
                  </span>
                  Modifier le profil
                </Link>

                <div style={{ height: 1, background: '#F5F7FA' }} />

                {/* Déconnexion */}
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 16px', border: 'none', background: 'transparent',
                    color: '#EF4444', fontSize: 13, fontWeight: 500,
                    cursor: 'pointer', textAlign: 'left', marginBottom: 3,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span style={{ width: 26, height: 26, borderRadius: 7, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {Icon.logout('#EF4444')}
                  </span>
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════ SIDEBAR (below topbar) ══════════════════════════════ */}
      <aside style={{
        position: 'fixed',
        top: TOPBAR_H, left: 0, bottom: 0,
        width: SIDEBAR_W,
        background: '#FFFFFF',
        borderRight: '1px solid #EEF0F6',
        display: 'flex', flexDirection: 'column',
        padding: '18px 12px',
        zIndex: 50,
        overflowY: 'auto',
      }}>
        {/* Main nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {mainNav.map(item => <NavLink key={item.path} {...item} />)}
        </nav>

        {/* Help section */}
        <div style={{ marginTop: 24 }}>
          <p style={{
            fontSize: 10, fontWeight: 700, color: '#C4C9D4',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            padding: '0 12px 8px', margin: 0,
          }}>Aide</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {helpNav.map(item => <NavLink key={item.path} {...item} />)}
          </nav>
        </div>

        {/* Bottom widget */}
        <div style={{ marginTop: 'auto', paddingTop: 20 }}>
          <div style={{
            borderRadius: 14,
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            padding: '15px 14px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', right: -14, bottom: -14,
              width: 70, height: 70, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
            }} />
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 9, fontSize: 14,
            }}>🔔</div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 12, margin: '0 0 3px' }}>Système actif</p>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 500, margin: 0, lineHeight: 1.5 }}>
              Toutes les opérations sont en ligne
            </p>
          </div>
        </div>
      </aside>

      {/* ═══════════ MAIN CONTENT ════════════════════════════════════════ */}
      <div style={{ flex: 1, marginLeft: SIDEBAR_W, paddingTop: TOPBAR_H, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <main style={{ flex: 1, padding: '28px' }}>
          {children}
        </main>
      </div>

      {/* ═══════════ CHAT PANEL ══════════════════════════════════════════ */}
      <ChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        currentUserId={auth.user?.id}
      />
    </div>
  );
};

export default Layout;
