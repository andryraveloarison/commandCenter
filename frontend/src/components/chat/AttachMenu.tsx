import React, { useRef, useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onPoll?: () => void;
  onImage: (file: File) => void;
  onFile: (file: File) => void;
}

const MAX_IMG  = 5  * 1024 * 1024; // 5 MB
const MAX_FILE = 10 * 1024 * 1024; // 10 MB

const IcoBarChart = () => (
  <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6"  y1="20" x2="6"  y2="14" />
    <line x1="2"  y1="20" x2="22" y2="20" />
  </svg>
);

const IcoImage = () => (
  <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const IcoFile = () => (
  <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const AttachMenu: React.FC<Props> = ({ open, onClose, onPoll, onImage, onFile }) => {
  const imgRef  = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMG) { alert('Image trop volumineuse (max 5 Mo)'); return; }
    onImage(file);
    e.target.value = '';
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE) { alert('Fichier trop volumineux (max 10 Mo)'); return; }
    onFile(file);
    e.target.value = '';
    onClose();
  };

  if (!open) return null;

  const item = (icon: React.ReactNode, label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '9px 14px', background: 'none', border: 'none',
        cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#374151',
        borderRadius: 8, transition: 'background 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#F3F4F6')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      <span style={{ color: '#6B7280' }}>{icon}</span>
      {label}
    </button>
  );

  return (
    <>
      {/* Hidden file inputs */}
      <input ref={imgRef}  type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImgChange} />
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* Popup menu */}
      <div
        ref={menuRef}
        style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: 0,
          background: '#fff', border: '1px solid #EEF0F6', borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)', padding: '6px', minWidth: 170,
          zIndex: 100,
        }}
      >
        {onPoll && item(<IcoBarChart />, 'Sondage', () => { onPoll(); onClose(); })}
        {item(<IcoImage />, 'Image', () => imgRef.current?.click())}
        {item(<IcoFile />,  'Fichier (PDF…)', () => fileRef.current?.click())}
      </div>
    </>
  );
};

export default AttachMenu;
