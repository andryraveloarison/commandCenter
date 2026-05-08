import React from 'react';

interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'radar' | 'alert' | 'premium';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  color = 'premium',
}) => {
  const heightClass = {
    sm: 'h-1.5',
    md: 'h-3',
    lg: 'h-4',
  }[size];

  const colorClass = {
    green: 'bg-green-500',
    radar: 'bg-premium-accent shadow-glow-accent',
    alert: 'bg-red-500 shadow-lg shadow-red-500/30',
    premium: 'bg-gradient-to-r from-premium-accent-purple to-premium-accent shadow-glow-purple',
  }[color];

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-100 dark:bg-gray-800 rounded-full ${heightClass} overflow-hidden shadow-inner`}>
        <div
          className={`${colorClass} h-full transition-all duration-1000 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
