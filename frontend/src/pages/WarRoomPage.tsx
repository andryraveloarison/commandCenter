import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Radar from '@components/Radar';
import apiService from '@services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WarRoomPage: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-war-room'],
    queryFn: () => apiService.getProjects().then(r => r.data),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-war-room'],
    queryFn: () => apiService.getUsers().then(r => r.data),
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black font-montserrat tracking-tighter uppercase leading-none mb-2 text-slate-900">
            Centre <span className="text-slate-400">Technique</span>
          </h1>
          <p className="text-slate-500 font-medium">Surveillance en temps réel des infrastructures</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-6 shadow-sm">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Heure Système</p>
            <p className="text-2xl font-black font-mono text-slate-900 tracking-tighter">{timeString}</p>
          </div>
          <div className="w-px h-10 bg-slate-100" />
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Online</span>
          </div>
        </div>
      </div>

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
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Équipe Active</p>
          <p className="text-5xl font-black font-mono text-slate-900">{users.length.toString().padStart(2, '0')}</p>
        </div>
      </div>

      {/* Main Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tactical Radar */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center premium-card">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 w-full text-center">Radar Infrastructures</p>
          <Radar data={projects.slice(0, 6)} size={260} />
        </div>

        {/* Active Operations List */}
        <div className="lg:col-span-2 premium-card">
          <div className="flex justify-between items-center mb-8">
            <h3 className="premium-title text-sm">Opérations Prioritaires</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temps Réel</span>
          </div>
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
            {projects.filter(p => p.statut === 'EN_COURS').map((project) => (
              <div key={project.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm">⚡</div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{project.nom}</p>
                      <p className="text-[10px] text-slate-400 font-bold">PRJ_{project.id.slice(-4).toUpperCase()}</p>
                    </div>
                  </div>
                  <span className="text-xl font-black font-mono text-slate-900">{project.progressionGlobale.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-slate-900 h-full rounded-full"
                    style={{ width: `${project.progressionGlobale}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Journal */}
      <div className="premium-card bg-slate-900 border-none">
        <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <div className="w-2 h-2 rounded-full bg-slate-700" />
          </div>
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Journal d'exploitation système</span>
        </div>
        <div className="font-mono text-[11px] h-32 overflow-y-auto space-y-1.5 custom-scrollbar text-slate-300">
          <p><span className="text-white/20">[{new Date().toLocaleDateString()}]</span> INITIALISATION DES SYSTÈMES DSI...</p>
          <p><span className="text-white/20">[{timeString}]</span> SURVEILLANCE RÉSEAU ACTIVE</p>
          <p className="text-blue-400">PROJETS CHARGÉS: {projects.length}</p>
          <p className="text-purple-400">ÉQUIPE CONNECTÉE: {users.length} MEMBRES</p>
          <p className="text-green-500">TOUS LES SYSTÈMES SONT OPÉRATIONNELS</p>
          <p className="text-white/40 italic">En attente de nouvelles entrées...</p>
        </div>
      </div>
    </div>
  );
};

export default WarRoomPage;
