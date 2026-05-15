import React from 'react';
import type { LocalIntervention } from './calendarTypes';
import { INTERVENTION_STATUS } from './calendarTypes';
import CalendarAvatar from './CalendarAvatar';

interface Props {
  iv: LocalIntervention;
  onClose: () => void;
}

const CalendarInterventionPanel: React.FC<Props> = ({ iv, onClose }) => {
  const cfg = INTERVENTION_STATUS[iv.statut] || INTERVENTION_STATUS.EN_ATTENTE;
  const date = iv.dateIntervention || iv.createdAt;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.15)' }} />
      <div style={{
        position: 'fixed', right: 24, top: '50%', transform: 'translateY(-50%)',
        width: 340, background: '#fff', borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 99, padding: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ flex: 1, paddingRight: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Intervention</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#1A1D2E', margin: 0, lineHeight: 1.4 }}>{iv.probleme}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#C4C9D4', lineHeight: 1 }}>×</button>
        </div>

        <span style={{ display: 'inline-flex', padding: '3px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: cfg.bg, color: cfg.color, marginBottom: 16 }}>
          {cfg.label}
        </span>

        <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#6B7280' }}>
            <span style={{ fontWeight: 700, color: '#374151' }}>Date : </span>
            {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {iv.intervenants?.length > 0 && (
          <div style={{ marginBottom: 12, padding: '10px 14px', background: '#F9FAFB', borderRadius: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#C4C9D4', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
              Intervenant{iv.intervenants.length > 1 ? 's' : ''}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {iv.intervenants.map(ir => (
                <div key={ir.user.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CalendarAvatar user={ir.user} size={30} />
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#1A1D2E' }}>@{(ir.user as any).username ?? ir.user.nom}</p>
                    <p style={{ margin: '1px 0 0', fontSize: 10, color: '#9CA3AF' }}>{ir.user.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {iv.solution && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#C4C9D4', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Solution</p>
            <p style={{ fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.5, padding: '10px 14px', background: '#F0FDF4', borderRadius: 10 }}>
              {iv.solution}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CalendarInterventionPanel;
