import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@store/store';
import { logout } from '@store/slices/authSlice';
import apiService from '@services/api';

interface LayoutProps { children: React.ReactNode; }

/* ── SVG Icons ───────────────────────────────────────────────────────────── */
const Icon = {
  dashboard: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  warroom: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  projects: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <path d="M3 7a2 2 0 012-2h3.17a2 2 0 011.42.59l1.82 1.82A2 2 0 0012.83 8H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  tasks: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  wrench: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  users: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  messages: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  settings: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  bell: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  calendar: (c = 'currentColor') => (
    <svg width={17} height={17} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  logout: (c = 'currentColor') => (
    <svg width={15} height={15} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  userIcon: (c = 'currentColor') => (
    <svg width={15} height={15} fill="none" stroke={c} strokeWidth={1.7} viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/* ── Nav config ──────────────────────────────────────────────────────────── */
const mainNav = [
  { path: '/dashboard', label: 'Tableau de bord', icon: 'dashboard' },
  { path: '/war-room', label: 'Centre Technique', icon: 'warroom' },
  { path: '/projects', label: 'Projets', icon: 'projects' },
  { path: '/calendar', label: 'Calendrier', icon: 'calendar' },
  { path: '/interventions', label: 'Interventions', icon: 'wrench' },
  { path: '/users', label: 'Équipe', icon: 'users' },
  { path: '/messages', label: 'Messages', icon: 'messages' },
];
const helpNav = [{ path: '/settings', label: 'Configuration', icon: 'settings' }];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/war-room': 'Centre Technique',
  '/projects': 'Projets',
  '/calendar': 'Calendrier',
  '/interventions': 'Interventions',
  '/users': 'Équipe',
  '/messages': 'Messages',
  '/settings': 'Configuration',
};

const SIDEBAR_W = 228;
const TOPBAR_H = 62;
const ACCENT = '#4F46E5';
const ACCENT_BG = '#EEF2FF';

/* ── Notifications panel ─────────────────────────────────────────────────── */
interface Notification {
  id: string;
  titre: string;
  message: string;
  lu: boolean;
  type: string;
  createdAt: string;
}

const NotifPanel: React.FC<{ onClose: () => void; onRead: () => void }> = ({ onClose, onRead }) => {
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    apiService.getNotifications().then(r => {
      const sorted = [...r.data].sort((a: Notification, b: Notification) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifs(sorted.slice(0, 5));
    }).catch(() => { });
  }, []);

  const markAllRead = async () => {
    await apiService.markAllNotificationsRead().catch(() => { });
    setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
    onRead();
  };

  const markOne = async (id: string) => {
    await apiService.markNotificationAsRead(id).catch(() => { });
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
    onRead();
  };

  const typeIcon: Record<string, string> = {
    MESSAGE: '💬', TASK: '✅', PROJECT: '📁', DEFAULT: '🔔',
  };

  const formatRelative = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "À l'instant";
    if (m < 60) return `il y a ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `il y a ${h}h`;
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  const unreadCount = notifs.filter(n => !n.lu).length;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
      <div style={{
        position: 'absolute', right: 0, top: 'calc(100% + 10px)',
        width: 340, maxHeight: 420,
        background: '#fff', borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.05)',
        border: '1px solid #EEF0F6',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        zIndex: 99,
      }}>
        {/* Header */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1A1D2E' }}>Notifications</p>
            {unreadCount > 0 && (
              <span style={{ padding: '1px 7px', borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700 }}>
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 11, color: ACCENT, fontWeight: 600, padding: 0 }}>
              Tout marquer lu
            </button>
          )}
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {notifs.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#C4C9D4', fontSize: 13, fontWeight: 500 }}>Aucune notification</p>
            </div>
          )}
          {notifs.map(n => (
            <div
              key={n.id}
              onClick={() => !n.lu && markOne(n.id)}
              style={{
                padding: '12px 16px',
                background: n.lu ? '#fff' : '#F8F9FF',
                borderBottom: '1px solid #F5F7FA',
                cursor: n.lu ? 'default' : 'pointer',
                display: 'flex', gap: 10, alignItems: 'flex-start',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (!n.lu) (e.currentTarget as HTMLElement).style.background = '#EEF2FF'; }}
              onMouseLeave={e => { if (!n.lu) (e.currentTarget as HTMLElement).style.background = '#F8F9FF'; }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 9, background: n.lu ? '#F3F4F6' : '#EEF2FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0,
              }}>
                {typeIcon[n.type] || typeIcon.DEFAULT}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: n.lu ? 500 : 700, color: '#1A1D2E', lineHeight: 1.3 }}>{n.titre}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#6B7280', fontWeight: 400, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</p>
                <p style={{ margin: '3px 0 0', fontSize: 10, color: '#C4C9D4', fontWeight: 500 }}>{formatRelative(n.createdAt)}</p>
              </div>
              {!n.lu && (
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4F46E5', flexShrink: 0, marginTop: 4 }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

/* ── Layout ──────────────────────────────────────────────────────────────── */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useSelector((state: RootState) => state.auth);

  const [showMenu, setShowMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  /* Heartbeat */
  useEffect(() => {
    apiService.heartbeat().catch(() => { });
    const id = setInterval(() => apiService.heartbeat().catch(() => { }), 15000);
    return () => clearInterval(id);
  }, []);

  /* Poll unread messages count (group + DMs) for sidebar badge */
  useEffect(() => {
    const poll = async () => {
      try {
        const [group, dm] = await Promise.all([
          apiService.getMessageCount(),
          apiService.getUnreadDmCount(),
        ]);
        setUnreadMsgCount((group.data.count || 0) + (dm.data.count || 0));
      } catch { }
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

  /* Poll unread notifications count for bell badge */
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await apiService.getUnreadNotificationsCount();
        setUnreadNotifCount(res.data.count);
      } catch { }
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

  /* Close menus on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };
  const userInitial = auth.user?.nom?.[0]?.toUpperCase() || 'U';
  const pageTitle = Object.entries(pageTitles).find(([k]) => location.pathname.startsWith(k))?.[1] ?? 'DSI Admin';
  const onMessagesPage = location.pathname === '/messages';

  /* When user navigates to messages page, reset msg count */
  useEffect(() => {
    if (onMessagesPage) setUnreadMsgCount(0);
  }, [onMessagesPage]);

  const NavLink = ({ path, label, icon, badge }: { path: string; label: string; icon: string; badge?: number }) => {
    const isActive = location.pathname === path || (path !== '/projects' && path !== '/messages' && path !== '/interventions' && location.pathname.startsWith(path + '/'));
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
          position: 'relative',
        }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <span style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isActive ? '#E0E7FF' : '#F3F4F6',
          position: 'relative',
        }}>
          {iconFn(isActive ? ACCENT : '#9CA3AF')}
          {badge != null && badge > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              minWidth: 16, height: 16, borderRadius: 99,
              background: '#EF4444', color: '#fff',
              fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px', border: '2px solid #fff',
            }}>
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </span>
        {label}
      </Link>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F7FA', fontFamily: 'Inter, sans-serif' }}>

      {/* ═══════════ TOPBAR ══════════════════════════════════════════════ */}
      <header style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: TOPBAR_H,
        background: '#FFFFFF',
        borderBottom: '1px solid #EEF0F6',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px 0 20px',
        zIndex: 60,
        margin: '15px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        borderRadius: 10,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: SIDEBAR_W - 20 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <img src="/logo.png" alt="Logo" style={{ height: 80, objectFit: 'contain', filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.4))' }} />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 14.5, color: '#1A1D2E', margin: 0, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Command</p>
            <p style={{ fontSize: 10, color: '#B0B5CC', fontWeight: 500, margin: '2px 0 0' }}>Center</p>
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

          {/* Bell – notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowNotifs(v => !v); if (!showNotifs) setUnreadNotifCount(0); }}
              style={{
                position: 'relative',
                width: 38, height: 38, borderRadius: 10,
                border: showNotifs ? `1.5px solid ${ACCENT}` : '1px solid #EEF0F6',
                background: showNotifs ? ACCENT_BG : '#FAFAFA',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!showNotifs) (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; }}
              onMouseLeave={e => { if (!showNotifs) (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
            >
              {Icon.bell(showNotifs ? ACCENT : '#9CA3AF')}
              {unreadNotifCount > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -5,
                  minWidth: 18, height: 18, borderRadius: 99,
                  background: '#EF4444', color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px', border: '2px solid #fff',
                }}>
                  {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <NotifPanel
                onClose={() => setShowNotifs(false)}
                onRead={() => {
                  apiService.getUnreadNotificationsCount().then(r => setUnreadNotifCount(r.data.count)).catch(() => { });
                }}
              />
            )}
          </div>

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
                <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
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
                <div style={{ padding: '13px 16px', borderBottom: '1px solid #F5F7FA' }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1D2E', margin: 0, lineHeight: 1.2 }}>
                    {auth.user?.nom}
                  </p>
                  <p style={{ fontSize: 11, color: '#B0B5CC', margin: '3px 0 0', fontWeight: 500 }}>
                    {auth.user?.role} · {auth.user?.email}
                  </p>
                </div>

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

      {/* ═══════════ SIDEBAR ═════════════════════════════════════════════ */}
      <aside style={{
        position: 'fixed',
        top: TOPBAR_H, left: 0, bottom: 0,
        width: SIDEBAR_W,
        background: '#FFFFFF',
        borderRight: '1px solid #EEF0F6',
        display: 'flex', flexDirection: 'column',
        padding: '18px 12px',
        margin: '30px 15px 15px 15px',
        zIndex: 50,
        borderRadius: 10,
        overflowY: 'auto',
      }}>
        {/* Main nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {mainNav.map(item => (
            <NavLink
              key={item.path}
              {...item}
              badge={item.path === '/messages' ? unreadMsgCount : undefined}
            />
          ))}
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
            background: 'linear-gradient(135deg, #003f69ff 0%, #5cacf6ff 100%)',
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
        <main style={{ flex: 1, padding: '31px 15px 0px 34px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
