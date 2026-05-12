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
          border: '1px solid #EEF0F6', background: '#fff',
          cursor: 'pointer', fontSize: 12, fontWeight: 700,
          color: '#1A1D2E', minWidth: 160,
        }}
      >
        {selected
          ? <CalendarAvatar user={selected} size={24} />
          : <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#EEF0F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>👥</div>
        }
        <span style={{ flex: 1, textAlign: 'left' }}>
          {selected ? selected.nom : "Toute l'équipe"}
          {selected?.id === currentUserId && <span style={{ fontSize: 9, color: '#9CA3AF', marginLeft: 4 }}>moi</span>}
        </span>
        <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 4 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
          background: '#fff', borderRadius: 14, border: '1px solid #EEF0F6',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)', minWidth: 200, overflow: 'hidden',
        }}>
          <button
            onClick={() => { onChange(''); setOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 14px', border: 'none', borderBottom: '1px solid #F8FAFC',
              background: value === '' ? '#EEF2FF' : 'transparent', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, color: value === '' ? '#6366f1' : '#1A1D2E',
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: value === '' ? '#6366f1' : '#EEF0F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
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
                padding: '8px 14px', border: 'none', borderBottom: '1px solid #F8FAFC',
                background: value === u.id ? '#EEF2FF' : 'transparent', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, color: value === u.id ? '#6366f1' : '#374151',
              }}
              onMouseEnter={e => { if (value !== u.id) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
              onMouseLeave={e => { if (value !== u.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <CalendarAvatar user={u} size={32} />
              <div style={{ textAlign: 'left' }}>
                <div>
                  {u.nom}
                  {u.id === currentUserId && <span style={{ fontSize: 9, color: '#9CA3AF', marginLeft: 4 }}>moi</span>}
                </div>
                <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500 }}>{u.role}</div>
              </div>
              {value === u.id && <span style={{ marginLeft: 'auto', color: '#6366f1', fontSize: 14 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarUserFilter;
