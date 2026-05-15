import React from 'react';

interface Props {
  checking: boolean;
  corrected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const SpellCheckButton: React.FC<Props> = ({ checking, corrected, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={checking || disabled}
    title="Corriger l'orthographe en français"
    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-40"
    style={{
      background: corrected ? '#f0fdf4' : '#f8fafc',
      color: corrected ? '#16a34a' : '#6366f1',
      border: `1.5px solid ${corrected ? '#bbf7d0' : '#e0e7ff'}`,
    }}
  >
    {checking ? (
      <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
    ) : corrected ? (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ) : (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    )}
    {checking ? 'Correction…' : corrected ? 'Corrigé !' : 'FR ✦'}
  </button>
);

export default SpellCheckButton;
