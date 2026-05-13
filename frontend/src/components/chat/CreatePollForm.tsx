import React, { useState } from 'react';

interface Props {
  onSubmit: (question: string, options: string[]) => void;
  onCancel: () => void;
  compact?: boolean;
}

const CreatePollForm: React.FC<Props> = ({ onSubmit, onCancel, compact = false }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const addOption = () => options.length < 6 && setOptions([...options, '']);
  const removeOption = (i: number) => options.length > 2 && setOptions(options.filter((_, idx) => idx !== i));
  const setOption = (i: number, v: string) => setOptions(options.map((o, idx) => idx === i ? v : o));

  const valid = question.trim().length > 0 && options.filter(o => o.trim()).length >= 2;

  const submit = () => {
    if (!valid) return;
    onSubmit(question.trim(), options.filter(o => o.trim()));
  };

  const pad = compact ? 12 : 14;

  return (
    <div style={{
      background: '#F8F9FF', border: '1.5px solid #C7D2FE',
      borderRadius: 14, padding: pad,
      margin: compact ? '0 0 10px' : '0 14px 10px',
      width: '300px',
    }}>
      <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#4F46E5' }}>Créer un sondage</p>

      <input
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Question du sondage…"
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '8px 10px', borderRadius: 9, marginBottom: 8,
          border: '1.5px solid #C7D2FE', background: '#fff',
          fontSize: 12, fontWeight: 500, color: '#1A1D2E', outline: 'none',
        }}
      />

      {options.map((opt, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input
            value={opt}
            onChange={e => setOption(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
            style={{
              flex: 1, padding: '7px 10px', borderRadius: 8,
              border: '1.5px solid #E0E7FF', background: '#fff',
              fontSize: 12, fontWeight: 500, color: '#374151', outline: 'none',
            }}
          />
          {options.length > 2 && (
            <button onClick={() => removeOption(i)} style={{ padding: '4px 8px', borderRadius: 7, border: '1px solid #FECACA', background: '#FFF5F5', color: '#EF4444', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>✕</button>
          )}
        </div>
      ))}

      {options.length < 6 && (
        <button onClick={addOption} style={{ width: '100%', padding: '6px', borderRadius: 8, border: '1.5px dashed #C7D2FE', background: 'transparent', color: '#6366F1', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}>
          + Ajouter une option
        </button>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={submit} disabled={!valid} style={{ flex: 1, padding: '8px', borderRadius: 9, border: 'none', background: valid ? '#4F46E5' : '#EEF2FF', color: valid ? '#fff' : '#A5B4FC', fontWeight: 700, fontSize: 12, cursor: valid ? 'pointer' : 'default' }}>
          Publier
        </button>
        <button onClick={onCancel} style={{ padding: '8px 14px', borderRadius: 9, border: '1px solid #EEF0F6', background: '#F9FAFB', color: '#6B7280', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
          Annuler
        </button>
      </div>
    </div>
  );
};

export default CreatePollForm;
