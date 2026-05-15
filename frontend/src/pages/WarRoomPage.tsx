import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Radar from '@components/Radar';
import SystemLog from '@components/SystemLog';
import apiService from '@services/api';

const WarRoomPage: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiService.getProjects().then(r => r.data),
  });

  const { data: onlineUsers = [] } = useQuery({
    queryKey: ['users-online'],
    queryFn: () => apiService.getOnlineUsers().then(r => r.data),
    refetchInterval: 20000,
  });

  const criticalProjects = projects.filter(p => p.statut === 'CRITIQUE');
  const activeMissionsCount = projects.filter(p => p.statut === 'EN_COURS').length;

  const timeString = time.toLocaleTimeString('fr-FR', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const historyData = [
    { time: '00:00', progress: 10 },
    { time: '06:00', progress: 25 },
    { time: '12:00', progress: 45 },
    { time: '18:00', progress: 65 },
    { time: '24:00', progress: 80 },
  ];

  return (
    <div className="space-y-8 pb-4">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Projets Actifs</p>
          <p className="text-5xl font-black font-mono text-slate-900">{activeMissionsCount.toString().padStart(2, '0')}</p>
        </div>
        <div className="premium-card">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Alertes Critiques</p>
          <p className={`text-5xl font-black font-mono ${criticalProjects.length > 0 ? 'text-red-500' : 'text-slate-900'}`}>
            {criticalProjects.length.toString().padStart(2, '0')}
          </p>
        </div>
        <div className="premium-card">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">En Ligne</p>
          <p className="text-5xl font-black font-mono text-green-500">{onlineUsers.length.toString().padStart(2, '0')}</p>
        </div>
      </div>

      {/* Main Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tactical Radar */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center premium-card">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 w-full text-center">Radar Équipe</p>
          <Radar users={onlineUsers} size={260} />
        </div>

        {/* Active Operations List */}
        <div className="lg:col-span-2 premium-card">
          <div className="flex justify-between items-center mb-8">
            <h3 className="premium-title text-sm">Opérations Prioritaires</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Récemment mis à jour</span>
          </div>
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
            {[...projects]
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 3)
              .map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`} className="block p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors group">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm overflow-hidden flex-shrink-0">
                        {project.logo
                          ? <img src={project.logo} alt="" className="w-full h-full object-cover" />
                          : <span className="text-slate-400 font-black text-sm">{project.nom[0]}</span>
                        }
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:underline">{project.nom}</p>
                        <p className="text-[10px] text-slate-400 font-bold">PRJ_{project.id.slice(-4).toUpperCase()}</p>
                      </div>
                    </div>
                    <span className="text-xl font-black font-mono text-slate-900">{project.progressionGlobale.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-slate-900 h-full rounded-full" style={{ width: `${project.progressionGlobale}%` }} />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* System Journal — live, in-memory */}
      <SystemLog />
    </div>
  );
};

export default WarRoomPage;
