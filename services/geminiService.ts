import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT_AR, SYSTEM_PROMPT_EN } from '../constants';
import { Language } from '../types';

let client: GoogleGenAI | null = null;

export const initializeGemini = (apiKey: string) => {
  console.log("initializeGemini called with key:", apiKey ? "✓ Present" : "✗ Missing");
  if (!apiKey) {
    console.warn("Gemini API key is empty");
    return;
  }
  try {
    client = new GoogleGenAI({ apiKey });
    console.log("✓ Gemini initialized successfully");
  } catch (error) {
    console.error("✗ Failed to initialize Gemini:", error);
    throw error;
  }
};

export const getGeminiClient = () => client;

/**
 * Send message to Gemini with optional system prompt and context
 */
export const sendMessageToGemini = async (
  message: string,
  imageBase64?: string,
  language: Language = 'ar',
  lessonContext?: string
): Promise<string> => {
  console.log("sendMessageToGemini called:", { message: message.substring(0, 50), hasImage: !!imageBase64, language });
  
  if (!client) {
    const localized = (ar: string, en: string) => (language === 'ar' ? ar : en);
    const errorMsg = localized(
      "لم يتم تهيئة مفتاح API. يرجى إعادة تحميل الصفحة.",
      "API key not initialized. Please reload the page."
    );
    console.error("✗ Client not initialized. Error:", errorMsg);
    return errorMsg;
  }

  try {
    const localized = (ar: string, en: string) => (language === 'ar' ? ar : en);
    const systemPrompt = language === 'ar' ? SYSTEM_PROMPT_AR : SYSTEM_PROMPT_EN;
    
    // Build system instruction with optional context
    const fullSystemPrompt = lessonContext
      ? `${systemPrompt}\n\n---\nContext:\n${lessonContext}\n---`
      : systemPrompt;

    // Prepare the request content parts
    let parts: any[] = [{ text: message }];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      });
    }

    console.log("Calling Gemini API...");
    
    // Call Gemini API using client.models.generateContent()
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: fullSystemPrompt
      },
      contents: [
        {
          role: 'user',
          parts: parts
        }
      ]
    });

    console.log("✓ Gemini response received");

    // Extract text from response - @google/genai uses response.text property
    const text = response.text ||
                 response.candidates?.[0]?.content?.parts?.[0]?.text ||
                 localized("لم أتمكن من إنشاء رد.", "I could not generate a response.");
    
    console.log("✓ Extracted response text:", text.substring(0, 100));
    return text;
  } catch (error: any) {
    console.error("✗ Gemini Error:", error);
    const localized = (ar: string, en: string) => (language === 'ar' ? ar : en);
    const errorMsg = localized(
      `حدث خطأ: ${error?.message || 'خطأ غير معروف'}`,
      `Error: ${error?.message || 'Unknown error'}`
    );
    console.error("Error details:", error);
    return errorMsg;
  }
};

export const summarizeLesson = async (content: string, language: Language): Promise<string> => {
  if (!client) {
    return language === 'ar' ? "لم يتم تهيئة API" : "API not initialized";
  }
  
  try {
    const prompt = language === 'ar'
      ? `قم بتلخيص المحتوى التعليمي التالي بشكل نقاط مختصرة وسهلة الفهم:\n\n${content}`
      : `Summarize this educational content into clear bullet points:\n\n${content}`;

    // Use client.models.generateContent() for summarization
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const text = response.text || 
                 response.candidates?.[0]?.content?.parts?.[0]?.text ||
                 (language === 'ar' ? "فشل التلخيص" : "Summary failed");
    
    return text;
  } catch (error) {
    console.error("Summarize error:", error);
    return language === 'ar' ? "حدث خطأ في التلخيص" : "Summarization error";
  }
};

// Keep startChatSession for backward compatibility
export const startChatSession = async (lessonContext?: string, systemPromptOverride?: string) => {
  if (!client) throw new Error("API Key not initialized");
  return null;
};
