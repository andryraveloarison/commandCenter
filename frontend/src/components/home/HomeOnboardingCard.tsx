import React from 'react';

const YELLOW = '#F5C518';

interface Props { projects: any[]; }

const HomeOnboardingCard: React.FC<Props> = ({ projects }) => {
  const total    = projects.length || 1;
  const done     = projects.filter((p: any) => p.statut === 'TERMINE').length;
  const inProg   = projects.filter((p: any) => p.statut === 'EN_COURS').length;
  const critique = projects.filter((p: any) => p.statut === 'CRITIQUE').length;
  const waiting  = projects.filter((p: any) => p.statut === 'PREPARATION').length;

  const pDone    = Math.round((done    / total) * 100);
  const pInProg  = Math.round((inProg  / total) * 100);
  const pCrit    = Math.round((critique / total) * 100);
  const pWaiting = Math.round((waiting / total) * 100);

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 18, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Avancement</p>
        <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'Montserrat, sans-serif' }}>{pDone}%</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: YELLOW }}>{pInProg}%</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444' }}>{pCrit}%</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{pWaiting}%</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#22C55E' }}>{pDone}%</span>
      </div>

      <div style={{ height: 10, borderRadius: 6, display: 'flex', overflow: 'hidden', background: 'var(--bg-input)', gap: 2 }}>
        {pInProg  > 0 && <div style={{ width: `${pInProg}%`,  background: YELLOW,    borderRadius: 3 }} />}
        {pCrit    > 0 && <div style={{ width: `${pCrit}%`,    background: '#EF4444', borderRadius: 3 }} />}
        {pWaiting > 0 && <div style={{ width: `${pWaiting}%`, background: 'var(--text-muted)', borderRadius: 3 }} />}
        {pDone    > 0 && <div style={{ width: `${pDone}%`,    background: '#22C55E', borderRadius: 3 }} />}
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
        {[
          { label: 'En cours',   color: YELLOW,     count: inProg   },
          { label: 'Critique',   color: '#EF4444',  count: critique },
          { label: 'En attente', color: '#9CA3AF',  count: waiting  },
          { label: 'Terminés',   color: '#22C55E',  count: done     },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 20, background: s.color + '20' }}>
            <div style={{ width: 7, height: 7, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 10.5, color: 'var(--text-sub)', fontWeight: 600 }}>{s.label} ({s.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeOnboardingCard;
