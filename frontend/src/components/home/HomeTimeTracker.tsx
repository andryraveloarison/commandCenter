import React from 'react';

const YELLOW = '#F5C518';
const R = 44;
const CIRC = 2 * Math.PI * R;

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const HomeTimeTracker: React.FC = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  const pct = Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100);
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / 86_400_000);
  const offset = CIRC * (1 - pct / 100);

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 18, padding: 20, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Écoulement annuel</p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 110, height: 110 }}>
          <svg width={110} height={110} viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={55} cy={55} r={R} fill="none" stroke="var(--bg-input)" strokeWidth={10} />
            <circle cx={55} cy={55} r={R} fill="none" stroke={YELLOW} strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'Montserrat, sans-serif', lineHeight: 1 }}>{pct}%</p>
            <p style={{ margin: '3px 0 0', fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{now.getFullYear()}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
            {MONTHS[now.getMonth()]} — {now.getFullYear()}
          </p>
          <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>
            {daysLeft} jour{daysLeft > 1 ? 's' : ''} restants
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeTimeTracker;
