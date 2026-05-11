import React, { useState } from 'react';

interface RadarUser {
  id: string;
  nom: string;
  photo?: string;
  role?: string;
}

interface RadarProps {
  users?: RadarUser[];
  size?: number;
}

const Radar: React.FC<RadarProps> = ({ users = [], size = 300 }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 16;

  const positions = users.map((user, i) => {
    const angle = (i * (360 / Math.max(users.length, 1)) - 90) * (Math.PI / 180);
    const distFactor = 0.38 + ((i * 0.19) % 0.48);
    const r = maxR * distFactor;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      user,
    };
  });

  return (
    <div className="w-full max-w-md mx-auto select-none">
      <div className="relative flex justify-center items-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="mx-auto overflow-visible"
        >
          {/* Grid rings */}
          {[1, 2 / 3, 1 / 3].map((ratio, i) => (
            <circle
              key={i}
              cx={cx} cy={cy}
              r={maxR * ratio}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={i === 0 ? 2 : 1}
            />
          ))}

          {/* Grid cross lines */}
          {[0, 45, 90, 135].map(deg => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={cx - maxR * Math.cos(rad)} y1={cy - maxR * Math.sin(rad)}
                x2={cx + maxR * Math.cos(rad)} y2={cy + maxR * Math.sin(rad)}
                stroke="#f1f5f9" strokeWidth="1"
              />
            );
          })}

          {/* Rotating sweep line */}
          <line x1={cx} y1={cy} x2={cx} y2={cy - maxR} stroke="#94a3b8" strokeWidth="2" opacity="0.5">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${cx} ${cy}`}
              to={`360 ${cx} ${cy}`}
              dur="5s"
              repeatCount="indefinite"
            />
          </line>

          {/* Sweep glow wedge */}
          <path
            d={`M ${cx} ${cy} L ${cx} ${cy - maxR} A ${maxR} ${maxR} 0 0 1 ${cx + maxR * Math.sin((30 * Math.PI) / 180)} ${cy - maxR * Math.cos((30 * Math.PI) / 180)} Z`}
            fill="url(#sweepGrad)"
            opacity="0.08"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${cx} ${cy}`}
              to={`360 ${cx} ${cy}`}
              dur="5s"
              repeatCount="indefinite"
            />
          </path>

          <defs>
            <radialGradient id="sweepGrad" cx="0%" cy="0%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Center dot */}
          <circle cx={cx} cy={cy} r="5" fill="#0f172a" />
          <circle cx={cx} cy={cy} r="10" fill="none" stroke="#0f172a" strokeWidth="1" opacity="0.2" />

          {/* User dots */}
          {positions.map(({ x, y, user }, i) => {
            const isHovered = hovered === i;
            const flipX = x > size * 0.65;
            const tooltipW = 148;
            const tooltipH = 52;
            const tx = flipX ? x - tooltipW - 10 : x + 14;
            const ty = Math.max(4, Math.min(y - tooltipH / 2, size - tooltipH - 4));

            return (
              <g
                key={user.id}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer ping ring */}
                <circle cx={x} cy={y} r="16" fill="none" stroke="#0f172a" strokeWidth="1" opacity={isHovered ? 0.3 : 0.12} />

                {/* Photo or initials */}
                {user.photo ? (
                  <>
                    <defs>
                      <clipPath id={`rclip-${user.id}`}>
                        <circle cx={x} cy={y} r="9" />
                      </clipPath>
                    </defs>
                    <circle cx={x} cy={y} r="9" fill="#e2e8f0" stroke={isHovered ? '#0f172a' : 'white'} strokeWidth="2" />
                    <image
                      href={user.photo}
                      x={x - 9} y={y - 9}
                      width="18" height="18"
                      clipPath={`url(#rclip-${user.id})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </>
                ) : (
                  <>
                    <circle cx={x} cy={y} r="9" fill={isHovered ? '#0f172a' : '#334155'} stroke="white" strokeWidth="2" />
                    <text x={x} y={y + 3.5} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
                      {user.nom[0]?.toUpperCase()}
                    </text>
                  </>
                )}

                {/* Tooltip */}
                {isHovered && (
                  <foreignObject x={tx} y={ty} width={tooltipW} height={tooltipH + 8}>
                    <div
                      style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '8px 10px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.13)',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: `${tooltipW}px`,
                      }}
                    >
                      {user.photo ? (
                        <img
                          src={user.photo}
                          style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                          alt=""
                        />
                      ) : (
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '900', flexShrink: 0 }}>
                          {user.nom[0]?.toUpperCase()}
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '10px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.nom}
                        </div>
                        <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {user.role || 'MEMBRE'}
                        </div>
                      </div>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
        Membres détectés: {users.length.toString().padStart(2, '0')}
      </div>
    </div>
  );
};

export default Radar;
