import { WorkType, AnalysisAngle, Depth, Technicality, WritingStyle, GeoContext, Appendix, AnalysisPreferences } from './types';

export const UI_LABELS = {
    APP_TITLE: "CineMuse",
    APP_DESCRIPTION: "أدخل اسم فيلم أو أغنية، اختر تفضيلاتك، واحصل على تحليل ثقافي عميق.",
    WORK_NAME_LABEL: "اسم الفيلم أو الأغنية",
    WORK_NAME_PLACEHOLDER: "مثال: فيلم Amélie أو أغنية Brothers in Arms",
    WORK_TYPE_LABEL: "نوع العمل",
    ANALYSIS_ANGLE_LABEL: "زاوية التحليل (اختر ما تشاء)",
    DEPTH_LABEL: "العمق",
    TECHNICALITY_LABEL: "درجة التقنية الأسلوبية",
    WRITING_STYLE_LABEL: "الأسلوب الكتابي",
    GEO_CONTEXT_LABEL: "السياق الجغرافي/الثقافي (اختياري)",
    SENSITIVE_HINTS_LABEL: "التلميحات الحساسة",
    HIDE_SPOILERS_LABEL: "إخفاء الحرق (Spoilers)",
    INCLUDE_QUOTES_LABEL: "إدراج اقتباسات قصيرة",
    APPENDICES_LABEL: "ملاحق إضافية",
    SUBMIT_BUTTON: "ابدأ التحليل",
    ERROR_MESSAGE_TITLE: "حدث خطأ",
    ERROR_MESSAGE_SUGGESTION: "يرجى المحاولة مرة أخرى. تأكد من أن الاسم الذي أدخلته واضح.",
    RESULT_TITLE: "نتائج التحليل:",
};

export const LOADING_MESSAGES = [
    "جاري استحضار الناقد السينمائي...",
    "يتم الآن تحليل الرموز السيميائية...",
    "صياغة الرؤى الفلسفية...",
    "البحث في أرشيف الألحان والكلمات...",
    "لحظات قليلة ويكتمل التحليل...",
];

export const WORK_TYPE_OPTIONS: WorkType[] = [WorkType.Auto, WorkType.Film, WorkType.Song];
export const ANALYSIS_ANGLE_OPTIONS: AnalysisAngle[] = Object.values(AnalysisAngle);
export const DEPTH_OPTIONS: Depth[] = Object.values(Depth);
export const TECHNICALITY_OPTIONS: Technicality[] = Object.values(Technicality);
export const WRITING_STYLE_OPTIONS: WritingStyle[] = Object.values(WritingStyle);
export const GEO_CONTEXT_OPTIONS: GeoContext[] = Object.values(GeoContext);
export const APPENDIX_OPTIONS: Appendix[] = Object.values(Appendix);

export const DEFAULT_PREFERENCES: AnalysisPreferences = {
    workName: '',
    workType: WorkType.Auto,
    analysisAngles: [AnalysisAngle.Philosophical, AnalysisAngle.Psychological],
    depth: Depth.Medium,
    technicality: Technicality.Simple,
    writingStyle: WritingStyle.Report,
    geoContext: GeoContext.Global,
    hideSpoilers: true,
    includeQuotes: false,
    appendices: [Appendix.SimilarWorks],
};