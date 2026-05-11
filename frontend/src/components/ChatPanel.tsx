import React, { useState, useEffect, useRef } from 'react';
import apiService from '@services/api';

interface Message {
  id: string;
  contenu: string;
  createdAt: string;
  user: { id: string; nom: string; photo?: string };
}

interface Props {
  open: boolean;
  onClose: () => void;
  currentUserId?: string;
}

const USER_COLORS = ['#6366F1','#EC4899','#F59E0B','#10B981','#3B82F6','#8B5CF6','#EF4444','#14B8A6'];
const colorCache: Record<string, string> = {};
const getColor = (id: string) => {
  if (!colorCache[id]) {
    colorCache[id] = USER_COLORS[Object.keys(colorCache).length % USER_COLORS.length];
  }
  return colorCache[id];
};

const ChatPanel: React.FC<Props> = ({ open, onClose, currentUserId }) => {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [sending, setSending]     = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await apiService.getMessages();
      setMessages(res.data);
    } catch {}
  };

  /* Poll every 3s when open */
  useEffect(() => {
    if (!open) return;
    fetchMessages();
    inputRef.current?.focus();
    const id = setInterval(fetchMessages, 3000);
    return () => clearInterval(id);
  }, [open]);

  /* Auto-scroll to latest */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');
    try {
      await apiService.sendMessage(text);
      await fetchMessages();
    } catch {}
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Hier';
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  /* Group by date */
  const groups: { date: string; msgs: Message[] }[] = [];
  for (const m of messages) {
    const key = formatDate(m.createdAt);
    if (!groups.length || groups[groups.length - 1].date !== key) {
      groups.push({ date: key, msgs: [m] });
    } else {
      groups[groups.length - 1].msgs.push(m);
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop on mobile */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 54,
          background: 'rgba(0,0,0,0.15)',
          backdropFilter: 'blur(1px)',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: 62, right: 0, bottom: 0,
        width: 340,
        background: '#FFFFFF',
        borderLeft: '1px solid #EEF0F6',
        display: 'flex', flexDirection: 'column',
        zIndex: 55,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.07)',
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 18px',
          borderBottom: '1px solid #F0F2F8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#EEF2FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17,
            }}>💬</div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1A1D2E' }}>Chat d'équipe</p>
              <p style={{ margin: 0, fontSize: 10.5, color: '#B0B5CC', fontWeight: 500 }}>Canal global</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8,
              border: 'none', background: '#F5F7FA',
              cursor: 'pointer', color: '#9CA3AF', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {groups.length === 0 && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#C4C9D4', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
                Aucun message.<br />Soyez le premier à écrire !
              </p>
            </div>
          )}
          {groups.map(group => (
            <div key={group.date}>
              {/* Date separator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0 8px' }}>
                <div style={{ flex: 1, height: 1, background: '#F0F2F8' }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: '#C4C9D4', whiteSpace: 'nowrap' }}>{group.date}</span>
                <div style={{ flex: 1, height: 1, background: '#F0F2F8' }} />
              </div>

              {group.msgs.map((msg, idx) => {
                const isMine = msg.user.id === currentUserId;
                const showAvatar = !isMine && (idx === 0 || group.msgs[idx - 1]?.user.id !== msg.user.id);
                const color = getColor(msg.user.id);

                return (
                  <div key={msg.id} style={{
                    display: 'flex',
                    flexDirection: isMine ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: 7,
                    marginBottom: 4,
                    marginLeft: !isMine && !showAvatar ? 36 : 0,
                  }}>
                    {/* Avatar */}
                    {!isMine && showAvatar && (
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: '#fff',
                        overflow: 'hidden', flexShrink: 0,
                      }}>
                        {msg.user.photo
                          ? <img src={msg.user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : msg.user.nom[0].toUpperCase()
                        }
                      </div>
                    )}

                    <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                      {/* Sender name */}
                      {!isMine && showAvatar && (
                        <p style={{ margin: '0 0 2px 2px', fontSize: 10, fontWeight: 700, color: color }}>
                          {msg.user.nom}
                        </p>
                      )}

                      {/* Bubble */}
                      <div style={{
                        padding: '8px 12px',
                        borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        background: isMine ? '#4F46E5' : '#F3F4F6',
                        color: isMine ? '#fff' : '#1A1D2E',
                        fontSize: 13, fontWeight: 500, lineHeight: 1.45,
                        wordBreak: 'break-word',
                      }}>
                        {msg.contenu}
                      </div>

                      {/* Time */}
                      <span style={{ fontSize: 9.5, color: '#C4C9D4', fontWeight: 500, marginTop: 2, padding: '0 2px' }}>
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid #F0F2F8',
          display: 'flex', gap: 8, alignItems: 'flex-end',
          flexShrink: 0,
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Écrire un message…"
            maxLength={1000}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 12,
              border: '1.5px solid #EEF0F6',
              background: '#F8FAFC',
              fontSize: 13, fontWeight: 500, color: '#1A1D2E',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.target.style.borderColor = '#4F46E5')}
            onBlur={e => (e.target.style.borderColor = '#EEF0F6')}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            style={{
              width: 40, height: 40, borderRadius: 11, flexShrink: 0,
              background: input.trim() ? '#4F46E5' : '#EEF2FF',
              border: 'none', cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            <svg width="16" height="16" fill="none" stroke={input.trim() ? '#fff' : '#A5B4FC'} strokeWidth={2} viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatPanel;
