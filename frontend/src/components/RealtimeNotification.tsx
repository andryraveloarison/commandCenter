import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@store/store';
import socketService from '@services/socket';
import { logStore } from '@services/logStore';

interface Toast {
  id: number;
  icon: string;
  title: string;
  message: string;
  projectId?: string;
  isDm?: boolean;
  partnerId?: string;
  color: string;
}

let toastCounter = 0;

const COLORS = {
  project:  '#4ade80',
  group:    '#60a5fa',
  dm:       '#a78bfa',
};

const RealtimeNotification: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const myId = currentUser?.id;

  const add = (toast: Omit<Toast, 'id'>) => {
    const t: Toast = { ...toast, id: ++toastCounter };
    setToasts(prev => [...prev, t]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 6000);
  };

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  useEffect(() => {
    // Project notifications (sent directly to user room)
    const onNotification = (data: any) => {
      add({
        icon: '◆',
        title: data.title ?? 'Notification',
        message: data.message ?? '',
        projectId: data.projectId,
        color: COLORS.project,
      });
    };

    // Group messages
    const onGroupMessage = (data: any) => {
      if (data.user?.id === myId) return; // don't notify myself
      const preview = data.contenu?.slice(0, 60) ?? '';
      const sender = data.user?.username ?? data.user?.nom ?? 'Inconnu';

      add({
        icon: '💬',
        title: `Canal groupe · @${sender}`,
        message: preview,
        color: COLORS.group,
      });

      logStore.add(`[GROUPE] @${sender} : ${preview}`, 'info');
    };

    // DM messages
    const onDmMessage = (data: any) => {
      if (data.sender?.id === myId) return; // don't notify for messages I sent
      const preview = data.contenu?.slice(0, 60) ?? '';
      const sender = data.sender?.username ?? data.sender?.nom ?? 'Inconnu';

      add({
        icon: '✉️',
        title: `Message privé · @${sender}`,
        message: preview,
        isDm: true,
        partnerId: data.sender?.id,
        color: COLORS.dm,
      });

      logStore.add(`[MSG PRIVÉ] @${sender} → vous : ${preview}`, 'info');
    };

    socketService.on('notification',   onNotification);
    socketService.on('group_message',  onGroupMessage);
    socketService.on('dm_message',     onDmMessage);

    return () => {
      socketService.off('notification',  onNotification);
      socketService.off('group_message', onGroupMessage);
      socketService.off('dm_message',    onDmMessage);
    };
  }, [myId]);

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
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: toast.color }} />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r" style={{ borderColor: toast.color }} />

          {/* Top strip */}
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
                    onClick={() => { remove(toast.id); navigate(`/projects/${toast.projectId}`); }}
                    className="mt-1.5 text-[9px] font-black uppercase tracking-widest transition-colors"
                    style={{ color: `${toast.color}70` }}
                    onMouseEnter={e => (e.currentTarget.style.color = toast.color)}
                    onMouseLeave={e => (e.currentTarget.style.color = `${toast.color}70`)}
                  >→ Voir le dossier</button>
                )}

                {toast.isDm && toast.partnerId && (
                  <button
                    onClick={() => { remove(toast.id); navigate('/messages'); }}
                    className="mt-1.5 text-[9px] font-black uppercase tracking-widest transition-colors"
                    style={{ color: `${toast.color}70` }}
                    onMouseEnter={e => (e.currentTarget.style.color = toast.color)}
                    onMouseLeave={e => (e.currentTarget.style.color = `${toast.color}70`)}
                  >→ Répondre</button>
                )}
              </div>
              <button
                onClick={() => remove(toast.id)}
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
