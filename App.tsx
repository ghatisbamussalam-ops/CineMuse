import React, { useState, useCallback, useEffect } from 'react';
import { AnalysisPreferences, WorkType, AnalysisAngle, Depth, Technicality, WritingStyle, GeoContext, Appendix } from './types';
import { UI_LABELS, DEFAULT_PREFERENCES, WORK_TYPE_OPTIONS, ANALYSIS_ANGLE_OPTIONS, DEPTH_OPTIONS, TECHNICALITY_OPTIONS, WRITING_STYLE_OPTIONS, GEO_CONTEXT_OPTIONS, APPENDIX_OPTIONS, LOADING_MESSAGES } from './constants';
import { generateAnalysis } from './services/geminiService';
import Spinner from './components/Spinner';
import MarkdownRenderer from './components/MarkdownRenderer';
import PreferenceSection from './components/PreferenceSection';

const App: React.FC = () => {
    const [preferences, setPreferences] = useState<AnalysisPreferences>(DEFAULT_PREFERENCES);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string>('');
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

    useEffect(() => {
        let interval: number;
        if (isLoading) {
            interval = window.setInterval(() => {
                setLoadingMessageIndex(prevIndex => (prevIndex + 1) % LOADING_MESSAGES.length);
            }, 2500); // Change message every 2.5 seconds
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isLoading]);

    const handlePreferenceChange = <K extends keyof AnalysisPreferences,>(
        key: K,
        value: AnalysisPreferences[K]
    ) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    const handleMultiSelectChange = (key: 'analysisAngles' | 'appendices', value: AnalysisAngle | Appendix) => {
        setPreferences(prev => {
            const currentValues = prev[key] as (AnalysisAngle | Appendix)[];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(item => item !== value)
                : [...currentValues, value];
            return { ...prev, [key]: newValues };
        });
    };

    const handleAnalysis = useCallback(async () => {
        if (!preferences.workName.trim()) {
            setError('الرجاء إدخال اسم الفيلم أو الأغنية.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult('');
        setLoadingMessageIndex(0);
        try {
            const analysisResult = await generateAnalysis(preferences);
            setResult(analysisResult);
        } catch (e) {
            const err = e as Error;
            setError(`${UI_LABELS.ERROR_MESSAGE_TITLE}: ${err.message}. ${UI_LABELS.ERROR_MESSAGE_SUGGESTION}`);
        } finally {
            setIsLoading(false);
        }
    }, [preferences]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-8 flex justify-center">
            <main className="w-full max-w-6xl">
                <header className="text-center mb-10">
                    <h1 className="text-5xl font-bold text-cyan-400">{UI_LABELS.APP_TITLE}</h1>
                    <p className="text-gray-400 mt-2">{UI_LABELS.APP_DESCRIPTION}</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls Section */}
                    <div className="lg:col-span-1 bg-gray-800/50 p-6 rounded-lg border border-gray-700 h-fit">
                        <div className="mb-6">
                            <label htmlFor="workName" className="block text-lg font-semibold text-cyan-400 mb-3">{UI_LABELS.WORK_NAME_LABEL}</label>
                            <input
                                id="workName"
                                type="text"
                                value={preferences.workName}
                                onChange={(e) => handlePreferenceChange('workName', e.target.value)}
                                placeholder={UI_LABELS.WORK_NAME_PLACEHOLDER}
                                className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                            />
                        </div>

                        {/* Preferences */}
                        <PreferenceSection title={UI_LABELS.WORK_TYPE_LABEL}>
                            {WORK_TYPE_OPTIONS.map(opt => (
                                <button key={opt} onClick={() => handlePreferenceChange('workType', opt)} className={`px-4 py-1.5 text-sm rounded-full transition ${preferences.workType === opt ? 'bg-cyan-500 text-white shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}>{opt}</button>
                            ))}
                        </PreferenceSection>

                        <PreferenceSection title={UI_LABELS.ANALYSIS_ANGLE_LABEL}>
                             {ANALYSIS_ANGLE_OPTIONS.map(opt => (
                                <button key={opt} onClick={() => handleMultiSelectChange('analysisAngles', opt)} className={`px-3 py-1.5 text-sm rounded-md transition flex items-center gap-2 ${preferences.analysisAngles.includes(opt) ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                    {opt}
                                </button>
                            ))}
                        </PreferenceSection>

                        <PreferenceSection title={UI_LABELS.DEPTH_LABEL}>
                            {DEPTH_OPTIONS.map(opt => (
                                <button key={opt} onClick={() => handlePreferenceChange('depth', opt)} className={`px-4 py-1.5 text-sm rounded-full transition ${preferences.depth === opt ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{opt}</button>
                            ))}
                        </PreferenceSection>
                         
                        <PreferenceSection title={UI_LABELS.WRITING_STYLE_LABEL}>
                            {WRITING_STYLE_OPTIONS.map(opt => (
                                <button key={opt} onClick={() => handlePreferenceChange('writingStyle', opt)} className={`px-3 py-1.5 text-sm rounded-md transition flex items-center ${preferences.writingStyle === opt ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{opt}</button>
                            ))}
                        </PreferenceSection>
                        
                        <PreferenceSection title={UI_LABELS.TECHNICALITY_LABEL}>
                             {TECHNICALITY_OPTIONS.map(opt => (
                                <button key={opt} onClick={() => handlePreferenceChange('technicality', opt)} className={`px-3 py-1.5 text-sm rounded-md transition flex items-center ${preferences.technicality === opt ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{opt}</button>
                            ))}
                        </PreferenceSection>
                        
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-cyan-400 mb-3">{UI_LABELS.SENSITIVE_HINTS_LABEL}</h3>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-3 bg-gray-700 rounded-md cursor-pointer">
                                    <span>{UI_LABELS.HIDE_SPOILERS_LABEL}</span>
                                    <input type="checkbox" checked={preferences.hideSpoilers} onChange={e => handlePreferenceChange('hideSpoilers', e.target.checked)} className="sr-only peer" />
                                    <div className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                </label>
                                <label className="flex items-center justify-between p-3 bg-gray-700 rounded-md cursor-pointer">
                                    <span>{UI_LABELS.INCLUDE_QUOTES_LABEL}</span>
                                    <input type="checkbox" checked={preferences.includeQuotes} onChange={e => handlePreferenceChange('includeQuotes', e.target.checked)} className="sr-only peer" />
                                    <div className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                </label>
                            </div>
                        </div>

                        <PreferenceSection title={UI_LABELS.APPENDICES_LABEL}>
                            {APPENDIX_OPTIONS.map(opt => (
                                <button key={opt} onClick={() => handleMultiSelectChange('appendices', opt)} className={`px-3 py-1.5 text-sm rounded-md transition flex items-center gap-2 ${preferences.appendices.includes(opt) ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                    {opt}
                                </button>
                            ))}
                        </PreferenceSection>

                        <button
                            onClick={handleAnalysis}
                            disabled={isLoading}
                            className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg flex items-center justify-center"
                        >
                            {isLoading ? <Spinner /> : UI_LABELS.SUBMIT_BUTTON}
                        </button>
                    </div>

                    {/* Result Section */}
                    <div className="lg:col-span-2 bg-gray-800/50 p-6 rounded-lg border border-gray-700 min-h-[500px]">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="relative w-24 h-24 mb-6">
                                    <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
                                    <div className="absolute inset-2 border-4 border-cyan-500/30 rounded-full animate-ping"></div>
                                    <svg className="w-full h-full text-cyan-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-lg text-cyan-300 transition-opacity duration-500" key={loadingMessageIndex}>
                                    {LOADING_MESSAGES[loadingMessageIndex]}
                                </p>
                            </div>
                        )}
                        {error && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-red-400 bg-red-900/20 p-4 rounded-md">
                                <h3 className="text-xl font-bold mb-2">{UI_LABELS.ERROR_MESSAGE_TITLE}</h3>
                                <p>{error}</p>
                            </div>
                        )}
                        {result && !isLoading && (
                            <div>
                                <h2 className="text-3xl font-bold mb-6 text-cyan-400">{UI_LABELS.RESULT_TITLE}</h2>
                                <MarkdownRenderer content={result} />
                            </div>
                        )}
                         {!isLoading && !error && !result && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                                <p>ستظهر نتائج التحليل هنا بعد ملء الحقول والضغط على زر التحليل.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;