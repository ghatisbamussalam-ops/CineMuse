
export enum WorkType {
  Auto = 'تلقائي',
  Film = 'فيلم',
  Series = 'مسلسل',
  Song = 'أغنية',
  Book = 'كتاب',
}

// Depth Enum removed in favor of explicit word count

export enum Technicality {
  Simple = 'مبسّط للجمهور العام',
  Academic = 'أكاديمي للمتخصصين',
}

export enum WritingStyle {
  Report = 'تقرير مُفصّل بعناوين',
  Essay = 'مقال تأملي سردي',
}

export enum GeoContext {
  Global = 'عالمي',
  Arab = 'عربي',
  Yemeni = 'يمني',
}

export enum Appendix {
    SimilarWorks = 'قائمة أعمال مشابهة',
    References = 'المراجع والمصادر',
    DiscussionQuestions = 'أسئلة نقاشية للجمهور',
}

export interface AnalysisPreferences {
  workName: string;
  workType: WorkType;
  analysisAngles: string[];
  wordCount: number; // Replaces depth
  technicality: Technicality;
  writingStyle: WritingStyle;
  geoContext: GeoContext;
  hideSpoilers: boolean;
  includeQuotes: boolean;
  appendices: Appendix[];
}

export interface HistoryItem {
  id: number;
  workName: string;
  analysisResult: string;
  timestamp: string;
}
