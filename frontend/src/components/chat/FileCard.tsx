import React from 'react';

interface Props {
  contenu: string;
  fileName: string;
  isMine: boolean;
}

const EXT_COLOR: Record<string, string> = {
  pdf: '#EF4444',
  doc: '#3B82F6', docx: '#3B82F6',
  xls: '#10B981', xlsx: '#10B981',
  zip: '#F59E0B', rar: '#F59E0B',
  txt: '#6B7280',
};

const FileCard: React.FC<Props> = ({ contenu, fileName, isMine }) => {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? 'doc';
  const color = EXT_COLOR[ext] ?? '#6366F1';

  return (
    <a
      href={contenu}
      download={fileName}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px',
        borderRadius: 12,
        background: isMine ? '#4F46E5' : '#F3F4F6',
        border: isMine ? '1px solid #4338CA' : '1px solid #E5E7EB',
        textDecoration: 'none',
        maxWidth: 240,
        minWidth: 180,
      }}
    >
      {/* Document icon */}
      <div style={{
        width: 38, height: 46, borderRadius: 6, background: color,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0, position: 'relative',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
      }}>
        {/* dog-ear */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 0, height: 0,
          borderStyle: 'solid',
          borderWidth: '0 10px 10px 0',
          borderColor: `transparent rgba(0,0,0,0.18) transparent transparent`,
        }} />
        <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', letterSpacing: '0.04em', marginTop: 4 }}>
          {ext.toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontWeight: 600, fontSize: 12.5,
          color: isMine ? '#fff' : '#1A1D2E',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{fileName}</p>
        <p style={{ margin: '2px 0 0', fontSize: 10.5, color: isMine ? 'rgba(255,255,255,0.6)' : '#9CA3AF' }}>
          Cliquer pour télécharger
        </p>
      </div>

      {/* Download arrow */}
      <svg width={14} height={14} fill="none" stroke={isMine ? 'rgba(255,255,255,0.7)' : '#9CA3AF'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </a>
  );
};

export default FileCard;
