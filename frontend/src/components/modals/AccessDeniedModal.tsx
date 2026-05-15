import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const AccessDeniedModal: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg width="32" height="32" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Accès refusé</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Vous n'êtes pas assigné à ce projet.<br />
            Seuls les membres de l'équipe peuvent créer ou modifier des éléments.
          </p>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-3">
            Contactez le responsable du projet pour être ajouté.
          </p>
        </div>
        <div className="px-8 pb-8">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-all"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedModal;
