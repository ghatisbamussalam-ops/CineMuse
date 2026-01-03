
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-4 border-cyan-900 opacity-30"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
    </div>
  );
};

export default Spinner;
