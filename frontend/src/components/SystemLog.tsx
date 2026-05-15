import React, { useEffect, useRef, useState } from 'react';
import { logStore, type LogEntry } from '@services/logStore';

const TYPE_STYLE: Record<string, string> = {
  system: '#94a3b8',
  info:   '#60a5fa',
  success: '#4ade80',
  warning: '#fbbf24',
  error:   '#f87171',
};

const TYPE_PREFIX: Record<string, string> = {
  system: 'SYS',
  info:   'INF',
  success: 'OK ',
  warning: 'WRN',
  error:   'ERR',
};

const SystemLog: React.FC = () => {
  const [entries, setEntries] = useState<LogEntry[]>(() => logStore.getAll());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return logStore.subscribe(setEntries);
  }, []);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [entries]);

  return (
    <div
      className="rounded-none"
      style={{
        background: '#060910',
        border: '1px solid #ffffff08',
        borderRadius: 4,
      }}
    >
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid #ffffff08' }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] ml-2" style={{ color: '#ffffff25' }}>
          Journal d'exploitation système
        </span>
        <div className="flex-1" />
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
        <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: '#4ade8060' }}>LIVE</span>
      </div>

      {/* Log entries */}
      <div ref={containerRef} className="font-mono text-[11px] h-44 overflow-y-auto px-4 py-3 space-y-1.5 custom-scrollbar" style={{ color: '#94a3b8' }}>
        {[...entries].reverse().map(entry => (
          <div key={entry.id} className="flex items-start gap-2">
            <span className="flex-shrink-0 text-[9px]" style={{ color: '#ffffff18' }}>[{entry.time}]</span>
            <span className="flex-shrink-0 text-[9px] font-black" style={{ color: TYPE_STYLE[entry.type] + '80' }}>
              {TYPE_PREFIX[entry.type]}
            </span>
            <span style={{ color: TYPE_STYLE[entry.type] }}>{entry.message}</span>
          </div>
        ))}
        <div className="flex items-center gap-1" style={{ color: '#ffffff20' }}>
          <span className="animate-pulse">▋</span>
          <span className="text-[10px] italic">En attente de nouvelles entrées...</span>
        </div>
      </div>
    </div>
  );
};

export default SystemLog;
