
import React from 'react';

interface PreferenceSectionProps {
  title: string;
  children: React.ReactNode;
}

const PreferenceSection: React.FC<PreferenceSectionProps> = ({ title, children }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-cyan-400 mb-3">{title}</h3>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
};

export default PreferenceSection;
