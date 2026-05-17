import React from 'react';

const YELLOW = '#F5C518';

interface KPI { label: string; pct: number; color: string; }
interface StatItem { value: number; label: string; }
interface Props { username: string; role?: string; kpis: KPI[]; stats: StatItem[]; }

const getGreeting = (role?: string): string => {
  const h = new Date().getHours();
  const rank = role === 'DSI' ? 'Colonel' : 'Soldat';
  if (h >= 5 && h < 12) return `Bonjour ${rank}`;
  if (h >= 12 && h < 18) return `Bonne après-midi ${rank}`;
  return `Bonsoir ${rank}`;
};

const HomeHeader: React.FC<Props> = ({ username, role, kpis, stats }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32, marginBottom: 22 }}>
    <div>
      <h1 style={{ margin: '0 0 14px', fontSize: 34, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Montserrat, sans-serif', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {getGreeting(role)}{' '}
        <span style={{ color: YELLOW }}>{username}</span>
      </h1>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {kpis.map(k => (
          <div key={k.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: '3px 11px', borderRadius: 20, background: k.color, color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {k.pct}%
            </div>
            <div style={{ width: 44, height: 3, background: 'var(--border-color)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${k.pct}%`, background: k.color, borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-sub)', whiteSpace: 'nowrap' }}>{k.label}</span>
          </div>
        ))}
      </div>
    </div>

    <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexShrink: 0 }}>
      {stats.map((s, i) => (
        <React.Fragment key={s.label}>
          {i > 0 && <div style={{ width: 1, height: 42, background: 'var(--border-color)' }} />}
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 30, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'Montserrat, sans-serif' }}>
              {s.value}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        </React.Fragment>
      ))}
    </div>
  </div>
);

export default HomeHeader;
