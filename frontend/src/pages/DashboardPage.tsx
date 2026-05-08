import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '@store/store';
import apiService from '@services/api';

const DashboardPage: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiService.getProjects().then(r => r.data),
  });

  return (
    <div className="space-y-12">

      {/* Stats Grid - Clean Light style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'PROJETS TOTAUX', value: projects.length, color: 'text-slate-900' },
          { label: 'EN COURS', value: projects.filter(p => p.statut === 'EN_COURS').length, color: 'text-blue-600' },
          { label: 'CRITIQUES', value: projects.filter(p => p.statut === 'CRITIQUE').length, color: 'text-red-500' },
          { label: 'TERMINÉS', value: projects.filter(p => p.statut === 'TERMINE').length, color: 'text-green-500' },
        ].map((stat, i) => (
          <div key={i} className="premium-card group">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
              {stat.label}
            </p>
            <div className="flex items-end justify-between">
              <p className={`text-6xl font-black ${stat.color} font-mono tracking-tighter leading-none`}>
                {stat.value.toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Active Projects List */}
      <div>
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-2xl font-black font-montserrat uppercase tracking-tight leading-none text-slate-900">
            Opérations <span className="text-slate-400 font-normal">Prioritaires</span>
          </h2>
          <button className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b-2 border-slate-900 pb-1">
            Voir tout le réseau
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {projects.slice(0, 6).map((project, idx) => (
            <div
              key={project.id}
              className="premium-card flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg">
                  {idx % 3 === 0 ? '🚀' : idx % 3 === 1 ? '⚡' : '🛡️'}
                </div>
                <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${project.statut === 'CRITIQUE' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'
                  }`}>
                  {project.statut}
                </span>
              </div>

              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">ID_SYS_{project.id.slice(-4).toUpperCase()}</p>
                <h3 className="text-2xl font-black text-slate-900 mb-6 font-montserrat tracking-tight leading-tight uppercase">
                  {project.nom}
                </h3>

                {/* Progress bar */}
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 tracking-widest">
                    <span>DÉPLOIEMENT</span>
                    <span className="text-slate-900 font-mono">{project.progressionGlobale.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                    <div
                      className="bg-slate-900 h-full rounded-full"
                      style={{ width: `${project.progressionGlobale}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                <div className="flex -space-x-2">
                  {[1, 2].map(i => (
                    <div key={i} className="w-7 h-7 rounded-lg border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-600 uppercase">
                      User
                    </div>
                  ))}
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                  Détails →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
