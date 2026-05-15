import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import socketService from '@services/socket';
import { logStore } from '@services/logStore';

export function useRealtimeEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handlers: Array<[string, (d: any) => void]> = [
      ['project:created', (d) => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        logStore.add(`Dossier créé : "${d.nom}" par @${d.actorUsername}`, 'success');
      }],
      ['project:updated', (d) => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['project', d.projectId] });
        logStore.add(`Dossier mis à jour : "${d.nom}"`, 'info');
      }],
      ['project:deleted', (d) => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        logStore.add(`Dossier supprimé : "${d.nom}"`, 'warning');
      }],
      ['task:created', (d) => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['project', d.projectId] });
        logStore.add(`Tâche créée : "${d.titre}"`, 'info');
      }],
      ['task:updated', (d) => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['project', d.projectId] });
        const statusMsg = d.statut ? ` → ${d.statut}` : d.progression !== undefined ? ` → ${Math.round(d.progression)}%` : '';
        logStore.add(`Tâche mise à jour : "${d.titre}"${statusMsg}`, 'info');
      }],
      ['intervention:created', (d) => {
        queryClient.invalidateQueries({ queryKey: ['interventions'] });
        logStore.add(`Intervention ouverte : "${d.probleme}"`, 'warning');
      }],
      ['intervention:updated', (d) => {
        queryClient.invalidateQueries({ queryKey: ['interventions'] });
        logStore.add(`Intervention ${d.statut ?? 'mise à jour'} : "${d.probleme}"`, 'info');
      }],
    ];

    for (const [event, handler] of handlers) {
      socketService.on(event, handler);
    }

    return () => {
      for (const [event, handler] of handlers) {
        socketService.off(event, handler);
      }
    };
  }, [queryClient]);
}
