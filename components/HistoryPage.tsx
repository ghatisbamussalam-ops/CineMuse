
import React from 'react';
import { HistoryItem } from '../types';
import { UI_LABELS } from '../constants';

const ViewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.062 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


interface HistoryPageProps {
  history: HistoryItem[];
  onView: (item: HistoryItem) => void;
  onDelete: (id: number) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ history, onView, onDelete }) => {
    if (history.length === 0) {
        return (
            <div className="text-center py-20 text-gray-400 bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700/50">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <p className="text-lg font-medium">{UI_LABELS.EMPTY_HISTORY}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 animate-fade-in">
            {history.map((item) => (
                <div key={item.id} className="group bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-gray-700/50 flex justify-between items-center transition-all hover:bg-gray-700/60 hover:border-cyan-500/30 hover:shadow-lg">
                    <div>
                        <h3 className="font-bold text-gray-200 group-hover:text-cyan-300 text-lg transition-colors">{item.workName}</h3>
                        <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => onView(item)} 
                            title={UI_LABELS.VIEW_ANALYSIS}
                            className="p-2.5 rounded-full bg-gray-700/50 text-gray-400 hover:bg-cyan-600 hover:text-white transition-all shadow-sm"
                            aria-label={UI_LABELS.VIEW_ANALYSIS}
                        >
                            <ViewIcon />
                        </button>
                        <button 
                            onClick={() => onDelete(item.id)} 
                            title={UI_LABELS.DELETE_ANALYSIS}
                            className="p-2.5 rounded-full bg-gray-700/50 text-gray-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            aria-label={UI_LABELS.DELETE_ANALYSIS}
                        >
                            <DeleteIcon />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HistoryPage;
