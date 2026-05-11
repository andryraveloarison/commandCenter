import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiService from '@services/api';
import { type User } from '@types/index';

const UsersPage: React.FC = () => {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.getUsers().then(r => r.data as User[]),
  });

  const { data: onlineUsers = [] } = useQuery({
    queryKey: ['onlineUsers'],
    queryFn: () => apiService.getOnlineUsers().then(r => r.data as User[]),
    refetchInterval: 15000,
  });

  const onlineIds = new Set(onlineUsers.map((u: User) => u.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Chargement de l'annuaire...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-4">


      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {users.map((user) => (
          <div
            key={user.id}
            className="premium-card group relative hover:border-slate-400 transition-all"
          >
            {/* Status Indicator – green only if actually online */}
            <div className="absolute top-4 right-4">
              <div className={`w-2.5 h-2.5 rounded-full ${onlineIds.has(user.id) ? 'bg-green-500' : 'bg-slate-300'}`} />
            </div>

            <div className="text-center">
              {/* Avatar Placeholder */}
              <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                {user.photo ? (
                  <img src={user.photo} alt={user.nom} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <span className="text-slate-400">👤</span>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{user.nom}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{user.role || 'DÉVELOPPEUR'}</p>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersPage;
