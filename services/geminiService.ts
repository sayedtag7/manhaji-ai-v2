
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT_AR } from '../constants';
import { Language } from '../types';

let client: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

export const initializeGemini = (apiKey: string) => {
  client = new GoogleGenAI({ apiKey });
};

export const getGeminiClient = () => client;

/**
 * Starts a new chat session or returns the existing one.
 */
export const startChatSession = async (lessonContext?: string, systemPromptOverride?: string) => {
  if (!client) throw new Error("API Key not initialized");

  let fullSystemInstruction = systemPromptOverride || SYSTEM_PROMPT_AR;

  if (lessonContext) {
    fullSystemInstruction += `
    
    ---
    Context (Lesson Information):
    ${lessonContext}
    ---
    `;
  }

  chatSession = client.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: fullSystemInstruction,
      temperature: 0.7,
    },
  });
  
  return chatSession;
};

export const sendMessageToGemini = async (
  message: string,
  imageBase64?: string,
  language: Language = 'ar'
): Promise<string> => {
  if (!client) throw new Error("API Key not initialized");

  try {
    const localized = (ar: string, en: string) => (language === 'ar' ? ar : en);
    // If there is an image, we perform a single generation request (multimodal)
    // instead of the persistent chat session for simplicity in this "Homework Helper" scenario,
    // OR we can add the image to the chat history if we want continuity.
    // For this implementation, let's try to add it to the chat if possible, or fall back to generateContent.
    
    if (imageBase64) {
       // Gemini 2.5 Flash supports images in chat.
       if (!chatSession) await startChatSession();
       
       const response = await chatSession?.sendMessage({
         content: {
            role: 'user',
            parts: [
                { text: message },
                { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
            ]
         }
       });
       return response?.text || localized("لم أتمكن من قراءة الصورة.", "I could not read the image.");
    }

    if (!chatSession) {
      await startChatSession();
    }

    const response: GenerateContentResponse = await chatSession!.sendMessage({
      message,
    });
    
    return response.text || localized("عذراً، لم أستطع فهم ذلك.", "I could not understand that.");
  } catch (error) {
    console.error("Gemini Error:", error);
    return localized(
      "واجهت مشكلة في الاتصال. يرجى التحقق من الإنترنت أو مفتاح API.",
      "I encountered a connection issue. Please verify your internet or API key."
    );
  }
};

export const summarizeLesson = async (content: string, language: Language): Promise<string> => {
    if (!client) throw new Error("API Key not initialized");
    
    const prompt = language === 'ar'
        ? `قم بتلخيص المحتوى التعليمي التالي بشكل نقاط مختصرة وسهلة الفهم للطالب:\n\n${content}`
        : `Summarize the following educational content into clear, easy-to-follow bullet points for the student:\n\n${content}`;

    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text || (language === 'ar' ? "فشل التلخيص" : "Summary failed.");
};
