import React from 'react';
import type { Task } from './calendarTypes';
import { DAY_NAMES, getDaysInMonth, getFirstDayOfMonth, toLocal } from './calendarTypes';
import CalendarTaskPill from './CalendarTaskPill';

interface Props {
  tasks: Task[];
  year: number;
  month: number;
  onTaskClick: (t: Task) => void;
  onDayClick?: (date: Date, tasks: Task[]) => void;
}

const CalendarMonthView: React.FC<Props> = ({ tasks, year, month, onTaskClick, onDayClick }) => {
  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const getTasksForDay = (day: number): Task[] => {
    const dayDate = new Date(year, month, day);
    return tasks.filter(t => {
      const s = t.dateDebut ? toLocal(t.dateDebut) : null;
      const e = t.dateFin   ? toLocal(t.dateFin)   : null;
      if (s && e) return dayDate >= s && dayDate <= e;
      if (s) return dayDate.getTime() === s.getTime();
      if (e) return dayDate.getTime() === e.getTime();
      return false;
    });
  };

  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EEF0F6', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #F1F5F9' }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ padding: '12px 8px', textAlign: 'center', fontSize: 10, fontWeight: 800, color: '#C4C9D4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {Array.from({ length: totalCells }, (_, i) => {
          const dayNum = i - firstDay + 1;
          const isValid = dayNum >= 1 && dayNum <= daysInMonth;
          const isToday = isValid && dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const dayTasks = isValid ? getTasksForDay(dayNum) : [];

          const cellDate = isValid ? new Date(year, month, dayNum) : null;

          return (
            <div
              key={i}
              onClick={() => { if (isValid && onDayClick && cellDate) onDayClick(cellDate, dayTasks); }}
              style={{
                minHeight: 100, padding: '8px 6px 6px',
                borderRight: (i + 1) % 7 !== 0 ? '1px solid #F8FAFC' : 'none',
                borderBottom: '1px solid #F8FAFC',
                background: isToday ? '#F8F9FF' : isValid ? '#fff' : '#FAFBFC',
                cursor: isValid && onDayClick ? 'pointer' : 'default',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (isValid && onDayClick) (e.currentTarget as HTMLElement).style.background = isToday ? '#F0F0FF' : '#FAFBFF'; }}
              onMouseLeave={e => { if (isValid && onDayClick) (e.currentTarget as HTMLElement).style.background = isToday ? '#F8F9FF' : '#fff'; }}
            >
              {isValid && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: isToday ? 800 : 500,
                      color: isToday ? '#fff' : '#6B7280',
                      background: isToday ? '#303292ff' : 'transparent',
                    }}>
                      {dayNum}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayTasks.slice(0, 3).map(t => (
                      <CalendarTaskPill key={t.id} task={t} onClick={() => onTaskClick(t)} />
                    ))}
                    {dayTasks.length > 3 && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', paddingLeft: 4 }}>
                        +{dayTasks.length - 3} autres
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

export default CalendarMonthView;
