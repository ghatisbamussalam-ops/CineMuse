
import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { UI_LABELS } from '../constants';

const HISTORY_STORAGE_KEY = 'cineMuseHistory';

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const handleClearHistory = () => {
    if (window.confirm(UI_LABELS.CLEAR_HISTORY_CONFIRM)) {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      setHistory([]);
      setSelectedItem(null);
    }
  };

  if (history.length === 0) {
    return (
      <div className="text-center bg-gray-800 p-8 rounded-lg shadow-2xl">
        <h2 className="text-3xl font-bold text-cyan-300 mb-4">{UI_LABELS.HISTORY_TITLE}</h2>
        <p className="text-gray-400">{UI_LABELS.NO_HISTORY}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 sm:p-8 rounded-lg shadow-2xl">
      <div className="flex justify-between items-center mb-6 border-b-2 border-cyan-700 pb-3">
        <h2 className="text-3xl font-bold text-cyan-300">{UI_LABELS.HISTORY_TITLE}</h2>
        <button
          onClick={handleClearHistory}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full text-sm transition-transform transform hover:scale-105"
        >
          {UI_LABELS.CLEAR_HISTORY}
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-6" style={{ minHeight: '60vh' }}>
        <aside className="md:w-1/3 lg:w-1/4">
          <ul className="space-y-2 h-full overflow-y-auto pr-2 max-h-[60vh]">
            {history.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-right p-3 rounded-md transition text-sm ${selectedItem?.id === item.id ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  <p className="font-semibold">{item.workName}</p>
                  <p className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleString('ar-EG')}</p>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="md:w-2/3 lg:w-3/4 bg-gray-900 p-6 rounded-lg overflow-y-auto max-h-[60vh]">
          {selectedItem ? (
            <MarkdownRenderer content={selectedItem.analysisResult} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-lg">{UI_LABELS.VIEW_ANALYSIS_PROMPT}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HistoryPage;
