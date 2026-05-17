import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const YELLOW = '#F5C518';
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAYS   = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const HOURS  = [8, 9, 10, 11];

interface Props { myTasks: any[]; }

const HomeCalendarWidget: React.FC<Props> = ({ myTasks }) => {
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);

  const startOfWeek = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [offset]);

  const days = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    }), [startOfWeek]);

  const taskMap = useMemo(() => {
    const m: Record<string, any[]> = {};
    myTasks.forEach(t => {
      if (!t.dateDebut) return;
      const d = new Date(t.dateDebut);
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
      (m[k] = m[k] || []).push(t);
    });
    return m;
  }, [myTasks]);

  const tasksAt = (day: Date, hour: number) =>
    taskMap[`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}-${hour}`] ?? [];

  const today = new Date();
  const isToday = (d: Date) =>
    d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

  const mid = days[2];
  const prevM = MONTHS[(mid.getMonth() - 1 + 12) % 12];
  const nextM = MONTHS[(mid.getMonth() + 1) % 12];

  return (
    <div style={{ background: '#fff', borderRadius: 18, padding: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => setOffset(v => v - 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2 }}>
            <svg width={15} height={15} fill="none" stroke="#9CA3AF" strokeWidth={2} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span style={{ fontSize: 11.5, color: '#9CA3AF', fontWeight: 500 }}>{prevM}</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1D2E' }}>{MONTHS[mid.getMonth()]} {mid.getFullYear()}</span>
          <span style={{ fontSize: 11.5, color: '#9CA3AF', fontWeight: 500 }}>{nextM}</span>
          <button onClick={() => setOffset(v => v + 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2 }}>
            <svg width={15} height={15} fill="none" stroke="#9CA3AF" strokeWidth={2} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <button onClick={() => navigate('/calendar')} style={{ fontSize: 11, fontWeight: 600, color: '#6366F1', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
          Voir tout →
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(6, 1fr)' }}>
        {/* Day headers */}
        <div />
        {days.map((d, i) => {
          const td = isToday(d);
          return (
            <div key={i} style={{ textAlign: 'center', paddingBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: td ? YELLOW : '#9CA3AF', textTransform: 'uppercase' }}>
                {DAYS[d.getDay()]}
              </p>
              <div style={{ width: 26, height: 26, borderRadius: '50%', margin: '3px auto 0', background: td ? YELLOW : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: td ? 800 : 600, color: td ? '#1A1D2E' : '#374151' }}>
                  {d.getDate()}
                </p>
              </div>
            </div>
          );
        })}

        {/* Hour rows */}
        {HOURS.map(h => (
          <React.Fragment key={h}>
            <div style={{ paddingTop: 10, paddingRight: 8, textAlign: 'right', borderTop: '1px solid #F3F4F6' }}>
              <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500 }}>{h}:00 {h < 12 ? 'am' : 'pm'}</span>
            </div>
            {days.map((d, di) => {
              const tasks = tasksAt(d, h);
              return (
                <div key={di} style={{ borderTop: '1px solid #F3F4F6', padding: '4px 3px', minHeight: 46 }}>
                  {tasks.slice(0, 1).map((t: any) => (
                    <div key={t.id}
                      onClick={() => navigate('/tasks')}
                      style={{ background: t.statut === 'COMPLETEE' ? '#F0FDF4' : '#FFFBEB', border: `1px solid ${t.statut === 'COMPLETEE' ? '#BBF7D0' : YELLOW + '50'}`, borderRadius: 6, padding: '3px 6px', cursor: 'pointer' }}
                    >
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: t.statut === 'COMPLETEE' ? '#16A34A' : '#92400E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.titre}
                      </p>
                      {t.projet?.nom && (
                        <p style={{ margin: '1px 0 0', fontSize: 9, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.projet.nom}
                        </p>
                      )}
                    </div>
                  ))}
                  {tasks.length > 1 && <p style={{ margin: '2px 0 0', fontSize: 9, color: '#9CA3AF' }}>+{tasks.length - 1}</p>}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default HomeCalendarWidget;
