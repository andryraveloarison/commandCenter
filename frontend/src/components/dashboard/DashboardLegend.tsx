import React from 'react';

interface Props {
  items: { label: string; color: string }[];
}

const DashboardLegend: React.FC<Props> = ({ items }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
    {items.map((it, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: it.color }} />
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{it.label}</span>
      </div>
    ))}
  </div>
);

export default DashboardLegend;
