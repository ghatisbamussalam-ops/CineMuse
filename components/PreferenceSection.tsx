
import React from 'react';

interface PreferenceSectionProps {
  title: string;
  children: React.ReactNode;
}

const PreferenceSection: React.FC<PreferenceSectionProps> = ({ title, children }) => {
  return (
    <div className="mb-2">
      <h3 className="text-base font-semibold text-cyan-400 mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block"></span>
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{children}</div>
    </div>
  );
};

export default PreferenceSection;
