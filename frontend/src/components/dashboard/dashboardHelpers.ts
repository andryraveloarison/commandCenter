import type { Period } from './dashboardTypes';

export const getPeriodRange = (period: Period, cs: string, ce: string): [Date, Date] | null => {
  if (period === 'tout') return null;
  if (period === 'custom') return cs && ce ? [new Date(cs), new Date(ce + 'T23:59:59')] : null;
  const now = new Date();
  const start = new Date();
  if (period === 'semaine') {
    const d = start.getDay();
    start.setDate(start.getDate() - (d === 0 ? 6 : d - 1));
    start.setHours(0, 0, 0, 0);
  } else if (period === 'mois') {
    start.setDate(1); start.setHours(0, 0, 0, 0);
  } else if (period === 'annee') {
    start.setMonth(0, 1); start.setHours(0, 0, 0, 0);
  }
  return [start, now];
};

export const filterByRange = (items: any[], key: string, range: [Date, Date] | null) => {
  if (!range) return items;
  const [s, e] = range;
  return items.filter(item => { const d = new Date(item[key]); return d >= s && d <= e; });
};

const mkPoint = (label: string, chunk: any[]) => ({
  label,
  total:     chunk.length,
  resolu:    chunk.filter((i: any) => i.statut === 'RESOLU').length,
  enCours:   chunk.filter((i: any) => i.statut === 'EN_COURS').length,
  enAttente: chunk.filter((i: any) => i.statut === 'EN_ATTENTE').length,
});

export const buildEvolution = (items: any[], period: Period, cs: string, ce: string) => {
  const now = new Date();
  const inRange = (iso: string, s: Date, e: Date) => { const d = new Date(iso); return d >= s && d < e; };

  if (period === 'semaine') {
    const mon = new Date(now);
    mon.setDate(mon.getDate() - (mon.getDay() === 0 ? 6 : mon.getDay() - 1));
    mon.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const s = new Date(mon); s.setDate(mon.getDate() + i);
      const e = new Date(s);   e.setDate(s.getDate() + 1);
      return mkPoint(s.toLocaleDateString('fr-FR', { weekday: 'short' }), items.filter((iv: any) => inRange(iv.createdAt, s, e)));
    });
  }

  if (period === 'mois') {
    const yr = now.getFullYear(), mo = now.getMonth();
    const daysInMonth = new Date(yr, mo + 1, 0).getDate();
    const weeks: any[] = [];
    for (let w = 0; w < 6; w++) {
      const s = new Date(yr, mo, 1 + w * 7);
      if (s.getDate() > daysInMonth || s.getMonth() !== mo) break;
      const e = new Date(yr, mo, Math.min(1 + (w + 1) * 7, daysInMonth + 1));
      weeks.push(mkPoint(`S${w + 1}`, items.filter((iv: any) => inRange(iv.createdAt, s, e))));
    }
    return weeks;
  }

  if (period === 'custom' && cs && ce) {
    const s0 = new Date(cs), e0 = new Date(ce + 'T23:59:59');
    const days = Math.round((e0.getTime() - s0.getTime()) / 86400000);
    if (days <= 0) return [];
    if (days <= 60) {
      return Array.from({ length: days + 1 }, (_, i) => {
        const s = new Date(s0); s.setDate(s0.getDate() + i);
        const e = new Date(s);  e.setDate(s.getDate() + 1);
        if (s > e0) return null;
        return mkPoint(s.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }), items.filter((iv: any) => inRange(iv.createdAt, s, e)));
      }).filter(Boolean) as any[];
    }
    const months: any[] = [];
    const cur = new Date(s0.getFullYear(), s0.getMonth(), 1);
    while (cur <= e0) {
      const nm = new Date(cur); nm.setMonth(cur.getMonth() + 1);
      months.push(mkPoint(cur.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), items.filter((iv: any) => inRange(iv.createdAt, cur, nm))));
      cur.setMonth(cur.getMonth() + 1);
    }
    return months;
  }

  // annee / tout → 12 months
  return Array.from({ length: 12 }, (_, i) => {
    const ms = period === 'annee'
      ? new Date(now.getFullYear(), i, 1)
      : new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const me = new Date(ms); me.setMonth(ms.getMonth() + 1);
    return mkPoint(ms.toLocaleDateString('fr-FR', { month: 'short' }), items.filter((iv: any) => inRange(iv.createdAt, ms, me)));
  });
};
