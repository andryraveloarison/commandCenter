import React from 'react';
import { useNavigate } from 'react-router-dom';

const YELLOW = '#F5C518';
const DAYS   = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MS_DAY = 86_400_000;

const STATUS_COLOR: Record<string, { bar: string; text: string }> = {
  TODO:      { bar: 'var(--bg-icon)', text: 'var(--text-sub)' },
  EN_COURS:  { bar: YELLOW,           text: '#1A1D2E'          },
  EN_REVIEW: { bar: '#8B5CF6',        text: '#fff'             },
  COMPLETEE: { bar: '#22C55E',        text: '#fff'             },
  BLOQUEE:   { bar: '#EF4444',        text: '#fff'             },
};

interface Props { myTasks: any[]; }

const HomeGanttChart: React.FC<Props> = ({ myTasks }) => {
  const navigate = useNavigate();

  const today = new Date();
  const weekStart = (() => {
    const d = new Date(today);
    const dow = d.getDay();
    d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  const weekEnd = new Date(weekStart.getTime() + 7 * MS_DAY);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d;
  });

  const tasks = myTasks.filter(t => {
    if (!t.dateDebut) return false;
    const s = new Date(t.dateDebut).getTime();
    const e = t.dateFin ? new Date(t.dateFin).getTime() + MS_DAY : s + MS_DAY;
    return s < weekEnd.getTime() && e > weekStart.getTime();
  });

  const bar = (t: any) => {
    const rawS = new Date(t.dateDebut).getTime();
    const rawE = t.dateFin ? new Date(t.dateFin).getTime() + MS_DAY : rawS + MS_DAY;
    const cs = Math.max(rawS, weekStart.getTime());
    const ce = Math.min(rawE, weekEnd.getTime());
    const startDay = Math.floor((cs - weekStart.getTime()) / MS_DAY);
    const endDay   = Math.ceil((ce  - weekStart.getTime()) / MS_DAY);
    return { left: (startDay / 7) * 100, width: (Math.max(endDay - startDay, 1) / 7) * 100 };
  };

  const todayIdx = Math.floor((today.getTime() - weekStart.getTime()) / MS_DAY);

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 18, padding: '18px 20px 14px', boxShadow: 'var(--shadow-sm)', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
          Gantt &mdash; semaine du {weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
        </p>
        <button onClick={() => navigate('/tasks')} style={{ fontSize: 11, fontWeight: 600, color: '#6366F1', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
          Voir toutes →
        </button>
      </div>

      <div style={{ display: 'flex', gap: 0, flex: 1 }}>

        {/* Task-name column */}
        <div style={{ width: 140, flexShrink: 0, paddingRight: 10 }}>
          <div style={{ height: 36 }} />
          {tasks.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: '16px 0' }}>Aucune tâche cette semaine</p>
          )}
          {tasks.map(t => (
            <div key={t.id} style={{ height: 44, display: 'flex', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.titre}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', height: 36, marginBottom: 0 }}>
            {days.map((d, i) => {
              const isToday = i === todayIdx;
              return (
                <div key={i} style={{ textAlign: 'center', paddingBottom: 4 }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: isToday ? YELLOW : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{DAYS[i]}</p>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', margin: '1px auto 0', background: isToday ? YELLOW : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: isToday ? 800 : 600, color: isToday ? '#1A1D2E' : 'var(--text-sub)' }}>{d.getDate()}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rows */}
          <div style={{ position: 'relative' }}>
            {todayIdx >= 0 && todayIdx < 7 && (
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(todayIdx / 7) * 100}%`, width: `${(1 / 7) * 100}%`, background: 'rgba(245,197,24,0.08)', borderRadius: 4, pointerEvents: 'none', zIndex: 0 }} />
            )}

            {tasks.length === 0 && <div style={{ height: 60 }} />}

            {tasks.map(t => {
              const { left, width } = bar(t);
              const cfg = STATUS_COLOR[t.statut] ?? STATUS_COLOR.TODO;
              return (
                <div key={t.id} style={{ height: 44, position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/tasks')}>
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', pointerEvents: 'none' }}>
                    {days.map((_, di) => <div key={di} style={{ borderLeft: di > 0 ? '1px solid var(--border-subtle)' : 'none' }} />)}
                  </div>
                  <div style={{
                    position: 'absolute', zIndex: 1,
                    left: `${left}%`, width: `${width}%`,
                    top: '50%', transform: 'translateY(-50%)',
                    height: 26, borderRadius: 6,
                    background: cfg.bar,
                    display: 'flex', alignItems: 'center', paddingLeft: 8, overflow: 'hidden',
                  }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: cfg.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.titre}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginTop: 'auto', paddingTop: 14, flexWrap: 'wrap' }}>
        {Object.entries({ 'À faire': 'var(--bg-icon)', 'En cours': YELLOW, 'En review': '#8B5CF6', 'Terminée': '#22C55E', 'Bloquée': '#EF4444' }).map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeGanttChart;
