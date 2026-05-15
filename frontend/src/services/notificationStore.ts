export interface ToastItem {
  id: number;
  icon: string;
  title: string;
  message: string;
  color: string;
  projectId?: string;
  isDm?: boolean;
  partnerId?: string;
}

type Listener = (items: ToastItem[]) => void;

class NotificationStore {
  private items: ToastItem[] = [];
  private listeners: Set<Listener> = new Set();
  private counter = 0;

  push(item: Omit<ToastItem, 'id'>, durationMs = 6000) {
    const t: ToastItem = { ...item, id: ++this.counter };
    this.items = [...this.items, t];
    this.notify();
    setTimeout(() => this.remove(t.id), durationMs);
    return t.id;
  }

  remove(id: number) {
    this.items = this.items.filter(t => t.id !== id);
    this.notify();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener([...this.items]);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l([...this.items]));
  }
}

export const notificationStore = new NotificationStore();
