import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { TOOLTIP_STYLE } from './dashboardTypes';
import DashboardSectionHeader from './DashboardSectionHeader';
import DashboardDonutLabel from './DashboardDonutLabel';
import DashboardLegend from './DashboardLegend';
import DashboardEmpty from './DashboardEmpty';

interface DonutStat {
  label: string;
  color: string;
  value: number;
}

interface Props {
  projects: any[];
  filteredTasks: any[];
  filteredInterventions: any[];
  users: any[];
  projStatusData: DonutStat[];
  taskStatusData: DonutStat[];
  intervStatusData: DonutStat[];
}

const DashboardGlobalSection: React.FC<Props> = ({
  projects, filteredTasks, filteredInterventions, users,
  projStatusData, taskStatusData, intervStatusData,
}) => (
  <div className="space-y-8">
    <DashboardSectionHeader label="Vue d'ensemble" title="Global" />

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {[
        { label: 'Projets Totaux',  value: projects.length,                                       color: 'text-slate-900' },
        { label: 'Tâches',          value: filteredTasks.length,                                   color: 'text-blue-600' },
        { label: 'Interventions',   value: filteredInterventions.length,                           color: 'text-indigo-600' },
        { label: 'Membres Équipe',  value: users.filter((u: any) => u.statut === 'ACTIF').length,  color: 'text-green-500' },
      ].map((s, i) => (
        <div key={i} className="premium-card">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{s.label}</p>
          <p className={`text-5xl font-black ${s.color} font-mono tracking-tighter leading-none`}>
            {s.value.toString().padStart(2, '0')}
          </p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { title: 'Statuts Projets',       data: projStatusData },
        { title: 'Statuts Tâches',        data: taskStatusData },
        { title: 'Statuts Interventions', data: intervStatusData },
      ].map(({ title, data }) => {
        const total = data.reduce((s, d) => s + d.value, 0);
        const unit  = title.includes('Projet') ? 'projet' : title.includes('Tâche') ? 'tâche' : 'intervention';
        return (
          <div key={title} className="premium-card">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">{title}</p>
            {data.length > 0 ? (
              <>
                <div className="h-[190px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={86} paddingAngle={3} dataKey="value" nameKey="label" labelLine={false} label={DashboardDonutLabel}>
                        {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value: number) => `${value} ${unit}${value !== 1 ? 's' : ''}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <DashboardLegend items={data} />
              </>
            ) : <div className="h-[190px]"><DashboardEmpty /></div>}
          </div>
        );
      })}
    </div>
  </div>
);

export default DashboardGlobalSection;
