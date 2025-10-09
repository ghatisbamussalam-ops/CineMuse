export enum WorkType {
  Auto = 'تلقائي',
  Film = 'فيلم',
  Song = 'أغنية',
}

export enum AnalysisAngle {
  Philosophical = 'فلسفي',
  Psychological = 'نفسي',
  Social = 'اجتماعي',
  Artistic = 'فني/جمالي',
  Semiotic = 'سيميائي (تحليل رموز)',
  Production = 'إنتاجي/صناعي',
}

export enum Depth {
  Concise = 'مختصر',
  Medium = 'متوسط',
  InDepth = 'متعمق',
}

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
  analysisAngles: AnalysisAngle[];
  depth: Depth;
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
