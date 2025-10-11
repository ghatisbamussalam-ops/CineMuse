import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
import { generateAnalysis } from './services/geminiService';
import MarkdownRenderer from './components/MarkdownRenderer';
import PreferenceSection from './components/PreferenceSection';
import Spinner from './components/Spinner';
import ShareOptions from './components/ShareOptions';
import HistoryPage from './components/HistoryPage';
import { UI_LABELS } from './constants';

const initialPreferences: AnalysisPreferences = {
  workName: '',
  workType: WorkType.Auto,
  analysisAngles: [AnalysisAngle.Philosophical],
  depth: Depth.Medium,
  technicality: Technicality.Simple,
  writingStyle: WritingStyle.Essay,
  geoContext: GeoContext.Global,
  hideSpoilers: false,
  includeQuotes: false,
  appendices: [],
};

const RadioOption: React.FC<{ name: string; value: string; label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ name, value, label, checked, onChange }) => (
    <label className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 cursor-pointer transition has-[:checked]:bg-cyan-600 has-[:checked]:text-white">
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="hidden" />
        <span className="text-sm font-medium">{label}</span>
    </label>
);

const CheckboxOption: React.FC<{ value: string; label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ value, label, checked, onChange }) => (
     <label className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 cursor-pointer transition has-[:checked]:bg-cyan-600 has-[:checked]:text-white">
        <input type="checkbox" value={value} checked={checked} onChange={onChange} className="hidden" />
        <span className="text-sm font-medium">{label}</span>
    </label>
);

const App: React.FC = () => {
    const [preferences, setPreferences] = useState<AnalysisPreferences>(initialPreferences);
    const [analysisResult, setAnalysisResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
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
        setPreferences(prev => ({ ...prev, [field]: value }));
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
        setError(null);
        setAnalysisResult('');
        window.scrollTo(0, 0);

        try {
            const result = await generateAnalysis(preferences);
            setAnalysisResult(result);
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
        }
    };
    
    const handleExportPDF = async () => {
        if (!resultRef.current) return;
        const analysisElement = resultRef.current;
        const canvas = await html2canvas(analysisElement, { backgroundColor: '#1a202c', scale: 2 });
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
        setPreferences(initialPreferences);
        setError(null);
    }

    const renderAnalysisForm = () => (
        <form onSubmit={handleSubmit} className="space-y-8 bg-gray-800 p-6 rounded-lg shadow-lg">
            <div>
                <label htmlFor="workName" className="block text-lg font-semibold text-cyan-400 mb-3">{UI_LABELS.WORK_NAME_LABEL}</label>
                <input
                    id="workName"
                    type="text"
                    value={preferences.workName}
                    onChange={(e) => handlePreferenceChange('workName', e.target.value)}
                    placeholder={UI_LABELS.WORK_NAME_PLACEHOLDER}
                    className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    required
                />
            </div>

            <PreferenceSection title="نوع العمل (اختياري)">
                {Object.values(WorkType).map(value => (
                    <RadioOption key={value} name="workType" value={value} label={value} checked={preferences.workType === value} onChange={(e) => handlePreferenceChange('workType', e.target.value)} />
                ))}
            </PreferenceSection>
            
            <PreferenceSection title="زوايا التحليل (اختر واحدة أو أكثر)">
                {Object.values(AnalysisAngle).map(value => (
                    <CheckboxOption key={value} value={value} label={value} checked={preferences.analysisAngles.includes(value)} onChange={() => handleMultiSelectChange('analysisAngles', value)} />
                ))}
            </PreferenceSection>
            
            <PreferenceSection title="عمق التحليل">
                {Object.values(Depth).map(value => (
                    <RadioOption key={value} name="depth" value={value} label={value} checked={preferences.depth === value} onChange={(e) => handlePreferenceChange('depth', e.target.value)} />
                ))}
            </PreferenceSection>

            <PreferenceSection title="الدرجة التقنية">
                {Object.values(Technicality).map(value => (
                    <RadioOption key={value} name="technicality" value={value} label={value} checked={preferences.technicality === value} onChange={(e) => handlePreferenceChange('technicality', e.target.value)} />
                ))}
            </PreferenceSection>

             <PreferenceSection title="الأسلوب الكتابي">
                {Object.values(WritingStyle).map(value => (
                    <RadioOption key={value} name="writingStyle" value={value} label={value} checked={preferences.writingStyle === value} onChange={(e) => handlePreferenceChange('writingStyle', e.target.value)} />
                ))}
            </PreferenceSection>

            <PreferenceSection title="السياق الجغرافي/الثقافي">
                {Object.values(GeoContext).map(value => (
                    <RadioOption key={value} name="geoContext" value={value} label={value} checked={preferences.geoContext === value} onChange={(e) => handlePreferenceChange('geoContext', e.target.value)} />
                ))}
            </PreferenceSection>

             <PreferenceSection title="خيارات إضافية">
                <CheckboxOption value="hideSpoilers" label={UI_LABELS.SPOILERS} checked={preferences.hideSpoilers} onChange={(e) => handlePreferenceChange('hideSpoilers', e.target.checked)} />
                <CheckboxOption value="includeQuotes" label={UI_LABELS.QUOTES} checked={preferences.includeQuotes} onChange={(e) => handlePreferenceChange('includeQuotes', e.target.checked)} />
            </PreferenceSection>

            <PreferenceSection title="ملاحق إضافية">
                {Object.values(Appendix).map(value => (
                    <CheckboxOption key={value} value={value} label={value} checked={preferences.appendices.includes(value)} onChange={() => handleMultiSelectChange('appendices', value)} />
                ))}
            </PreferenceSection>

            <div className="pt-4 border-t border-gray-700">
                <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed">
                    {isLoading ? <><Spinner /> {UI_LABELS.GENERATING_ANALYSIS}</> : UI_LABELS.GENERATE_ANALYSIS}
                </button>
            </div>
        </form>
    );

    const renderResultView = () => (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg relative animate-fade-in">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <button onClick={handleClearAnalysis} className="px-4 py-2 rounded-full bg-gray-700 text-gray-300 hover:bg-cyan-600 hover:text-white transition text-sm font-medium">
                    {UI_LABELS.CLEAR_ANALYSIS}
                </button>
                <ShareOptions analysisText={analysisResult} onExportPDF={handleExportPDF} />
            </div>
            <div ref={resultRef} className="pt-12 px-4">
                <h2 className="text-3xl font-bold text-cyan-300 mb-6 border-b-2 border-cyan-800 pb-3">
                    {UI_LABELS.ANALYSIS_RESULT_TITLE}: {preferences.workName}
                </h2>
                <MarkdownRenderer content={analysisResult} />
            </div>
        </div>
    );
    
    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
            <main className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-cyan-400 tracking-tight">{UI_LABELS.APP_TITLE}</h1>
                    <p className="text-lg text-gray-400 mt-2">{UI_LABELS.APP_DESCRIPTION}</p>
                </header>

                <div className="flex justify-center mb-6 bg-gray-800 rounded-lg p-1 max-w-sm mx-auto">
                    <button onClick={() => setActiveTab('analysis')} className={`w-1/2 py-2 rounded-md font-semibold transition ${activeTab === 'analysis' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>{UI_LABELS.ANALYSIS_TAB}</button>
                    <button onClick={() => setActiveTab('history')} className={`w-1/2 py-2 rounded-md font-semibold transition ${activeTab === 'history' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>{UI_LABELS.HISTORY_TAB}</button>
                </div>

                {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-center">{error}</div>}

                {activeTab === 'analysis' && (
                    isLoading 
                        ? <div className="flex flex-col items-center justify-center gap-4 py-20"><Spinner /> <p>{UI_LABELS.GENERATING_ANALYSIS}</p></div>
                        : analysisResult 
                            ? renderResultView() 
                            : renderAnalysisForm()
                )}

                {activeTab === 'history' && <HistoryPage history={history} onView={handleViewHistoryItem} onDelete={handleDeleteHistoryItem} />}

            </main>
        </div>
    );
};

export default App;
