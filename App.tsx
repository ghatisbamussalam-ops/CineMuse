import React, { useState, useEffect, useCallback } from 'react';
import {
  WorkType,
  AnalysisAngle,
  Depth,
  Technicality,
  WritingStyle,
  GeoContext,
  Appendix,
  AnalysisPreferences,
  HistoryItem,
} from './types';
import {
  UI_LABELS,
  LOADING_MESSAGES,
  WORK_TYPE_OPTIONS,
  ANALYSIS_ANGLE_OPTIONS,
  DEPTH_OPTIONS,
  TECHNICALITY_OPTIONS,
  WRITING_STYLE_OPTIONS,
  GEO_CONTEXT_OPTIONS,
  APPENDIX_OPTIONS,
  DEFAULT_PREFERENCES,
} from './constants';
import { generateAnalysis } from './services/geminiService';
import Spinner from './components/Spinner';
import MarkdownRenderer from './components/MarkdownRenderer';
import PreferenceSection from './components/PreferenceSection';
import HistoryPage from './components/HistoryPage';

const HISTORY_STORAGE_KEY = 'cineMuseHistory';
const MAX_HISTORY_ITEMS = 50;

function App() {
  const [view, setView] = useState<'main' | 'history'>('main');
  const [preferences, setPreferences] = useState<AnalysisPreferences>(DEFAULT_PREFERENCES);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentLoadingMessage(prev => {
          const currentIndex = LOADING_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
          return LOADING_MESSAGES[nextIndex];
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handlePreferenceChange = useCallback((field: keyof AnalysisPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleMultiSelectChange = (field: 'analysisAngles' | 'appendices', value: string) => {
    setPreferences(prev => {
      const currentValues = (prev[field] as string[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences.workName.trim()) {
      setError("الرجاء إدخال اسم العمل.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await generateAnalysis(preferences);
      setAnalysisResult(result);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        workName: preferences.workName,
        analysisResult: result,
        timestamp: new Date().toISOString(),
      };
      
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      const history: HistoryItem[] = storedHistory ? JSON.parse(storedHistory) : [];
      
      const newHistory = [newHistoryItem, ...history].slice(0, MAX_HISTORY_ITEMS);
      
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));

    } catch (err) {
      setError((err as Error).message || UI_LABELS.ERROR_MESSAGE_SUGGESTION);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-cyan-400 mb-2">{UI_LABELS.APP_TITLE}</h1>
          <p className="text-lg text-gray-400">{UI_LABELS.APP_DESCRIPTION}</p>
        </header>

        <nav className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-full p-1 flex gap-1">
            <button
              onClick={() => setView('main')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition ${view === 'main' ? 'bg-cyan-500 text-gray-900' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              {UI_LABELS.VIEW_ANALYZER}
            </button>
            <button
              onClick={() => setView('history')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition ${view === 'history' ? 'bg-cyan-500 text-gray-900' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              {UI_LABELS.VIEW_HISTORY}
            </button>
          </div>
        </nav>

        <main>
          {view === 'main' && (
            <>
              <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-2xl mb-12">
                <div className="mb-6">
                  <label htmlFor="workName" className="block text-lg font-semibold text-cyan-400 mb-2">{UI_LABELS.WORK_NAME_LABEL}</label>
                  <input
                    type="text"
                    id="workName"
                    value={preferences.workName}
                    onChange={(e) => handlePreferenceChange('workName', e.target.value)}
                    placeholder={UI_LABELS.WORK_NAME_PLACEHOLDER}
                    className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  />
                </div>

                <PreferenceSection title={UI_LABELS.WORK_TYPE_LABEL}>
                  {WORK_TYPE_OPTIONS.map(option => (
                    <button type="button" key={option} onClick={() => handlePreferenceChange('workType', option)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${preferences.workType === option ? 'bg-cyan-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}>
                      {option}
                    </button>
                  ))}
                </PreferenceSection>
                
                <PreferenceSection title={UI_LABELS.ANALYSIS_ANGLE_LABEL}>
                  {ANALYSIS_ANGLE_OPTIONS.map(option => (
                    <button type="button" key={option} onClick={() => handleMultiSelectChange('analysisAngles', option)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${preferences.analysisAngles.includes(option) ? 'bg-cyan-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}>
                      {option}
                    </button>
                  ))}
                </PreferenceSection>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <PreferenceSection title={UI_LABELS.DEPTH_LABEL}>
                        {DEPTH_OPTIONS.map(option => (
                            <button type="button" key={option} onClick={() => handlePreferenceChange('depth', option)}
                            className={`w-full px-4 py-2 rounded-md text-sm font-medium transition ${preferences.depth === option ? 'bg-cyan-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            {option}
                          </button>
                        ))}
                    </PreferenceSection>
                    <PreferenceSection title={UI_LABELS.TECHNICALITY_LABEL}>
                        {TECHNICALITY_OPTIONS.map(option => (
                            <button type="button" key={option} onClick={() => handlePreferenceChange('technicality', option)}
                            className={`w-full px-4 py-2 rounded-md text-sm font-medium transition ${preferences.technicality === option ? 'bg-cyan-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            {option}
                          </button>
                        ))}
                    </PreferenceSection>
                    <PreferenceSection title={UI_LABELS.WRITING_STYLE_LABEL}>
                        {WRITING_STYLE_OPTIONS.map(option => (
                            <button type="button" key={option} onClick={() => handlePreferenceChange('writingStyle', option)}
                            className={`w-full px-4 py-2 rounded-md text-sm font-medium transition ${preferences.writingStyle === option ? 'bg-cyan-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            {option}
                          </button>
                        ))}
                    </PreferenceSection>
                </div>

                <PreferenceSection title={UI_LABELS.GEO_CONTEXT_LABEL}>
                  {GEO_CONTEXT_OPTIONS.map(option => (
                    <button type="button" key={option} onClick={() => handlePreferenceChange('geoContext', option)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${preferences.geoContext === option ? 'bg-cyan-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}>
                      {option}
                    </button>
                  ))}
                </PreferenceSection>

                <PreferenceSection title={UI_LABELS.SENSITIVE_HINTS_LABEL}>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={preferences.hideSpoilers} onChange={(e) => handlePreferenceChange('hideSpoilers', e.target.checked)} className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 rounded text-cyan-500 focus:ring-cyan-600" />
                        <span>{UI_LABELS.HIDE_SPOILERS_LABEL}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={preferences.includeQuotes} onChange={(e) => handlePreferenceChange('includeQuotes', e.target.checked)} className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 rounded text-cyan-500 focus:ring-cyan-600" />
                        <span>{UI_LABELS.INCLUDE_QUOTES_LABEL}</span>
                    </label>
                </PreferenceSection>

                <PreferenceSection title={UI_LABELS.APPENDICES_LABEL}>
                  {APPENDIX_OPTIONS.map(option => (
                    <button type="button" key={option} onClick={() => handleMultiSelectChange('appendices', option)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${preferences.appendices.includes(option) ? 'bg-cyan-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}>
                      {option}
                    </button>
                  ))}
                </PreferenceSection>

                <div className="mt-8 text-center">
                    <button type="submit" disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? 'جاري التحليل...' : UI_LABELS.SUBMIT_BUTTON}
                    </button>
                </div>
              </form>

              {isLoading && (
                <div className="flex flex-col items-center justify-center bg-gray-800 p-8 rounded-lg shadow-2xl">
                  <Spinner />
                  <p className="mt-4 text-cyan-400 font-semibold">{currentLoadingMessage}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
                  <strong className="font-bold">{UI_LABELS.ERROR_MESSAGE_TITLE}: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {analysisResult && (
                <section className="bg-gray-800 p-8 rounded-lg shadow-2xl mt-12">
                  <h2 className="text-3xl font-bold text-cyan-300 mb-6 border-b-2 border-cyan-700 pb-3">{UI_LABELS.RESULT_TITLE}</h2>
                  <MarkdownRenderer content={analysisResult} />
                </section>
              )}
            </>
          )}

          {view === 'history' && <HistoryPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
