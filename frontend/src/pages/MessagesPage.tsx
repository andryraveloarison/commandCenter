import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@store/store';
import apiService from '@services/api';
import socketService from '@services/socket';
import PollCard from '@components/chat/PollCard';
import CreatePollForm from '@components/chat/CreatePollForm';
import type { GroupMessage, Poll } from '@components/chat/chatTypes';

/* ── Local types ─────────────────────────────────────────────────────────── */
interface UserBrief { id: string; nom: string; username?: string; photo?: string; }

interface DmMessage {
  id: string; contenu: string; createdAt: string; lu: boolean;
  sender: UserBrief;
}

interface Conversation {
  partner: UserBrief;
  lastMessage: { contenu: string; createdAt: string; senderId: string };
  unread: number;
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const COLORS = ['#6366F1','#EC4899','#F59E0B','#10B981','#3B82F6','#8B5CF6','#EF4444','#14B8A6'];
const cc: Record<string,string> = {};
const col = (id: string) => { if (!cc[id]) cc[id] = COLORS[Object.keys(cc).length % COLORS.length]; return cc[id]; };

const Av: React.FC<{ user: UserBrief; size?: number; style?: React.CSSProperties }> = ({ user, size = 32, style }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: col(user.id), flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: '#fff', overflow: 'hidden', ...style }}>
    {user.photo ? <img src={user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user.username ?? user.nom)[0]?.toUpperCase()}
  </div>
);

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const fmtDate = (iso: string) => {
  const d = new Date(iso), t = new Date();
  if (d.toDateString() === t.toDateString()) return "Aujourd'hui";
  const y = new Date(t); y.setDate(t.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' });
};

/* ── Read receipts ───────────────────────────────────────────────────────── */
const ReadReceipts: React.FC<{ users: UserBrief[]; align: 'left'|'right' }> = ({ users, align }) => {
  if (!users.length) return null;
  return (
    <div style={{ display: 'flex', gap: 2, justifyContent: align === 'right' ? 'flex-end' : 'flex-start', marginTop: 3 }}>
      {users.slice(0, 5).map((u, i) => (
        <div key={u.id} title={`Lu par ${u.username ?? u.nom}`} style={{ marginLeft: i ? -8 : 0 }}><Av user={u} size={22} /></div>
      ))}
      {users.length > 5 && <span style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 600, marginLeft: 2 }}>+{users.length - 5}</span>}
    </div>
  );
};

/* ── User picker modal ───────────────────────────────────────────────────── */
const UserPicker: React.FC<{ users: UserBrief[]; onSelect: (u: UserBrief) => void; onClose: () => void }> = ({ users, onSelect, onClose }) => {
  const [q, setQ] = useState('');
  const filtered = users.filter(u => (u.username ?? u.nom).toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 18, width: 360, boxShadow: '0 16px 48px rgba(0,0,0,0.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 18px 12px' }}>
          <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 15, color: '#1A1D2E' }}>Nouvelle conversation</p>
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher un membre…"
            style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #EEF0F6', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => (e.target.style.borderColor = '#4F46E5')} onBlur={e => (e.target.style.borderColor = '#EEF0F6')}
          />
        </div>
        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#C4C9D4', fontSize: 12, padding: '20px 0' }}>Aucun résultat</p>}
          {filtered.map(u => (
            <div key={u.id} onClick={() => onSelect(u)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F5F7FF')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <Av user={u} size={34} />
              <span style={{ fontWeight: 600, fontSize: 13.5, color: '#1A1D2E' }}>{u.username ?? u.nom}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 18px', borderTop: '1px solid #F5F7FA' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 12, color: '#9CA3AF', cursor: 'pointer' }}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

/* ── Main page ───────────────────────────────────────────────────────────── */
const MessagesPage: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const me   = auth.user;

  const [view, setView]                   = useState<'group' | string>('group');
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [dmMessages, setDmMessages]       = useState<DmMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allUsers, setAllUsers]           = useState<UserBrief[]>([]);
  const [onlineCount, setOnlineCount]     = useState(0);
  const [input, setInput]                 = useState('');
  const [sending, setSending]             = useState(false);
  const [showPicker, setShowPicker]       = useState(false);
  const [showPollForm, setShowPollForm]   = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLTextAreaElement>(null);
  const prevCountRef = useRef(0);

  const scrollDown = useCallback((force = false) => {
    const el = containerRef.current;
    if (!el) return;
    const msgs = view === 'group' ? groupMessages : dmMessages;
    if (force || msgs.length > prevCountRef.current) { el.scrollTop = el.scrollHeight; prevCountRef.current = msgs.length; }
  }, [view, groupMessages, dmMessages]);

  useEffect(() => { scrollDown(); }, [groupMessages, dmMessages]);

  useEffect(() => {
    apiService.getUsers().then(r => setAllUsers((r.data as any[]).filter(u => u.id !== me?.id))).catch(() => {});
    apiService.getOnlineUsers().then(r => setOnlineCount(Array.isArray(r.data) ? r.data.length : 0)).catch(() => {});
    fetchConversations();
    socketService.connect();
    return () => { socketService.disconnect(); };
  }, []);

  const fetchConversations = () => { apiService.getDmConversations().then(r => setConversations(r.data)).catch(() => {}); };

  /* Real-time: group messages */
  useEffect(() => {
    const handler = (msg: GroupMessage) => {
      setGroupMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
      if (view === 'group') apiService.markMessagesAsRead().catch(() => {});
    };
    socketService.on<GroupMessage>('group_message', handler);
    return () => socketService.off('group_message', handler);
  }, [view]);

  /* Real-time: group read receipts */
  useEffect(() => {
    const handler = (data: { user: { id: string; nom: string; username?: string; photo?: string } }) => {
      if (data.user.id === me?.id) return;
      setGroupMessages(prev => prev.map(m => {
        if (m.reads?.some(r => r.user.id === data.user.id)) return m;
        return { ...m, reads: [...(m.reads ?? []), { user: data.user }] };
      }));
    };
    socketService.on('message:read', handler);
    return () => socketService.off('message:read', handler);
  }, [me?.id]);

  /* Real-time: DM read receipts */
  useEffect(() => {
    const handler = (data: { readerId: string }) => {
      // The partner read my messages — mark them as lu
      if (data.readerId !== view) return; // only update if it's the active conversation
      setDmMessages(prev => prev.map(m => ({
        ...m,
        lu: (m as DmMessage).sender?.id === me?.id ? true : m.lu,
      })));
    };
    socketService.on('dm:read', handler);
    return () => socketService.off('dm:read', handler);
  }, [view, me?.id]);

  /* Real-time: poll votes */
  useEffect(() => {
    const handler = (updatedPoll: Poll) => {
      setGroupMessages(prev => prev.map(m => m.poll?.id === updatedPoll.id ? { ...m, poll: updatedPoll } : m));
    };
    socketService.on<Poll>('poll_update', handler);
    return () => socketService.off('poll_update', handler);
  }, []);

  /* Real-time: DMs */
  useEffect(() => {
    const handler = (msg: DmMessage) => {
      const partnerId = msg.sender.id === me?.id ? (msg as any).receiverId : msg.sender.id;
      setDmMessages(prev => {
        if (view !== partnerId && view !== msg.sender.id) return prev;
        return prev.find(m => m.id === msg.id) ? prev : [...prev, msg];
      });
      fetchConversations();
      if (view === partnerId || view === msg.sender.id) apiService.markDmAsRead(partnerId).catch(() => {});
    };
    socketService.on<DmMessage>('dm_message', handler);
    return () => socketService.off('dm_message', handler);
  }, [view, me?.id]);

  /* Fallback poll (30s) */
  useEffect(() => {
    prevCountRef.current = 0;
    const tick = async () => {
      if (view === 'group') {
        const res = await apiService.getMessages().catch(() => null);
        if (res) setGroupMessages(res.data);
        apiService.markMessagesAsRead().catch(() => {});
      } else {
        const res = await apiService.getDmMessages(view).catch(() => null);
        if (res) setDmMessages(res.data);
        apiService.markDmAsRead(view).catch(() => {});
        fetchConversations();
      }
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [view]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true); setInput('');
    try {
      view === 'group' ? await apiService.sendMessage(text) : await apiService.sendDmMessage(view, text);
      if (view !== 'group') fetchConversations();
    } catch {}
    setSending(false);
    inputRef.current?.focus();
    setTimeout(() => { if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight; }, 50);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleCreatePoll = async (question: string, options: string[]) => {
    setShowPollForm(false);
    try { await apiService.createPoll(question, options); } catch {}
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      const res = await apiService.votePoll(pollId, optionIndex);
      const updated: Poll = res.data;
      setGroupMessages(prev => prev.map(m => m.poll?.id === pollId ? { ...m, poll: updated } : m));
    } catch {}
  };

  const startDm = (user: UserBrief) => {
    setShowPicker(false);
    setView(user.id);
    if (!conversations.find(c => c.partner.id === user.id)) {
      setConversations(prev => [{ partner: user, lastMessage: { contenu: '', createdAt: new Date().toISOString(), senderId: '' }, unread: 0 }, ...prev]);
    }
  };

  const messages = view === 'group' ? groupMessages : dmMessages;
  const groups: { date: string; msgs: (GroupMessage | DmMessage)[] }[] = [];
  for (const m of messages) {
    const key = fmtDate(m.createdAt);
    if (!groups.length || groups[groups.length - 1].date !== key) groups.push({ date: key, msgs: [m] });
    else groups[groups.length - 1].msgs.push(m);
  }

  const activePartner = view !== 'group' ? allUsers.find(u => u.id === view) || conversations.find(c => c.partner.id === view)?.partner : null;

  const lastReadByUser: Record<string, { msgId: string; user: UserBrief }> = {};
  for (const msg of groupMessages) {
    if (msg.user.id !== me?.id) continue; // only track reads on my own messages
    for (const r of msg.reads ?? []) {
      if (r.user.id !== me?.id) lastReadByUser[r.user.id] = { msgId: msg.id, user: r.user };
    }
  }

  const lastDmReadId = (() => {
    let id: string | null = null;
    for (const msg of dmMessages) {
      if ((msg as DmMessage).sender.id === me?.id && (msg as DmMessage).lu) id = msg.id;
    }
    return id;
  })();

  return (
    <>
      {showPicker && <UserPicker users={allUsers} onSelect={startDm} onClose={() => setShowPicker(false)} />}

      <div style={{ display: 'flex', height: 'calc(100vh - 108px)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #EEF0F6' }}>

        {/* ── Left sidebar ── */}
        <div style={{ width: 230, background: '#FAFBFF', borderRight: '1px solid #EEF0F6', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '14px 10px 8px' }}>
            <p style={{ margin: '0 0 6px 6px', fontSize: 10, fontWeight: 700, color: '#C4C9D4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Canaux</p>
            <div onClick={() => setView('group')}
              style={{ padding: '9px 10px', borderRadius: 10, cursor: 'pointer', background: view === 'group' ? '#EEF2FF' : 'transparent', display: 'flex', alignItems: 'center', gap: 9, transition: 'background 0.12s' }}
              onMouseEnter={e => { if (view !== 'group') (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; }}
              onMouseLeave={e => { if (view !== 'group') (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 9, background: view === 'group' ? '#4F46E5' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>💬</div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 12.5, color: view === 'group' ? '#4F46E5' : '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Chat d'équipe</p>
                <p style={{ margin: 0, fontSize: 10, color: view === 'group' ? '#818CF8' : '#9CA3AF' }}>Canal global</p>
              </div>
            </div>
          </div>

          <div style={{ padding: '4px 10px 6px', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 6px 6px' }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#C4C9D4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Messages privés</p>
              <button onClick={() => setShowPicker(true)} title="Nouvelle conversation"
                style={{ width: 20, height: 20, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#6B7280' }}>+</button>
            </div>
            {conversations.length === 0 && <p style={{ fontSize: 11, color: '#D1D5DB', textAlign: 'center', marginTop: 12 }}>Aucune conversation</p>}
            {conversations.map(conv => {
              const isActive = view === conv.partner.id;
              return (
                <div key={conv.partner.id} onClick={() => setView(conv.partner.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 10, cursor: 'pointer', background: isActive ? '#EEF2FF' : 'transparent', transition: 'background 0.12s', position: 'relative' }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Av user={conv.partner} size={32} />
                    {conv.unread > 0 && (
                      <span style={{ position: 'absolute', top: -3, right: -3, minWidth: 14, height: 14, borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '1.5px solid #FAFBFF' }}>{conv.unread > 9 ? '9+' : conv.unread}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12.5, fontWeight: conv.unread > 0 ? 700 : 600, color: isActive ? '#4F46E5' : '#1A1D2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.partner.username ?? conv.partner.nom}</p>
                    {conv.lastMessage.contenu && (
                      <p style={{ margin: 0, fontSize: 10.5, color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: conv.unread > 0 ? 600 : 400 }}>
                        {conv.lastMessage.senderId === me?.id ? 'Vous : ' : ''}{conv.lastMessage.contenu}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: '10px 14px', borderTop: '1px solid #EEF0F6', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'block' }} />
            <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{onlineCount} en ligne</span>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', minWidth: 0 }}>

          {/* Header */}
          <div style={{ padding: '13px 20px', borderBottom: '1px solid #F0F2F8', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {view === 'group' ? (
              <>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💬</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1A1D2E' }}>Chat d'équipe</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#B0B5CC', fontWeight: 500 }}>{messages.length} message{messages.length !== 1 ? 's' : ''} · Canal global</p>
                </div>
              </>
            ) : activePartner ? (
              <>
                <Av user={activePartner} size={38} style={{ borderRadius: 10 }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1A1D2E' }}>{activePartner.username ?? activePartner.nom}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#B0B5CC', fontWeight: 500 }}>Message privé</p>
                </div>
              </>
            ) : null}
          </div>

          {/* Messages */}
          <div ref={containerRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column' }}>
            {groups.length === 0 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 60 }}>
                <div style={{ fontSize: 38 }}>{view === 'group' ? '💬' : '✉️'}</div>
                <p style={{ color: '#C4C9D4', fontSize: 13, fontWeight: 600, textAlign: 'center', margin: 0 }}>
                  {view === 'group' ? 'Aucun message.\nLancez la conversation !' : `Commencez votre conversation\navec ${activePartner?.username ?? activePartner?.nom ?? ''}`}
                </p>
              </div>
            )}

            {groups.map(group => (
              <div key={group.date}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 12px' }}>
                  <div style={{ flex: 1, height: 1, background: '#F0F2F8' }} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#C4C9D4', background: '#fff', padding: '2px 10px', borderRadius: 99, border: '1px solid #F0F2F8', whiteSpace: 'nowrap' }}>{group.date}</span>
                  <div style={{ flex: 1, height: 1, background: '#F0F2F8' }} />
                </div>

                {group.msgs.map((msg, idx) => {
                  const senderId  = view === 'group' ? (msg as GroupMessage).user.id : (msg as DmMessage).sender.id;
                  const senderUser = view === 'group' ? (msg as GroupMessage).user : (msg as DmMessage).sender;
                  const isMine     = senderId === me?.id;
                  const prevSender = idx > 0 ? (view === 'group' ? (group.msgs[idx-1] as GroupMessage).user.id : (group.msgs[idx-1] as DmMessage).sender.id) : null;
                  const showAvatar = !isMine && prevSender !== senderId;
                  const isGrouped  = !isMine && !showAvatar;
                  const isPoll     = view === 'group' && (msg as GroupMessage).type === 'POLL' && !!(msg as GroupMessage).poll;

                  return (
                    <div key={msg.id} className="msg-row" style={{ display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: 9, marginBottom: 5 }}>
                      {!isMine && (
                        <div style={{ width: 32, flexShrink: 0 }}>
                          {showAvatar && <Av user={senderUser} size={32} />}
                        </div>
                      )}
                      <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                        {!isMine && showAvatar && <p style={{ margin: '0 2px 3px', fontSize: 11, fontWeight: 700, color: col(senderId) }}>{(senderUser as any).username ?? senderUser.nom}</p>}

                        {/* Bubble + time side by side */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, flexDirection: isMine ? 'row-reverse' : 'row' }}>
                          {isPoll ? (
                            <PollCard
                              poll={(msg as GroupMessage).poll!}
                              currentUserId={me?.id}
                              isMine={isMine}
                              onVote={handleVote}
                            />
                          ) : (
                            <div style={{ padding: '9px 13px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isMine ? '#4F46E5' : '#F3F4F6', color: isMine ? '#fff' : '#1A1D2E', fontSize: 13.5, fontWeight: 500, lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                              {msg.contenu}
                            </div>
                          )}
                          <span className="msg-time" style={{ fontSize: 10, color: '#C4C9D4', fontWeight: 500, flexShrink: 0, paddingBottom: 2 }}>{fmtTime(msg.createdAt)}</span>
                        </div>

                        {/* Read receipts below */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2, flexDirection: isMine ? 'row-reverse' : 'row' }}>
                          {view === 'group' && isMine && (
                            <ReadReceipts users={Object.values(lastReadByUser).filter(v => v.msgId === msg.id).map(v => v.user)} align="right" />
                          )}
                          {view !== 'group' && isMine && msg.id === lastDmReadId && (
                            <span style={{ fontSize: 10, color: '#818CF8', fontWeight: 600 }}>✓ Lu</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Poll form (group only) */}
          {view === 'group' && showPollForm && (
            <div style={{ padding: '0 16px' }}>
              <CreatePollForm compact onSubmit={handleCreatePoll} onCancel={() => setShowPollForm(false)} />
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '11px 16px', borderTop: '1px solid #F0F2F8', display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0 }}>
            {me && <Av user={me as UserBrief} size={32} style={{ borderRadius: 10, marginBottom: 2 }} />}

            {/* Poll button — group only */}
            {view === 'group' && (
              <button onClick={() => setShowPollForm(v => !v)} title="Créer un sondage"
                style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, border: `1.5px solid ${showPollForm ? '#4F46E5' : '#EEF0F6'}`, background: showPollForm ? '#EEF2FF' : '#F8FAFC', color: showPollForm ? '#4F46E5' : '#9CA3AF', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 0 }}>
                📊
              </button>
            )}

            <textarea
              ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder={view === 'group' ? "Écrire au canal… (Entrée pour envoyer)" : `Message à ${activePartner?.username ?? activePartner?.nom ?? ''}…`}
              maxLength={1000} rows={1}
              style={{ flex: 1, resize: 'none', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #EEF0F6', background: '#F8FAFC', fontSize: 13.5, fontWeight: 500, color: '#1A1D2E', outline: 'none', fontFamily: 'Inter, sans-serif', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto', transition: 'border-color 0.15s' }}
              onFocus={e => (e.target.style.borderColor = '#4F46E5')}
              onBlur={e => (e.target.style.borderColor = '#EEF0F6')}
              onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; }}
            />
            <button onClick={handleSend} disabled={!input.trim() || sending}
              style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: input.trim() ? '#4F46E5' : '#EEF2FF', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
              <svg width="17" height="17" fill="none" stroke={input.trim() ? '#fff' : '#A5B4FC'} strokeWidth={2} viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessagesPage;
