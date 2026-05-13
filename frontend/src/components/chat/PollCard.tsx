import React from 'react';
import type { Poll } from './chatTypes';

interface Props {
  poll: Poll;
  currentUserId?: string;
  isMine: boolean;
  onVote: (pollId: string, optionIndex: number) => void;
}

const PollCard: React.FC<Props> = ({ poll, currentUserId, isMine, onVote }) => {
  const totalVotes = poll.votes.length;
  const myVote     = poll.votes.find(v => v.userId === currentUserId);

  return (
    <div style={{
      background:   isMine ? '#3730A3' : '#F3F4F6',
      border:       `1px solid ${isMine ? '#4338CA' : '#E5E7EB'}`,
      borderRadius: 12,
      padding:      '12px 14px',
      minWidth:     200,
      maxWidth:     280,
    }}>
      <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: isMine ? '#E0E7FF' : '#374151', lineHeight: 1.4 }}>
        📊 {poll.question}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {poll.options.map((opt, idx) => {
          const count   = poll.votes.filter(v => v.optionIndex === idx).length;
          const pct     = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isMyOpt = myVote?.optionIndex === idx;

          return (
            <button
              key={idx}
              onClick={() => onVote(poll.id, idx)}
              style={{
                position: 'relative', overflow: 'hidden',
                border:       `1.5px solid ${isMyOpt ? '#818CF8' : isMine ? '#4338CA' : '#D1D5DB'}`,
                borderRadius: 8, padding: '7px 10px',
                background:   'transparent', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{
                position:   'absolute', inset: 0, width: `${pct}%`,
                background: isMyOpt ? 'rgba(99,102,241,0.25)' : isMine ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.1)',
                transition: 'width 0.4s ease',
              }} />
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: isMine ? '#E0E7FF' : '#374151' }}>
                  {isMyOpt && '✓ '}{opt}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: isMine ? '#A5B4FC' : '#6B7280', whiteSpace: 'nowrap' }}>
                  {pct}% · {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p style={{ margin: '8px 0 0', fontSize: 9.5, color: isMine ? '#A5B4FC' : '#9CA3AF', fontWeight: 500 }}>
        {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

export default PollCard;
