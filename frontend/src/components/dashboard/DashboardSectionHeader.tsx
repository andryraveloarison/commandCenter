import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  label: string;
  title: string;
  linkTo?: string;
  linkLabel?: string;
}

const DashboardSectionHeader: React.FC<Props> = ({ label, title, linkTo, linkLabel }) => (
  <div className="flex justify-between items-end mb-8">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <h2 className="text-2xl font-black font-montserrat uppercase tracking-tight leading-none text-slate-900">{title}</h2>
    </div>
    {linkTo && (
      <Link to={linkTo} className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b-2 border-slate-900 pb-1 hover:text-slate-600 transition-colors">
        {linkLabel}
      </Link>
    )}
  </div>
);

export default DashboardSectionHeader;
