import React from 'react';

const YELLOW = '#F5C518';
const DAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

interface Props { tasksByDay: number[]; myTasks: any[]; }

const HomeProgressCard: React.FC<Props> = ({ tasksByDay, myTasks }) => {
  const todayIdx = new Date().getDay();
  const maxVal   = Math.max(...tasksByDay, 1);
  const todayCount = tasksByDay[todayIdx];
  const inProg  = myTasks.filter(t => t.statut === 'EN_COURS').length;
  const weeklyTotal = tasksByDay.reduce((s, v) => s + v, 0);

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 18, padding: 20, boxShadow: 'var(--shadow-sm)', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Progression</p>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 16 }}>
        <div>
          <p style={{ margin: 0, fontSize: 38, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'Montserrat, sans-serif' }}>{todayCount}</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-sub)' }}>
            tâche{todayCount !== 1 ? 's' : ''}{' '}
            <span style={{ color: 'var(--text-muted)' }}>aujourd'hui</span>
          </p>
        </div>
        {inProg > 0 && (
          <span style={{ marginBottom: 4, padding: '3px 9px', borderRadius: 99, background: '#FFF8DC', color: '#B88A00', fontSize: 10, fontWeight: 700, border: `1px solid ${YELLOW}50` }}>
            {inProg} en cours
          </span>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 5, minHeight: 54 }}>
        {tasksByDay.map((v, i) => {
          const barH = Math.max((v / maxVal) * 54, 4);
          const isToday = i === todayIdx;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                <div style={{
                  width: '100%', height: barH,
                  background: isToday ? YELLOW : (v > 0 ? 'var(--accent-soft)' : 'var(--bg-input)'),
                  borderRadius: 4,
                  transition: 'height 0.4s ease',
                }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: isToday ? 700 : 500, color: isToday ? YELLOW : 'var(--text-muted)' }}>
                {DAYS[i]}
              </span>
            </div>
          );
        })}
      </div>

      {weeklyTotal > 0 && (
        <p style={{ margin: '8px 0 0', fontSize: 10, color: 'var(--text-muted)', textAlign: 'right' }}>
          {weeklyTotal} cette semaine
        </p>
      )}
    </div>
  );
};

export default HomeProgressCard;
