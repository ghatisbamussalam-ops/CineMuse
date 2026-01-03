
import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  WorkType,
  Technicality,
  WritingStyle,
  GeoContext,
  Appendix,
  AnalysisPreferences,
  HistoryItem,
} from './types';
import { streamAnalysis } from './services/geminiService';
import MarkdownRenderer from './components/MarkdownRenderer';
import PreferenceSection from './components/PreferenceSection';
import Spinner from './components/Spinner';
import ShareOptions from './components/ShareOptions';
import HistoryPage from './components/HistoryPage';
import { UI_LABELS, WORK_TYPE_ANGLES } from './constants';

const initialPreferences: AnalysisPreferences = {
  workName: '',
  workType: WorkType.Auto,
  // Default to the first angle of the Auto type
  analysisAngles: [WORK_TYPE_ANGLES[WorkType.Auto][0]],
  wordCount: 1000,
  technicality: Technicality.Simple,
  writingStyle: WritingStyle.Essay,
  geoContext: GeoContext.Global,
  hideSpoilers: false,
  includeQuotes: false,
  appendices: [],
};

interface SelectableCardProps {
    label: string;
    selected: boolean;
    onClick: () => void;
    type?: 'radio' | 'checkbox';
}

const SelectableCard: React.FC<SelectableCardProps> = ({ label, selected, onClick, type = 'radio' }) => (
    <div
        onClick={onClick}
        className={`
            cursor-pointer relative overflow-hidden rounded-xl border p-4 transition-all duration-300 group
            ${selected 
                ? 'border-cyan-500 bg-cyan-900/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                : 'border-gray-700 bg-gray-800/40 hover:border-gray-500 hover:bg-gray-700/60'
            }
        `}
    >
        <div className="flex items-center justify-between gap-2">
            <span className={`font-medium text-sm sm:text-base transition-colors ${selected ? 'text-cyan-100' : 'text-gray-400 group-hover:text-gray-200'}`}>{label}</span>
            <div className={`
                w-5 h-5 min-w-[1.25rem] rounded-full border flex items-center justify-center transition-all duration-300
                ${selected ? 'border-cyan-500 bg-cyan-500' : 'border-gray-600 group-hover:border-gray-500'}
            `}>
                {selected && (
                    type === 'radio' 
                    ? <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                    : <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                )}
            </div>
        </div>
    </div>
);

const App: React.FC = () => {
    const [preferences, setPreferences] = useState<AnalysisPreferences>(initialPreferences);
    const [analysisResult, setAnalysisResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [activeTab, setActiveTab] = useState<'analysis' | 'history'>('analysis');
    const resultRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      try {
        const storedHistory = localStorage.getItem('analysisHistory');
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      } catch (e) {
        console.error("Failed to load history from localStorage", e);
      }
    }, []);
  
    useEffect(() => {
      try {
        localStorage.setItem('analysisHistory', JSON.stringify(history));
      } catch (e) {
        console.error("Failed to save history to localStorage", e);
      }
    }, [history]);

    const handlePreferenceChange = (field: keyof AnalysisPreferences, value: any) => {
        setPreferences(prev => {
            // If changing work type, reset specific angles to default for that type
            if (field === 'workType') {
                const newWorkType = value as WorkType;
                return { 
                    ...prev, 
                    [field]: value,
                    // Auto-select the first angle of the new type to avoid empty selection
                    analysisAngles: [WORK_TYPE_ANGLES[newWorkType][0]] 
                };
            }
            return { ...prev, [field]: value };
        });
    };

    const handleMultiSelectChange = (field: 'analysisAngles' | 'appendices', value: any) => {
        setPreferences(prev => {
            const currentValues = prev[field] as string[];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [field]: newValues };
        });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!preferences.workName.trim()) {
            setError('الرجاء إدخال اسم العمل.');
            return;
        }
        setIsLoading(true);
        setIsStreaming(true);
        setError(null);
        setAnalysisResult('');
        window.scrollTo(0, 0);

        try {
            const result = await streamAnalysis(preferences, (text) => {
                setAnalysisResult(text);
                setIsLoading(false); // Stop "loading" spinner once text starts appearing
            });
            
            const newHistoryItem: HistoryItem = {
                id: Date.now(),
                workName: preferences.workName,
                analysisResult: result,
                timestamp: new Date().toLocaleString('ar-EG'),
            };
            setHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]);

        } catch (err: any) {
            setError(err.message || 'حدث خطأ غير متوقع.');
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
        }
    };
    
    const handleExportPDF = async () => {
        if (!resultRef.current) return;
        const analysisElement = resultRef.current;
        // Adjust background for PDF capture
        const canvas = await html2canvas(analysisElement, { 
            backgroundColor: '#111827', // gray-900
            scale: 2 
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }
        pdf.save(`${preferences.workName}_analysis.pdf`);
    };

    const handleViewHistoryItem = (item: HistoryItem) => {
        setAnalysisResult(item.analysisResult);
        setPreferences(prev => ({ ...prev, workName: item.workName }));
        setActiveTab('analysis');
        window.scrollTo(0, 0);
    };

    const handleDeleteHistoryItem = (id: number) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    };

    const handleClearAnalysis = () => {
        setAnalysisResult('');
        setIsLoading(false);
        setIsStreaming(false);
        setError(null);
    }

    // Get current available angles based on workType
    const currentAngles = WORK_TYPE_ANGLES[preferences.workType];

    const renderAnalysisForm = () => (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
            <div className="bg-gray-800/40 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-xl">
                <label htmlFor="workName" className="block text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">{UI_LABELS.WORK_NAME_LABEL}</label>
                <div className="relative group">
                    <input
                        id="workName"
                        type="text"
                        value={preferences.workName}
                        onChange={(e) => handlePreferenceChange('workName', e.target.value)}
                        placeholder={UI_LABELS.WORK_NAME_PLACEHOLDER}
                        className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-xl px-5 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        required
                    />
                    <div className="absolute inset-0 rounded-xl pointer-events-none border border-transparent group-hover:border-gray-600 transition-colors"></div>
                </div>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-xl space-y-8">
                <PreferenceSection title="نوع العمل (اختياري)">
                    {Object.values(WorkType).map(value => (
                        <SelectableCard key={value} label={value} selected={preferences.workType === value} onClick={() => handlePreferenceChange('workType', value)} />
                    ))}
                </PreferenceSection>
                
                <PreferenceSection title="زوايا التحليل (اختر واحدة أو أكثر)">
                    {currentAngles.map(value => (
                        <SelectableCard 
                            key={value} 
                            label={value} 
                            selected={preferences.analysisAngles.includes(value)} 
                            onClick={() => handleMultiSelectChange('analysisAngles', value)} 
                            type="checkbox" 
                        />
                    ))}
                </PreferenceSection>
                
                <PreferenceSection title={UI_LABELS.WORD_COUNT_LABEL}>
                    <div className="col-span-full bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                        <div className="flex justify-between items-end mb-6">
                            <span className="text-gray-400 text-sm font-medium">300</span>
                            <div className="text-center">
                                <span className="block text-3xl font-bold text-cyan-400 tabular-nums">{preferences.wordCount}</span>
                                <span className="text-gray-500 text-xs">{UI_LABELS.WORDS}</span>
                            </div>
                            <span className="text-gray-400 text-sm font-medium">3000</span>
                        </div>
                        <input 
                            type="range" 
                            min="300" 
                            max="3000" 
                            step="100" 
                            value={preferences.wordCount}
                            onChange={(e) => handlePreferenceChange('wordCount', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                         <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>|</span>
                            <span>|</span>
                            <span>|</span>
                            <span>|</span>
                            <span>|</span>
                        </div>
                    </div>
                </PreferenceSection>

                <PreferenceSection title="الدرجة التقنية">
                    {Object.values(Technicality).map(value => (
                        <SelectableCard key={value} label={value} selected={preferences.technicality === value} onClick={() => handlePreferenceChange('technicality', value)} />
                    ))}
                </PreferenceSection>

                <PreferenceSection title="الأسلوب الكتابي">
                    {Object.values(WritingStyle).map(value => (
                        <SelectableCard key={value} label={value} selected={preferences.writingStyle === value} onClick={() => handlePreferenceChange('writingStyle', value)} />
                    ))}
                </PreferenceSection>

                <PreferenceSection title="السياق الجغرافي/الثقافي">
                    {Object.values(GeoContext).map(value => (
                        <SelectableCard key={value} label={value} selected={preferences.geoContext === value} onClick={() => handlePreferenceChange('geoContext', value)} />
                    ))}
                </PreferenceSection>

                <PreferenceSection title="خيارات إضافية">
                     <SelectableCard label={UI_LABELS.SPOILERS} selected={preferences.hideSpoilers} onClick={() => handlePreferenceChange('hideSpoilers', !preferences.hideSpoilers)} type="checkbox" />
                     <SelectableCard label={UI_LABELS.QUOTES} selected={preferences.includeQuotes} onClick={() => handlePreferenceChange('includeQuotes', !preferences.includeQuotes)} type="checkbox" />
                </PreferenceSection>

                <PreferenceSection title="ملاحق إضافية">
                    {Object.values(Appendix).map(value => (
                        <SelectableCard key={value} label={value} selected={preferences.appendices.includes(value)} onClick={() => handleMultiSelectChange('appendices', value)} type="checkbox" />
                    ))}
                </PreferenceSection>
            </div>

            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={isLoading || isStreaming} 
                    className="
                        w-full group relative flex justify-center items-center gap-3 
                        bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 
                        text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25 
                        disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none
                    "
                >
                    {(isLoading) ? <><Spinner /> {UI_LABELS.GENERATING_ANALYSIS}</> : 
                        isStreaming ? <><Spinner /> جاري الكتابة...</> :
                        <>
                            <span className="text-lg">{UI_LABELS.GENERATE_ANALYSIS}</span>
                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </>
                    }
                </button>
            </div>
        </form>
    );

    const renderResultView = () => (
        <div className="bg-gray-800/60 backdrop-blur-md p-8 rounded-2xl shadow-2xl relative animate-fade-in border border-gray-700">
            <div className="absolute top-6 left-6 z-10 flex gap-3">
                {!isStreaming && (
                     <button onClick={handleClearAnalysis} className="px-4 py-2 rounded-full bg-gray-700/80 text-gray-300 hover:bg-cyan-600 hover:text-white transition text-sm font-medium backdrop-blur-sm border border-gray-600 hover:border-cyan-500">
                        {UI_LABELS.CLEAR_ANALYSIS}
                    </button>
                )}
                <ShareOptions analysisText={analysisResult} onExportPDF={handleExportPDF} />
            </div>
            <div ref={resultRef} className="pt-12 px-2 sm:px-6">
                <div className="mb-10 text-center border-b border-gray-700 pb-8">
                    <span className="text-cyan-500 font-medium tracking-wider text-sm uppercase mb-2 block">{UI_LABELS.ANALYSIS_RESULT_TITLE}</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                        {preferences.workName}
                    </h2>
                </div>
                {/* We can show a partial spinner if it's taking long to start, but isStreaming covers the button state */}
                {isLoading && (
                    <div className="flex justify-center py-10">
                        <Spinner />
                    </div>
                )}
                <MarkdownRenderer content={analysisResult} isStreaming={isStreaming} />
            </div>
        </div>
    );
    
    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black text-gray-200 p-4 sm:p-6 lg:p-10 font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
            <main className="max-w-5xl mx-auto">
                <header className="text-center mb-12 animate-fade-in-down">
                    <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 tracking-tight pb-2">{UI_LABELS.APP_TITLE}</h1>
                    <p className="text-xl text-gray-400 mt-4 max-w-2xl mx-auto leading-relaxed">{UI_LABELS.APP_DESCRIPTION}</p>
                </header>

                <div className="flex justify-center mb-10">
                    <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-1.5 shadow-lg border border-gray-700/50 inline-flex w-full max-w-md">
                        <button disabled={isStreaming} onClick={() => setActiveTab('analysis')} className={`flex-1 py-3 rounded-lg font-bold text-sm sm:text-base transition-all duration-200 ${activeTab === 'analysis' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'} disabled:opacity-50`}>{UI_LABELS.ANALYSIS_TAB}</button>
                        <button disabled={isStreaming} onClick={() => setActiveTab('history')} className={`flex-1 py-3 rounded-lg font-bold text-sm sm:text-base transition-all duration-200 ${activeTab === 'history' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'} disabled:opacity-50`}>{UI_LABELS.HISTORY_TAB}</button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl mb-8 text-center backdrop-blur-sm animate-pulse">
                        <p className="font-medium flex items-center justify-center gap-2">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                             {error}
                        </p>
                    </div>
                )}

                {activeTab === 'analysis' && (
                     (analysisResult || isLoading || isStreaming) 
                        ? renderResultView() 
                        : renderAnalysisForm()
                )}

                {activeTab === 'history' && <HistoryPage history={history} onView={handleViewHistoryItem} onDelete={handleDeleteHistoryItem} />}

            </main>
        </div>
    );
};

export default App;
