import React from 'react';
import { useTheme } from '@store/ThemeContext';

const YELLOW = '#F5C518';

interface Props { myTasks: any[]; }

const Check = ({ done }: { done: boolean }) => (
  <div style={{
    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
    border: done ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
    background: done ? '#22C55E' : 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    {done && (
      <svg width={10} height={10} fill="none" stroke="#fff" strokeWidth={2.5} viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )}
  </div>
);

const HomeTasksPanel: React.FC<Props> = ({ myTasks }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const BG  = isDark ? '#0D1117' : '#13131F';
  const BG2 = isDark ? '#161B2C' : '#1E1E30';

  const done = myTasks.filter(t => t.statut === 'COMPLETEE').length;

  const sorted = [...myTasks]
    .sort((a, b) => {
      const da = a.dateDebut ? new Date(a.dateDebut).getTime() : Infinity;
      const db = b.dateDebut ? new Date(b.dateDebut).getTime() : Infinity;
      return da - db;
    })
    .slice(0, 5);

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return (
      d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) +
      ', ' +
      d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    );
  };

  return (
    <div style={{ background: BG, borderRadius: 18, padding: 20, color: '#FFFFFF', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>Mes Tâches</p>
        <span style={{ padding: '2px 10px', borderRadius: 99, background: BG2, fontSize: 11, fontWeight: 700, color: YELLOW }}>
          {done}/{myTasks.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {sorted.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', margin: '16px 0' }}>Aucune tâche assignée</p>
        )}
        {sorted.map(t => {
          const isDone = t.statut === 'COMPLETEE';
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px', borderRadius: 10, background: BG2 }}>
              <Check done={isDone} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0, fontSize: 12, fontWeight: 600,
                  color: isDone ? 'rgba(255,255,255,0.4)' : '#FFFFFF',
                  textDecoration: isDone ? 'line-through' : 'none',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {t.titre}
                </p>
                {t.dateDebut && (
                  <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>
                    {fmt(t.dateDebut)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomeTasksPanel;
