import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '@store/store';
import socketService from '@services/socket';
import { logStore } from '@services/logStore';
import { notificationStore } from '@services/notificationStore';

const COLORS = { project: '#4ade80', task: '#60a5fa', intervention: '#fbbf24', group: '#60a5fa', dm: '#a78bfa' };

export function useRealtimeEvents() {
  const queryClient = useQueryClient();
  const myId = useSelector((s: RootState) => s.auth.user?.id);
  const myIdRef = useRef(myId);
  myIdRef.current = myId;

  useEffect(() => {
    // Connect first so all handlers are registered on the same socket instance.
    // This prevents React StrictMode double-mount from creating two connections.
    socketService.connect();

    const inv = (keys: string[][]) => keys.forEach(k => queryClient.invalidateQueries({ queryKey: k }));

    const handlers: Array<[string, (d: any) => void]> = [

      // ── Projects ─────────────────────────────────────────────────────────
      ['project:created', (d) => {
        inv([['projects']]);
        logStore.add(`Dossier créé : "${d.nom}" par @${d.actorUsername}`, 'success');
      }],
      ['project:updated', (d) => {
        inv([['projects'], ['project', d.projectId]]);
        const prog = d.progressionGlobale !== undefined ? ` — ${Math.round(d.progressionGlobale)}%` : '';
        logStore.add(`Dossier mis à jour : "${d.nom}"${prog}`, 'info');
      }],
      ['project:deleted', (d) => {
        inv([['projects']]);
        logStore.add(`Dossier supprimé : "${d.nom}"`, 'warning');
      }],
      ['project:team_updated', (d) => {
        inv([['projects'], ['project', d.projectId]]);
        logStore.add(`Équipe mise à jour : dossier "${d.nom}"`, 'info');
      }],

      // ── Tasks ─────────────────────────────────────────────────────────────
      ['task:created', (d) => {
        inv([['tasks'], ['project', d.projectId]]);
        logStore.add(`Tâche créée : "${d.titre}"`, 'info');
      }],
      ['task:updated', (d) => {
        inv([['tasks'], ['project', d.projectId]]);
        const detail = d.statut ? ` → ${d.statut}` : d.progression !== undefined ? ` → ${Math.round(d.progression)}%` : '';
        logStore.add(`Tâche mise à jour : "${d.titre}"${detail}`, 'info');
      }],
      ['task:deleted', (d) => {
        inv([['tasks'], ['project', d.projectId]]);
        logStore.add(`Tâche supprimée : "${d.titre}"`, 'warning');
      }],

      // ── Interventions ────────────────────────────────────────────────────
      ['intervention:created', (d) => {
        inv([['interventions']]);
        logStore.add(`Intervention ouverte : "${d.probleme}"`, 'warning');
      }],
      ['intervention:updated', (d) => {
        inv([['interventions']]);
        const s = d.statut ? ` → ${d.statut}` : '';
        logStore.add(`Intervention mise à jour : "${d.probleme}"${s}`, 'info');
      }],
      ['intervention:deleted', (d) => {
        inv([['interventions']]);
        logStore.add(`Intervention fermée : "${d.probleme}"`, 'warning');
      }],

      // ── Project notifications (directed to this user) ────────────────────
      ['notification', (d) => {
        notificationStore.push({
          icon: '◆',
          title: d.title ?? 'Notification',
          message: d.message ?? '',
          color: COLORS.project,
          projectId: d.projectId,
        });
      }],

      // ── Group messages ───────────────────────────────────────────────────
      ['group_message', (d) => {
        if (d.user?.id === myIdRef.current) return;
        const sender = d.user?.username ?? d.user?.nom ?? 'Inconnu';
        const preview = (d.contenu ?? '').slice(0, 60);
        logStore.add(`[GROUPE] @${sender} : ${preview}`, 'info');
        notificationStore.push({
          icon: '💬',
          title: `Canal groupe · @${sender}`,
          message: preview,
          color: COLORS.group,
        });
      }],

      // ── DM messages ──────────────────────────────────────────────────────
      ['dm_message', (d) => {
        if (d.sender?.id === myIdRef.current) return;
        const sender = d.sender?.username ?? d.sender?.nom ?? 'Inconnu';
        const preview = (d.contenu ?? '').slice(0, 60);
        logStore.add(`[MSG PRIVÉ] @${sender} → vous : ${preview}`, 'info');
        notificationStore.push({
          icon: '✉️',
          title: `Message privé · @${sender}`,
          message: preview,
          color: COLORS.dm,
          isDm: true,
          partnerId: d.sender?.id,
        });
      }],

      // ── Online users (Radar) ─────────────────────────────────────────────
      ['users:online_update', (users: any[]) => {
        queryClient.setQueryData(['users-online'], users);
      }],
    ];

    for (const [event, handler] of handlers) socketService.on(event, handler);
    return () => { for (const [event, handler] of handlers) socketService.off(event, handler); };
  }, [queryClient]);
}
