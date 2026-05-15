import React from 'react';
import type { LocalIntervention } from './calendarTypes';
import { DAY_NAMES, INTERVENTION_STATUS, getDaysInMonth, getFirstDayOfMonth, isSameDay } from './calendarTypes';

interface Props {
  interventions: LocalIntervention[];
  year: number;
  month: number;
  onInterventionClick: (iv: LocalIntervention) => void;
}

const CalendarInterventionView: React.FC<Props> = ({ interventions, year, month, onInterventionClick }) => {
  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const getForDay = (day: number) =>
    interventions.filter(i => isSameDay(i.dateIntervention || i.createdAt, year, month, day));

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-subtle)' }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ padding: '12px 8px', textAlign: 'center', fontSize: 10, fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {Array.from({ length: totalCells }, (_, i) => {
          const dayNum = i - firstDay + 1;
          const isValid = dayNum >= 1 && dayNum <= daysInMonth;
          const isToday = isValid && dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const dayIvs = isValid ? getForDay(dayNum) : [];

          return (
            <div key={i} style={{
              minHeight: 100, padding: '8px 6px 6px',
              borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border-subtle)' : 'none',
              borderBottom: '1px solid var(--border-subtle)',
              background: isToday ? 'var(--bg-active)' : isValid ? 'var(--bg-card)' : 'var(--bg-app)',
            }}>
              {isValid && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: isToday ? 800 : 500,
                      color: isToday ? 'var(--bg-card)' : 'var(--text-sub)',
                      background: isToday ? '#303292ff' : 'transparent',
                    }}>
                      {dayNum}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayIvs.slice(0, 3).map(iv => {
                      const cfg = INTERVENTION_STATUS[iv.statut] || INTERVENTION_STATUS.EN_ATTENTE;
                      return (
                        <button
                          key={iv.id}
                          onClick={e => { e.stopPropagation(); onInterventionClick(iv); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            background: cfg.bg, borderRadius: '0 6px 6px 0',
                            padding: '2px 6px', width: '100%', cursor: 'pointer',
                            border: 'none', borderLeftColor: cfg.color,
                            borderLeftStyle: 'solid', borderLeftWidth: 3,
                          }}
                        >
                          {iv.intervenants?.[0]?.user.photo
                            ? <img src={iv.intervenants[0].user.photo} style={{ width: 14, height: 14, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} alt="" />
                            : <span style={{ fontSize: 9, fontWeight: 800, color: cfg.color, flexShrink: 0 }}>{iv.intervenants?.[0]?.user.username?.[0]?.toUpperCase() || '?'}</span>
                          }
                          <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {iv.probleme}
                          </span>
                        </button>
                      );
                    })}
                    {dayIvs.length > 3 && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', paddingLeft: 4 }}>
                        +{dayIvs.length - 3} autres
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarInterventionView;
