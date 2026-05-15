export type LogType = 'system' | 'info' | 'success' | 'warning' | 'error';

export interface LogEntry {
  id: number;
  time: string;
  message: string;
  type: LogType;
}

type Listener = (entries: LogEntry[]) => void;

class LogStore {
  private entries: LogEntry[] = [];
  private listeners: Set<Listener> = new Set();
  private counter = 0;
  private MAX = 150;
  private lastAddedAt = 0;
  private lastMessage = '';

  constructor() {
    this.push('INITIALISATION DU COMMAND CENTER ...', 'system');
    this.push('SURVEILLANCE RÉSEAU ACTIVE', 'info');
  }

  private push(message: string, type: LogType) {
    const entry: LogEntry = {
      id: ++this.counter,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: message.toUpperCase(),
      type,
    };
    this.entries = [entry, ...this.entries].slice(0, this.MAX);
    this.listeners.forEach(l => l([...this.entries]));
  }

  add(message: string, type: LogType = 'info') {
    const now = Date.now();
    const upper = message.toUpperCase();
    // Ignore exact duplicate within 400ms (React StrictMode double-fire guard)
    if (upper === this.lastMessage && now - this.lastAddedAt < 400) return;
    this.lastMessage = upper;
    this.lastAddedAt = now;
    this.push(message, type);
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener([...this.entries]);
    return () => this.listeners.delete(listener);
  }

  getAll() { return [...this.entries]; }
}

export const logStore = new LogStore();
