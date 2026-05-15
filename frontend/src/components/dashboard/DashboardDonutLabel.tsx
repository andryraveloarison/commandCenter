import React from 'react';

const luminance = (hex: string) => {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return 0;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

const DashboardDonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, fill }: any) => {
  if (percent < 0.06) return null;
  const rad = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const textColor = luminance(fill) > 140 ? '#1A1D2E' : 'white';
  return (
    <text
      x={cx + r * Math.cos(-midAngle * rad)}
      y={cy + r * Math.sin(-midAngle * rad)}
      fill={textColor} textAnchor="middle" dominantBaseline="central"
      fontSize={10} fontWeight="900"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default DashboardDonutLabel;
