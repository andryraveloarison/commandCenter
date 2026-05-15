import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationStore, type ToastItem } from '@services/notificationStore';

const RealtimeNotification: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => notificationStore.subscribe(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 flex flex-col gap-3 z-[99999] pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto w-80 overflow-hidden animate-slide-in relative"
          style={{
            background: 'linear-gradient(160deg, #0f1623 0%, #0a0f1a 100%)',
            border: `1px solid ${toast.color}30`,
            borderRadius: 4,
            boxShadow: `0 0 40px ${toast.color}12, 0 8px 32px rgba(0,0,0,0.5)`,
          }}
        >
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: toast.color }} />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r" style={{ borderColor: toast.color }} />
          <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${toast.color}, transparent)` }} />

          <div className="px-4 py-3">
            <div className="flex items-start gap-3">
              <div
                className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-[11px] mt-0.5"
                style={{ background: `${toast.color}15`, border: `1px solid ${toast.color}30`, borderRadius: 3 }}
              >
                {toast.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest truncate" style={{ color: toast.color }}>{toast.title}</p>
                <p className="text-[11px] mt-0.5 leading-snug line-clamp-2" style={{ color: '#ffffff70' }}>{toast.message}</p>

                {toast.projectId && (
                  <button
                    onClick={() => { notificationStore.remove(toast.id); navigate(`/projects/${toast.projectId}`); }}
                    className="mt-1.5 text-[9px] font-black uppercase tracking-widest transition-colors"
                    style={{ color: `${toast.color}70` }}
                    onMouseEnter={e => (e.currentTarget.style.color = toast.color)}
                    onMouseLeave={e => (e.currentTarget.style.color = `${toast.color}70`)}
                  >→ Voir le dossier</button>
                )}
                {toast.isDm && (
                  <button
                    onClick={() => { notificationStore.remove(toast.id); navigate('/messages'); }}
                    className="mt-1.5 text-[9px] font-black uppercase tracking-widest transition-colors"
                    style={{ color: `${toast.color}70` }}
                    onMouseEnter={e => (e.currentTarget.style.color = toast.color)}
                    onMouseLeave={e => (e.currentTarget.style.color = `${toast.color}70`)}
                  >→ Répondre</button>
                )}
              </div>
              <button
                onClick={() => notificationStore.remove(toast.id)}
                className="text-[10px] flex-shrink-0 transition-colors"
                style={{ color: '#ffffff20' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#ffffff20')}
              >✕</button>
            </div>
          </div>

          <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${toast.color}40, transparent)` }} />
        </div>
      ))}
    </div>
  );
};

export default RealtimeNotification;
