import React from 'react';
import { Link } from 'react-router-dom';

const QUICK_LINKS = [
  { label: 'Tableau de bord', to: '/dashboard', color: '#6366F1' },
  { label: 'Projets',         to: '/projects',  color: '#3B82F6' },
  { label: 'Calendrier',      to: '/calendar',  color: '#8B5CF6' },
  { label: 'War Room',        to: '/war-room',  color: '#EF4444' },
  { label: 'Messages',        to: '/messages',  color: '#10B981' },
];

const INTERV_COLOR: Record<string, { color: string; label: string }> = {
  EN_ATTENTE: { color: '#F59E0B', label: 'En attente' },
  EN_COURS:   { color: '#3B82F6', label: 'En cours' },
  RESOLU:     { color: '#22C55E', label: 'Résolu' },
  ANNULE:     { color: '#6B7280', label: 'Annulé' },
};

interface Props {
  upcomingTasks: any[];
  interventions: any[];
}

const HomeActivity: React.FC<Props> = ({ upcomingTasks, interventions }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

    {/* Upcoming tasks this week */}
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: 20, flex: 1 }}>
      <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Cette semaine</p>
      {upcomingTasks.length === 0 ? (
        <p style={{ margin: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>Aucune tâche planifiée</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {upcomingTasks.slice(0, 4).map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 34, textAlign: 'center', flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: 'var(--accent)', fontFamily: 'Montserrat, sans-serif', lineHeight: 1 }}>
                  {new Date(t.dateDebut).getDate()}
                </p>
                <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {new Date(t.dateDebut).toLocaleDateString('fr-FR', { weekday: 'short' })}
                </p>
              </div>
              <div style={{ width: 1, height: 28, background: 'var(--border-subtle)', flexShrink: 0 }} />
              <p style={{ margin: 0, flex: 1, fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.titre}</p>
            </div>
          ))}
        </div>
      )}
      <Link to="/calendar" style={{ display: 'block', marginTop: 12, textAlign: 'center', padding: '8px', borderRadius: 10, background: 'var(--bg-elevated)', color: 'var(--text-sub)', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
        Ouvrir le calendrier →
      </Link>
    </div>

    {/* Active interventions */}
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Interventions actives</p>
        <span style={{ fontSize: 16, fontWeight: 900, color: '#F59E0B', fontFamily: 'Montserrat, sans-serif' }}>{interventions.length}</span>
      </div>
      {interventions.length === 0 ? (
        <p style={{ margin: '8px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>Aucune intervention active</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {interventions.slice(0, 3).map(iv => {
            const cfg = INTERV_COLOR[iv.statut] ?? INTERV_COLOR.EN_ATTENTE;
            return (
              <div key={iv.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 9, background: 'var(--bg-elevated)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                <p style={{ margin: 0, flex: 1, fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{iv.probleme}</p>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      )}
      <Link to="/interventions" style={{ display: 'block', marginTop: 10, textAlign: 'center', padding: '8px', borderRadius: 10, background: 'var(--bg-elevated)', color: 'var(--text-sub)', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
        Voir les interventions →
      </Link>
    </div>

    {/* Quick links */}
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: 20 }}>
      <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Accès rapide</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {QUICK_LINKS.map(l => (
          <Link key={l.to} to={l.to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, background: 'var(--bg-elevated)', textDecoration: 'none', border: '1px solid var(--border-subtle)', transition: 'border-color 0.15s' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{l.label}</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>→</span>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default HomeActivity;
