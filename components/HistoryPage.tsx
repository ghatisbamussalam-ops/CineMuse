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
            <div className="text-center py-20 text-gray-500 bg-gray-800 rounded-lg">
                <p className="text-lg">{UI_LABELS.EMPTY_HISTORY}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {history.map((item) => (
                <div key={item.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center transition hover:bg-gray-700/50">
                    <div>
                        <h3 className="font-bold text-cyan-400 text-lg">{item.workName}</h3>
                        <p className="text-sm text-gray-400">{item.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => onView(item)} 
                            title={UI_LABELS.VIEW_ANALYSIS}
                            className="p-2 rounded-full text-gray-400 hover:bg-gray-600 hover:text-cyan-300 transition"
                            aria-label={UI_LABELS.VIEW_ANALYSIS}
                        >
                            <ViewIcon />
                        </button>
                        <button 
                            onClick={() => onDelete(item.id)} 
                            title={UI_LABELS.DELETE_ANALYSIS}
                            className="p-2 rounded-full text-gray-400 hover:bg-gray-600 hover:text-red-400 transition"
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
