import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@store/store';
import apiService from '@services/api';
import { SERVER_ORIGIN } from '@services/api/client';
import socketService from '@services/socket';
import PollCard from './chat/PollCard';
import CreatePollForm from './chat/CreatePollForm';
import AttachMenu from './chat/AttachMenu';
import FileCard from './chat/FileCard';
import type { GroupMessage, Poll } from './chat/chatTypes';
import {
  setGroupMessages, prependGroupMessages, setGroupLoadingMore,
  addGroupMessage, updateGroupReads, updateGroupPoll,
} from '@store/slices/messagesSlice';

interface Props {
  open: boolean;
  onClose: () => void;
  currentUserId?: string;
}

const USER_COLORS = ['#6366F1','#EC4899','#F59E0B','#10B981','#3B82F6','#8B5CF6','#EF4444','#14B8A6'];
const colorCache: Record<string, string> = {};
const getColor = (id: string) => {
  if (!colorCache[id]) colorCache[id] = USER_COLORS[Object.keys(colorCache).length % USER_COLORS.length];
  return colorCache[id];
};

const ChatPanel: React.FC<Props> = ({ open, onClose, currentUserId }) => {
  const dispatch  = useDispatch();
  const groupCache = useSelector((s: RootState) => s.messages.group);
  const messages  = groupCache.items as GroupMessage[];

  const [input,        setInput]        = useState('');
  const [sending,      setSending]      = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [showAttach,   setShowAttach]   = useState(false);
  const [lightboxSrc,  setLightboxSrc]  = useState<string | null>(null);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const scrollRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const atBottomRef         = useRef(true);
  const lastMsgIdRef        = useRef<string>('');
  const firstMsgIdRef       = useRef<string>('');
  const prevScrollHeight    = useRef<number | null>(null);
  const loadingMoreRef      = useRef(false);

  // On open: use Redux cache; fetch only if empty
  useEffect(() => {
    if (!open) return;
    if (groupCache.items.length === 0) {
      apiService.getMessages({ limit: 50 }).then(r => {
        dispatch(setGroupMessages({ items: r.data.messages, hasMore: r.data.hasMore }));
      }).catch(() => {});
    }
    apiService.markMessagesAsRead().catch(() => {});
    inputRef.current?.focus();
  }, [open]);

  // Real-time: new group messages → dispatch to Redux
  useEffect(() => {
    const handler = (msg: GroupMessage) => { dispatch(addGroupMessage(msg)); };
    socketService.on<GroupMessage>('group_message', handler);
    return () => socketService.off('group_message', handler);
  }, []);

  // Real-time: poll updates
  useEffect(() => {
    const handler = (updatedPoll: Poll) => { dispatch(updateGroupPoll(updatedPoll)); };
    socketService.on<Poll>('poll_update', handler);
    return () => socketService.off('poll_update', handler);
  }, []);

  // Real-time: read receipts
  useEffect(() => {
    const handler = (data: { user: { id: string; nom: string; username?: string; photo?: string } }) => {
      if (data.user.id === currentUserId) return;
      dispatch(updateGroupReads({ user: data.user }));
    };
    socketService.on('message:read', handler);
    return () => socketService.off('message:read', handler);
  }, [currentUserId]);

  // Load older messages — save scrollHeight BEFORE dispatch, restore AFTER DOM update
  const loadMore = useCallback(async () => {
    if (!groupCache.hasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    const el = scrollRef.current;
    prevScrollHeight.current = el?.scrollHeight ?? 0; // must be captured synchronously, before the await
    dispatch(setGroupLoadingMore(true));
    try {
      const oldest = messages[0];
      const r = await apiService.getMessages({ limit: 50, before: oldest?.createdAt });
      dispatch(prependGroupMessages({ items: r.data.messages, hasMore: r.data.hasMore }));
    } catch {
      loadingMoreRef.current = false;
      dispatch(setGroupLoadingMore(false));
    }
  }, [groupCache.hasMore, messages]);

  // Track if user is near bottom; trigger load-more when scrolled to top
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (el.scrollTop < 50) loadMore();
  }, [loadMore]);

  // Runs synchronously after DOM update, before paint — no scroll flicker
  useLayoutEffect(() => {
    if (messages.length === 0) return;
    const el = scrollRef.current;
    const lastId  = messages[messages.length - 1].id;
    const firstId = messages[0].id;
    const isInitial = lastMsgIdRef.current === '';
    const isPrepend = !isInitial && firstId !== firstMsgIdRef.current && lastId === lastMsgIdRef.current;
    const isAppend  = !isInitial && lastId !== lastMsgIdRef.current;

    lastMsgIdRef.current  = lastId;
    firstMsgIdRef.current = firstId;

    if (isPrepend && prevScrollHeight.current !== null && el) {
      el.scrollTop = el.scrollHeight - prevScrollHeight.current;
      prevScrollHeight.current = null;
      loadingMoreRef.current = false;
    } else if (isInitial && el) {
      el.scrollTop = el.scrollHeight;
    } else if (isAppend && atBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true); setInput('');
    try { await apiService.sendMessage(text); } catch {}
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleCreatePoll = async (question: string, options: string[]) => {
    setShowPollForm(false);
    try { await apiService.createPoll(question, options); } catch {}
  };

  const handleAttachImage = async (file: File) => {
    try {
      const { data } = await apiService.uploadChatFile(file);
      await apiService.sendMediaMessage('IMAGE', data.url, data.fileName);
    } catch {}
  };

  const handleAttachFile = async (file: File) => {
    try {
      const { data } = await apiService.uploadChatFile(file);
      await apiService.sendMediaMessage('FILE', data.url, data.fileName);
    } catch {}
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      const res = await apiService.votePoll(pollId, optionIndex);
      dispatch(updateGroupPoll(res.data));
    } catch {}
  };

  // Converts a server-relative path (/uploads/...) to a full URL
  const toFileUrl = (contenu: string) =>
    contenu.startsWith('/') ? `${SERVER_ORIGIN}${contenu}` : contenu;

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (iso: string) => {
    const d = new Date(iso), today = new Date();
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
    const y = new Date(today); y.setDate(today.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return 'Hier';
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  const groups: { date: string; msgs: GroupMessage[] }[] = [];
  for (const m of messages) {
    const key = formatDate(m.createdAt);
    if (!groups.length || groups[groups.length - 1].date !== key) groups.push({ date: key, msgs: [m] });
    else groups[groups.length - 1].msgs.push(m);
  }

  if (!open) return null;

  return (
    <>
      {lightboxSrc && (
        <div onClick={() => setLightboxSrc(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          <img src={lightboxSrc} alt="aperçu"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 10, boxShadow: '0 8px 40px rgba(0,0,0,0.5)', objectFit: 'contain' }}
            onClick={e => e.stopPropagation()}
          />
          <button onClick={() => setLightboxSrc(null)}
            style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
      )}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 54, background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(1px)' }} />
      <div style={{ position: 'fixed', top: 62, right: 0, bottom: 0, width: 340, background: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', zIndex: 55, boxShadow: '-4px 0 24px rgba(0,0,0,0.07)' }}>

        {/* Header */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>💬</div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Chat d'équipe</p>
              <p style={{ margin: 0, fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 500 }}>Canal global · Temps réel</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'var(--bg-app)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} onScroll={handleScroll} style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {groupCache.loadingMore && (
            <div style={{ textAlign: 'center', padding: '6px 0', fontSize: 10, fontWeight: 600, color: 'var(--text-faint)' }}>
              Chargement…
            </div>
          )}
          {groups.length === 0 && !groupCache.loadingMore && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-faint)', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>Aucun message.<br />Soyez le premier à écrire !</p>
            </div>
          )}
          {groups.map(group => (
            <div key={group.date}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0 8px' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>{group.date}</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
              </div>
              {group.msgs.map((msg, idx) => {
                const isMine     = msg.user.id === currentUserId;
                const showAvatar = !isMine && (idx === 0 || group.msgs[idx - 1]?.user.id !== msg.user.id);
                const color      = getColor(msg.user.id);
                return (
                  <div key={msg.id} className="msg-row" style={{ display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 7, marginBottom: 4, marginLeft: !isMine && !showAvatar ? 36 : 0 }}>
                    {!isMine && showAvatar && (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', overflow: 'hidden', flexShrink: 0 }}>
                        {msg.user.photo ? <img src={msg.user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (msg.user.username ?? msg.user.nom)[0].toUpperCase()}
                      </div>
                    )}
                    <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                      {!isMine && showAvatar && <p style={{ margin: '0 0 2px 2px', fontSize: 10, fontWeight: 700, color }}>{msg.user.username ?? msg.user.nom}</p>}
                      {/* Bubble + time side by side */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flexDirection: isMine ? 'row-reverse' : 'row' }}>
                        {msg.type === 'POLL' && msg.poll ? (
                          <PollCard poll={msg.poll} currentUserId={currentUserId} isMine={isMine} onVote={handleVote} />
                        ) : msg.type === 'IMAGE' ? (
                          <img
                            src={toFileUrl(msg.contenu)}
                            alt={msg.fileName ?? 'image'}
                            onClick={() => setLightboxSrc(toFileUrl(msg.contenu))}
                            style={{ maxWidth: 220, maxHeight: 180, borderRadius: 10, display: 'block', cursor: 'zoom-in', border: '1px solid var(--border-color)' }}
                          />
                        ) : msg.type === 'FILE' ? (
                          <FileCard contenu={toFileUrl(msg.contenu)} fileName={msg.fileName ?? 'fichier'} isMine={isMine} />
                        ) : (
                          <div style={{ padding: '8px 12px', borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: isMine ? '#4F46E5' : 'var(--bg-icon)', color: isMine ? 'var(--bg-card)' : 'var(--text-primary)', fontSize: 13, fontWeight: 500, lineHeight: 1.45, wordBreak: 'break-word' }}>
                            {msg.contenu}
                          </div>
                        )}
                        <span className="msg-time" style={{ fontSize: 9.5, color: 'var(--text-faint)', fontWeight: 500, flexShrink: 0, paddingBottom: 1 }}>{formatTime(msg.createdAt)}</span>
                      </div>
                      {/* Read receipts */}
                      {isMine && msg.reads && msg.reads.length > 0 && (() => {
                        const lastIdx = messages.filter(m => m.user?.id === currentUserId).indexOf(msg);
                        const isLast = lastIdx === messages.filter(m => m.user?.id === currentUserId).length - 1;
                        if (!isLast) return null;
                        return (
                          <div style={{ display: 'flex', gap: 2, marginTop: 2, justifyContent: 'flex-end' }}>
                            {msg.reads.filter((r: any) => r.user.id !== currentUserId).slice(0, 5).map((r: any) => (
                              <div key={r.user.id} title={`Lu par @${r.user.username ?? r.user.nom}`} style={{ width: 14, height: 14, borderRadius: '50%', background: getColor(r.user.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: '#fff', overflow: 'hidden' }}>
                                {r.user.photo ? <img src={r.user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (r.user.username ?? r.user.nom)[0].toUpperCase()}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Poll form */}
        {showPollForm && <CreatePollForm onSubmit={handleCreatePoll} onCancel={() => setShowPollForm(false)} />}

        {/* Input */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setShowAttach(v => !v)}
              title="Joindre"
              style={{ width: 38, height: 38, borderRadius: 10, border: `1.5px solid ${showAttach ? '#4F46E5' : 'var(--border-color)'}`, background: showAttach ? 'var(--accent-soft)' : 'var(--bg-input)', color: showAttach ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 22, fontWeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
            >+</button>
            <AttachMenu
              open={showAttach}
              onClose={() => setShowAttach(false)}
              onPoll={() => { setShowPollForm(true); setShowAttach(false); }}
              onImage={handleAttachImage}
              onFile={handleAttachFile}
            />
          </div>
          <input
            ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Écrire un message…" maxLength={1000}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1.5px solid var(--border-color)', background: 'var(--bg-input)', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.15s' }}
            onFocus={e => (e.target.style.borderColor = '#4F46E5')}
            onBlur={e => (e.target.style.borderColor = 'var(--border-color)')}
          />
          <button onClick={handleSend} disabled={!input.trim() || sending}
            style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: input.trim() ? '#4F46E5' : 'var(--accent-soft)', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
            <svg width="16" height="16" fill="none" stroke={input.trim() ? 'var(--bg-card)' : '#A5B4FC'} strokeWidth={2} viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatPanel;
