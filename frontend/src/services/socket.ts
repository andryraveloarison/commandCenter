import { io, Socket } from 'socket.io-client';

const SERVER_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ?? 'http://localhost:3000';

const STYLE = {
  recv: 'background:#0d3b26;color:#4ade80;padding:2px 6px;border-radius:3px;font-weight:bold',
  send: 'background:#0d1f3b;color:#60a5fa;padding:2px 6px;border-radius:3px;font-weight:bold',
  conn: 'background:#1a1a2e;color:#a78bfa;padding:2px 6px;border-radius:3px;font-weight:bold',
};

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    const token = localStorage.getItem('token');
    this.socket = io(SERVER_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.onAny((event, data) => {
      console.log(`%c ▼ RECV %c ${event}`, STYLE.recv, '', data);
    });

    this.socket.on('connect', () => {
      console.log(`%c ◆ SOCKET %c connecté — id: ${this.socket?.id}`, STYLE.conn, '');
    });
    this.socket.on('disconnect', (reason) => {
      console.log(`%c ◆ SOCKET %c déconnecté — ${reason}`, STYLE.conn, '');
    });
    this.socket.on('connect_error', (err) => {
      console.warn(`%c ◆ SOCKET %c erreur connexion — ${err.message}`, STYLE.conn, '');
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  on<T = any>(event: string, cb: (data: T) => void) {
    this.socket?.on(event, cb);
  }

  off(event: string, cb?: (...args: any[]) => void) {
    this.socket?.off(event, cb);
  }

  emit(event: string, data?: any) {
    console.log(`%c ▲ SEND %c ${event}`, STYLE.send, '', data ?? '');
    this.socket?.emit(event, data);
  }

  get connected() {
    return this.socket?.connected ?? false;
  }
}

export default new SocketService();
