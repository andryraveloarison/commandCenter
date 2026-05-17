import React from 'react';
import { Link } from 'react-router-dom';

const STATUS_CFG: Record<string, { label: string; bg: string; color: string }> = {
  TODO:      { label: 'À faire',    bg: 'rgba(107,114,128,0.12)', color: '#6B7280' },
  EN_COURS:  { label: 'En cours',   bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B' },
  EN_REVIEW: { label: 'En review',  bg: 'rgba(139,92,246,0.12)',  color: '#8B5CF6' },
  COMPLETEE: { label: 'Terminée',   bg: 'rgba(34,197,94,0.12)',   color: '#22C55E' },
  BLOQUEE:   { label: 'Bloquée',    bg: 'rgba(239,68,68,0.12)',   color: '#EF4444' },
};

interface Props {
  myTasks: any[];
}

const HomeMyTasks: React.FC<Props> = ({ myTasks }) => {
  const recent = [...myTasks]
    .sort((a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime())
    .slice(0, 7);

  const active = myTasks.filter(t => t.statut === 'EN_COURS');
  const avgProg = active.length > 0
    ? Math.round(active.reduce((s, t) => s + (t.progression ?? 0), 0) / active.length)
    : 0;

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Mes tâches</p>
          <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'Montserrat, sans-serif' }}>{myTasks.length} tâche{myTasks.length !== 1 ? 's' : ''}</p>
        </div>
        {active.length > 0 && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Progression moy.</p>
            <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 900, color: 'var(--accent)', fontFamily: 'Montserrat, sans-serif' }}>{avgProg}%</p>
          </div>
        )}
      </div>

      {/* Progress bar for active tasks */}
      {active.length > 0 && (
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sub)' }}>{active.length} tâche{active.length !== 1 ? 's' : ''} en cours</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{avgProg}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${avgProg}%`, background: 'var(--accent)', borderRadius: 4, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {recent.length === 0 && (
          <p style={{ margin: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>Aucune tâche assignée</p>
        )}
        {recent.map(t => {
          const s = STATUS_CFG[t.statut] ?? STATUS_CFG.TODO;
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <p style={{ margin: 0, flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.titre}</p>
              {t.dateDebut && (
                <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {new Date(t.dateDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                </span>
              )}
              <span style={{ flexShrink: 0, padding: '2px 8px', borderRadius: 6, background: s.bg, color: s.color, fontSize: 9.5, fontWeight: 700 }}>{s.label}</span>
            </div>
          );
        })}
      </div>

      <Link to="/tasks" style={{ display: 'block', textAlign: 'center', padding: '9px', borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 11, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Voir toutes mes tâches →
      </Link>
    </div>
  );
};

export default HomeMyTasks;
