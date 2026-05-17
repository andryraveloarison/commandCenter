import React, { useState, useEffect } from 'react';

const YELLOW = '#F5C518';
const R = 44;
const CIRC = 2 * Math.PI * R;

const HomeTimeTracker: React.FC = () => {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  const display = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  const offset = CIRC * (1 - Math.min(seconds / 28800, 1));

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 18, padding: 20, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Suivi du temps</p>
        <svg width={14} height={14} fill="none" stroke="var(--text-muted)" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 110, height: 110 }}>
          <svg width={110} height={110} viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={55} cy={55} r={R} fill="none" stroke="var(--bg-input)" strokeWidth={10} />
            <circle cx={55} cy={55} r={R} fill="none" stroke={YELLOW} strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'Montserrat, sans-serif', lineHeight: 1 }}>{display}</p>
            <p style={{ margin: '3px 0 0', fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Temps actif</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setRunning(v => !v)}
            style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: running ? YELLOW : 'var(--bg-input)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {running
              ? <svg width={11} height={11} fill="#1A1D2E" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              : <svg width={11} height={11} fill="var(--text-sub)" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            }
          </button>
          <button
            onClick={() => { setSeconds(0); setRunning(false); }}
            style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width={11} height={11} fill="none" stroke="var(--text-muted)" strokeWidth={2} viewBox="0 0 24 24">
              <polyline points="1 4 1 10 7 10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.51 15a9 9 0 102.13-9.36L1 10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-color)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={11} height={11} fill="none" stroke="var(--text-muted)" strokeWidth={1.6} viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTimeTracker;
