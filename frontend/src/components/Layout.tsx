import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@store/store';
import { logout } from '@store/slices/authSlice';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/war-room', label: 'Centre Technique', icon: '💻' },
    { path: '/projects', label: 'Projets', icon: '📂' },
    { path: '/tasks', label: 'Missions', icon: '✅' },
    { path: '/users', label: 'Équipe', icon: '👥' },
    { path: '/settings', label: 'Configuration', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-inter">
      {/* Sidebar - Clean Light Version */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-100 z-50 flex flex-col py-8 shadow-sm">
        {/* Brand */}
        <div className="px-8 mb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl font-black text-white">D</span>
          </div>
          <span className="font-montserrat font-black text-slate-900 uppercase tracking-tighter text-lg">DSI Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center py-3 px-4 rounded-xl transition-all font-bold text-sm uppercase tracking-tight ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="text-lg mr-4">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="px-4 pt-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center py-3 px-4 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all font-bold text-sm uppercase tracking-tight"
          >
            <span className="text-lg mr-4">🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 p-8">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-slate-900 font-montserrat font-black text-2xl uppercase tracking-tighter">
              {menuItems.find(m => m.path === location.pathname)?.label || 'DSI Dashboard'}
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Status: Opérationnel</p>
          </div>

          <div className="flex items-center gap-6 bg-white p-2 pr-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-black text-sm">
              {auth.user?.nom?.[0] || 'U'}
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{auth.user?.nom}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                {auth.user?.role || 'INFORMATICIEN'}
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main>
          {children}
        </main>

        <footer className="mt-20 pt-8 border-t border-slate-100 flex justify-between text-[10px] text-slate-300 uppercase tracking-[0.3em] font-black">
          <span>&copy; {new Date().getFullYear()} DSI Command Center</span>
          <span>v2.0 Clean Light Edition</span>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
