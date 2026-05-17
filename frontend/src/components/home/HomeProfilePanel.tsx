import React from 'react';

const ROLE_LABEL: Record<string, string> = {
  DSI: 'Directeur SI',
  RESPONSABLE: 'Chef de Projet',
  DEVELOPPEUR: 'Développeur',
  TECH_IT: 'Technicien IT',
};

interface Props { user: any; myTasks: any[]; projects: any[]; interventions: any[]; }

const SectionTitle: React.FC<{ label: string }> = ({ label }) => (
  <p style={{ margin: '0 0 5px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
    {label}
  </p>
);

const HomeProfilePanel: React.FC<Props> = ({ user, myTasks, projects, interventions }) => {
  const initials = (user?.username ?? '?').slice(0, 2).toUpperCase();
  const done = myTasks.filter(t => t.statut === 'COMPLETEE').length;
  const inProg = myTasks.filter(t => t.statut === 'EN_COURS').length;
  const todo = myTasks.filter(t => t.statut === 'TODO').length;
  const activeIntv = interventions.filter((i: any) => ['EN_COURS', 'EN_ATTENTE'].includes(i.statut));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>

      {/* ── Card 1 : Photo + identité ── */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
        <div style={{ width: '100%', height: 190, overflow: 'hidden', background: 'var(--bg-icon)' }}>
          {user?.photo
            ? <img src={user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #D4CFCA 0%, #BDB8B2 100%)' }}>
                <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: '#5A5550' }}>
                  {initials}
                </div>
              </div>
            )
          }
        </div>
        <div style={{ padding: '14px 16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{user?.username ?? '—'}</p>
            <p style={{ margin: '3px 0 0', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>{ROLE_LABEL[user?.role] ?? user?.role}</p>
          </div>
          <span style={{ padding: '5px 13px', borderRadius: 99, background: 'var(--bg-hover)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0, border: '1px solid var(--border-color)' }}>
            {myTasks.length} tâches
          </span>
        </div>
      </div>

      {/* ── Card 2 : Sections ── */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 20, boxShadow: 'var(--shadow-sm)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minHeight: 0, overflowY: 'auto' }}>

        {/* Mes tâches */}
        <div>
          <SectionTitle label="Mes tâches" />
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ v: todo, l: 'À faire', c: 'var(--text-muted)' }, { v: inProg, l: 'En cours', c: '#F59E0B' }, { v: done, l: 'Terminées', c: '#22C55E' }].map(s => (
              <div key={s.l} style={{ flex: 1, textAlign: 'center', background: 'var(--bg-hover)', borderRadius: 8, padding: '6px 4px' }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: s.c, lineHeight: 1 }}>{s.v}</p>
                <p style={{ margin: '2px 0 0', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border-subtle)' }} />

        {/* Mes projets */}
        <div>
          <SectionTitle label="Mes projets" />
          {projects.length === 0
            ? <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Aucun projet</p>
            : projects.map((p: any, i: number, arr: any[]) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366F1', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nom}</span>
              </div>
            ))
          }
        </div>

        <div style={{ height: 1, background: 'var(--border-subtle)' }} />

        {/* Interventions actives */}
        <div>
          <SectionTitle label="Mes interventions actives" />
          {activeIntv.length === 0
            ? <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Aucune intervention</p>
            : activeIntv.map((iv: any, i: number, arr: any[]) => (
              <div key={iv.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{iv.probleme}</span>
              </div>
            ))
          }
        </div>

      </div>
    </div>
  );
};

export default HomeProfilePanel;
