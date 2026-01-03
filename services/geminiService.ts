
import { GoogleGenAI } from "@google/genai";
import { AnalysisPreferences } from '../types';

const API_KEY = process.env.API_KEY;

function buildPrompt(preferences: AnalysisPreferences): string {
  const {
    workName,
    workType,
    analysisAngles,
    wordCount,
    technicality,
    writingStyle,
    geoContext,
    hideSpoilers,
    includeQuotes,
    appendices,
  } = preferences;

  return `
أنت ناقد سينمائي وأدبي وموسيقي وخبير ثقافي مرموق. مهمتك هي تقديم تحليل عميق واستثنائي باللغة العربية الفصيحة للعمل التالي: "${workName}".

يجب أن تلتزم التزامًا صارمًا بالتفضيلات التالية التي حددها المستخدم:

- **نوع العمل**: ${workType}. (إذا كان الخيار "تلقائي"، حدد النوع بنفسك بناءً على الاسم).
- **زوايا التحليل المختارة**: ${analysisAngles.join('، ')}. ركز تحليلك على هذه الزوايا بشكل أساسي وقدم رؤى غير تقليدية.
- **طول المقال المستهدف**: حوالي ${wordCount} كلمة. حاول الالتزام بهذا الطول لإشباع الموضوع حقه دون حشو أو إطالة غير مبررة.
- **الدرجة التقنية**: ${technicality}.
- **الأسلوب الكتابي**: ${writingStyle}.
- **السياق الجغرافي/الثقافي**: ${geoContext}. (أعطِ هذا السياق أهمية خاصة في تحليلك إن كان "عربي" أو "يمني").
- **إخفاء حرق الأحداث (Spoilers)**: ${hideSpoilers ? 'مفعّل. تجنب تمامًا كشف أي نقاط حاسمة في الحبكة.' : 'غير مفعّل.'}
- **إدراج اقتباسات**: ${includeQuotes ? 'مفعّل. أدرج اقتباسات أيقونية.' : 'غير مفعّل.'}
- **ملاحق إضافية مطلوبة**: ${appendices.length > 0 ? appendices.join('، ') : 'لا يوجد'}.

**هيكل الإخراج المطلوب:**

إذا كان العمل **فيلمًا**، استخدم الهيكل التالي بعناوين واضحة:
1.  **ملخص الفيلم وسياقه التاريخي**
2.  **تحليل الرموز البصرية والسردية الأساسية**
3.  **تفسير فلسفي للثيمات** (بناءً على الزوايا المختارة)
4.  **قراءة نقدية للأبعاد الاجتماعية والنفسية** (بناءً على الزوايا المختارة)
5.  **مناقشة الأسلوب الفني**
6.  **الربط بالسياق الثقافي والحياة اليومية** (خاصة إذا اختير سياق غير "عالمي")
7.  **أثر الفيلم على السينما والجمهور**
8.  **ملاحق** (إذا طُلبت)

إذا كان العمل **مسلسلاً**، استخدم الهيكل التالي بعناوين واضحة:
1.  **قصة المسلسل وعالمه الدرامي**
2.  **تحليل تطور الشخصيات عبر المواسم**
3.  **البناء السردي والإيقاع (Pacing)**
4.  **الثيمات الفلسفية والاجتماعية** (بناءً على الزوايا المختارة)
5.  **الأسلوب الإخراجي والبصري**
6.  **الأثر الثقافي ومكانته في تاريخ التلفزيون**
7.  **ملاحق** (إذا طُلبت)

إذا كان العمل **كتابًا**، استخدم الهيكل التالي بعناوين واضحة:
1.  **ملخص الكتاب وسياقه الأدبي/الفكري**
2.  **تحليل الأفكار المركزية والثيمات**
3.  **البناء السردي (للروايات) أو التسلسل المنطقي (للكتب الفكرية)**
4.  **تحليل الشخصيات (للأعمال الروائية) أو المنهجية والحجج (للكتب الفكرية والعملية)**
5.  **الأبعاد الفلسفية أو العملية** (بناءً على الزوايا المختارة)
6.  **الأثر الثقافي ومكانة الكتاب**
7.  **ملاحق** (إذا طُلبت)

إذا كان العمل **أغنية**، استخدم الهيكل التالي بعناوين واضحة:
1.  **سياق الأغنية وخلفيتها الفنية**
2.  **تحليل الكلمات والرموز الشعرية** (مع مراعاة مستوى التقنية)
3.  **التأويل النفسي والاجتماعي للنص الغنائي** (بناءً على الزوايا المختارة)
4.  **دلالات اللحن والصوت والأداء والتوزيع**
5.  **التأثير الثقافي والوجدان الجمعي**
6.  **ملاحق** (إذا طُلبت)

**متطلبات الجودة والأسلوب:**
-   **اللغة**: استخدم لغة عربية فصيحة، بليغة، وثرية بالمفردات.
-   **المنهجية**: قدم تحليلاً نوعياً يتجاوز السطحية.
-   **التنسيق**: استخدم Markdown بذكاء. استخدم Blockquotes (>) للاقتباسات أو النقاط المهمة.
-   **الإبداع**: استخدم قدراتك التحليلية العالية (Gemini 3 Pro) لربط النقاط التي قد تغيب عن المشاهد العادي.

في النهاية، أضف قسمًا أخيرًا بعنوان **"## الإعدادات المُطبّقة"** ولخّص فيه بوضوح كل التفضيلات التي اتبعتها.
`;
}

export const streamAnalysis = async (
    preferences: AnalysisPreferences,
    onChunk: (text: string) => void
): Promise<string> => {
    if (!API_KEY) {
        throw new Error("API key not found. Please set the API_KEY environment variable.");
    }
    
    if (!preferences.workName.trim()) {
        throw new Error("Work name cannot be empty.");
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const prompt = buildPrompt(preferences);

    try {
        const response = await ai.models.generateContentStream({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                // Adjust thinking budget based on requested word count to ensure enough tokens
                thinkingConfig: { thinkingBudget: preferences.wordCount > 1500 ? 2048 : 1024 }
            }
        });

        let fullText = '';
        for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
                fullText += text;
                onChunk(fullText);
            }
        }
        return fullText;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get analysis. Please try again later.");
    }
};
