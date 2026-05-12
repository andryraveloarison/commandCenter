import React from 'react';
import type { Period } from './dashboardTypes';
import { PERIOD_OPTIONS, inp } from './dashboardTypes';

interface Props {
  period: Period;
  setPeriod: (p: Period) => void;
  customStart: string;
  setCustomStart: (s: string) => void;
  customEnd: string;
  setCustomEnd: (s: string) => void;
  range: [Date, Date] | null;
}

const DashboardPeriodFilter: React.FC<Props> = ({ period, setPeriod, customStart, setCustomStart, customEnd, setCustomEnd, range }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'end', flexDirection: 'row-reverse' }}>
    <span style={{ fontSize: 10, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.12em', flexShrink: 0 }}>
      Période
    </span>
    <select
      value={period}
      onChange={e => setPeriod(e.target.value as Period)}
      style={{ padding: '9px 12px', borderRadius: 10, border: '1.5px solid #EEF0F6', background: '#F8FAFC', fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#374151', cursor: 'pointer', outline: 'none' }}
    >
      {PERIOD_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {period === 'custom' && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={inp} />
        <span style={{ color: '#9CA3AF', fontWeight: 700, fontSize: 13 }}>→</span>
        <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={inp} />
      </div>
    )}
    {range && (
      <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#C4C9D4', fontFamily: 'monospace' }}>
        {range[0].toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })} → {range[1].toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
      </span>
    )}
  </div>
);

export default DashboardPeriodFilter;
