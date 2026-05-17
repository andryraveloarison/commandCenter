import React from 'react';
import { Link } from 'react-router-dom';

const ROLE_LABEL: Record<string, string> = {
  DSI: 'Directeur SI',
  RESPONSABLE: 'Responsable Projet',
  DEVELOPPEUR: 'Développeur',
  TECH_IT: 'Technicien IT',
};

const STATUS_CFG: Record<string, { color: string; label: string }> = {
  ACTIF:   { color: '#22C55E', label: 'Actif' },
  INACTIF: { color: '#6B7280', label: 'Inactif' },
  OCCUPE:  { color: '#F59E0B', label: 'Occupé' },
};

interface Props {
  user: any;
  myTasks: any[];
}

const HomeProfileCard: React.FC<Props> = ({ user, myTasks }) => {
  const done    = myTasks.filter(t => t.statut === 'COMPLETEE').length;
  const inProg  = myTasks.filter(t => t.statut === 'EN_COURS').length;
  const todo    = myTasks.filter(t => t.statut === 'TODO').length;
  const total   = myTasks.length;
  const rate    = total > 0 ? Math.round((done / total) * 100) : 0;
  const status  = STATUS_CFG[user?.statut] ?? STATUS_CFG.ACTIF;
  const initials = (user?.username ?? '?').slice(0, 2).toUpperCase();

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Avatar + identity */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
        <div style={{ position: 'relative' }}>
          {user?.photo
            ? <img src={user.photo} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)' }} />
            : <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-soft)', border: '3px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: 'var(--accent)' }}>{initials}</div>
          }
          <span style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: status.color, border: '2px solid var(--bg-card)' }} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{user?.username ?? '—'}</p>
          <p style={{ margin: '3px 0 0', fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>{ROLE_LABEL[user?.role] ?? user?.role}</p>
          <p style={{ margin: '3px 0 0', fontSize: 10, color: 'var(--text-muted)' }}>{user?.email}</p>
        </div>
      </div>

      {/* Completion rate */}
      <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Taux de complétion</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent)', fontFamily: 'Montserrat, sans-serif' }}>{rate}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${rate}%`, background: rate === 100 ? '#22C55E' : 'var(--accent)', borderRadius: 4, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Task breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'À faire',   value: todo,   color: '#6B7280' },
          { label: 'En cours',  value: inProg,  color: '#F59E0B' },
          { label: 'Terminées', value: done,    color: '#22C55E' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: s.color, fontFamily: 'Montserrat, sans-serif', lineHeight: 1 }}>{s.value}</p>
            <p style={{ margin: '4px 0 0', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <Link to="/settings" style={{ display: 'block', textAlign: 'center', padding: '9px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-elevated)', color: 'var(--text-sub)', fontSize: 11, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Mon profil
      </Link>
    </div>
  );
};

export default HomeProfileCard;
