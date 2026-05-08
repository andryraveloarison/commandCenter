import React from 'react';

interface RadarProps {
  data?: any[];
  size?: number;
}

const Radar: React.FC<RadarProps> = ({ data = [], size = 300 }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative flex justify-center items-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
          {/* Outer circle */}
          <circle cx={size / 2} cy={size / 2} r={size / 2 - 10} fill="none" stroke="#f1f5f9" strokeWidth="2" />

          {/* Middle circles */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 3}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="1"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 6}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="1"
          />

          {/* Grid lines */}
          <line x1={size / 2} y1={0} x2={size / 2} y2={size} stroke="#f1f5f9" strokeWidth="1" />
          <line x1={0} y1={size / 2} x2={size} y2={size / 2} stroke="#f1f5f9" strokeWidth="1" />

          {/* Static Sweep line (instead of animation) */}
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2}
            y2={10}
            stroke="#94a3b8"
            strokeWidth="2"
            opacity="0.5"
          />

          {/* Targets */}
          {data.map((item, index) => {
            const angle = (index * 60 * Math.PI) / 180;
            const dist = (size / 2.5);
            return (
              <g key={index}>
                <circle
                  cx={size / 2 + dist * Math.cos(angle)}
                  cy={size / 2 + dist * Math.sin(angle)}
                  r="6"
                  fill={index % 2 === 0 ? "#0f172a" : "#64748b"}
                />
                <circle
                  cx={size / 2 + dist * Math.cos(angle)}
                  cy={size / 2 + dist * Math.sin(angle)}
                  r="12"
                  fill="none"
                  stroke={index % 2 === 0 ? "#0f172a" : "#64748b"}
                  strokeWidth="1"
                  opacity="0.2"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-8 flex justify-center items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>Infrastructures détectées: {data.length.toString().padStart(2, '0')}</span>
      </div>
    </div>
  );
};

export default Radar;
