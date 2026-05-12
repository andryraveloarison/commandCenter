import React from 'react';

interface Props {
  logo?: string;
  nom: string;
}

const DashboardProjectLogo: React.FC<Props> = ({ logo, nom }) => {
  if (!logo) return <span className="text-xl">{nom[0]?.toUpperCase() || '?'}</span>;
  if (logo.startsWith('http') || logo.startsWith('data:'))
    return <img src={logo} alt="" className="w-full h-full object-cover rounded-xl" />;
  return <span className="text-xl">{logo}</span>;
};

export default DashboardProjectLogo;
