import React, { useState, useRef, useEffect } from 'react';
import type { User } from './calendarTypes';
import CalendarAvatar from './CalendarAvatar';

interface Props {
  users: User[];
  value: string;
  onChange: (id: string) => void;
  currentUserId?: string;
}

const CalendarUserFilter: React.FC<Props> = ({ users, value, onChange, currentUserId }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = users.find(u => u.id === value);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 10px 5px 6px', borderRadius: 10,
          border: '1px solid var(--border-color)', background: 'var(--bg-card)',
          cursor: 'pointer', fontSize: 12, fontWeight: 700,
          color: 'var(--text-primary)', minWidth: 160,
        }}
      >
        {selected
          ? <CalendarAvatar user={selected} size={24} />
          : <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-icon)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>👥</div>
        }
        <span style={{ flex: 1, textAlign: 'left' }}>
          {selected ? selected.nom : "Toute l'équipe"}
          {selected?.id === currentUserId && <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 4 }}>moi</span>}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
          background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-color)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)', minWidth: 200, overflow: 'hidden',
        }}>
          <button
            onClick={() => { onChange(''); setOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 14px', border: 'none', borderBottom: '1px solid var(--border-subtle)',
              background: value === '' ? 'var(--accent-soft)' : 'transparent', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, color: value === '' ? 'var(--accent)' : 'var(--text-primary)',
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: value === '' ? 'var(--accent)' : 'var(--bg-icon)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
              <span style={{ filter: value === '' ? 'brightness(10)' : 'none' }}>👥</span>
            </div>
            Toute l'équipe
          </button>

          {users.map(u => (
            <button
              key={u.id}
              onClick={() => { onChange(u.id); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '8px 14px', border: 'none', borderBottom: '1px solid var(--border-subtle)',
                background: value === u.id ? 'var(--accent-soft)' : 'transparent', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, color: value === u.id ? 'var(--accent)' : 'var(--text-sub)',
              }}
              onMouseEnter={e => { if (value !== u.id) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (value !== u.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <CalendarAvatar user={u} size={32} />
              <div style={{ textAlign: 'left' }}>
                <div>
                  @{u.username ?? u.nom}
                  {u.id === currentUserId && <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 4 }}>moi</span>}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>{u.role}</div>
              </div>
              {value === u.id && <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: 14 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarUserFilter;
