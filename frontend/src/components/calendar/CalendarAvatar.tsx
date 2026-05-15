import React from 'react';

interface Props {
  user: { username?: string; nom: string; photo?: string };
  size?: number;
}

const CalendarAvatar: React.FC<Props> = ({ user, size = 28 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: 'var(--accent-soft)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
    border: '2px solid var(--bg-card)',
  }}>
    {user.photo
      ? <img src={user.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
      : <span style={{ fontSize: size * 0.38, fontWeight: 800, color: 'var(--accent)' }}>{(user.username ?? user.nom)[0].toUpperCase()}</span>
    }
  </div>
);

export default CalendarAvatar;
