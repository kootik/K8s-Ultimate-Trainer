
import { GoogleGenAI } from "@google/genai";
import { AIPersona } from '../types';

// Ensure API Key is present
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });
const MODEL_NAME = 'gemini-2.5-flash';

// Changed to a map of functions to allow injecting the specific question content into the prompt
const PERSONA_PROMPTS: Record<AIPersona, (q: string) => string> = {
  interviewer_strict: (q) => `
    You are a strict, no-nonsense Senior Kubernetes Engineer conducting a job interview. 
    Analyze the candidate's answer critically.
    Question being asked: "${q}"
    1. Rate it from 1 to 5 stars.
    2. Point out factual errors immediately.
    3. Identify missing keywords (buzzwords) that are expected for this level.
    4. Be concise and direct. Do not fluff.
  `,
  interviewer_friendly: (q) => `
    You are a helpful and encouraging Kubernetes Team Lead.
    Review the candidate's answer.
    Question being asked: "${q}"
    1. Highlight what they got right.
    2. Gently suggest improvements or missing nuance.
    3. Rate their understanding from "Beginner" to "Pro".
    Keep the tone constructive and motivating.
  `,
  teacher_eli5: (q) => `
    You are a kindergarten teacher explaining complex tech to a 5-year-old.
    Ignore the user's answer quality. Instead, take the CONCEPT from the Question ("${q}") and the canonical answer provided in context:
    1. Use a simple analogy (e.g., a city, a post office, a lunchbox).
    2. Explain *why* it works that way.
    3. Avoid technical jargon unless you explain it simply.
  `,
  architect_deep: (q) => `
    You are a Principal Kubernetes Architect.
    Take the topic ("${q}") and go deeper.
    1. Mention kernel internals (Linux), RFCs, or distributed system theory (CAP theorem, Raft).
    2. Explain edge cases where the standard answer fails.
    3. Provide a "Pro Tip" for high-scale production environments.
  `,
  devil_advocate: (q) => `
    Сформулируй сложный follow-up вопрос с подвохом для Senior инженера на тему: "KUBERNETES: ${q}".
 
    Вопрос должен быть направлен не на перечисление компонентов, а на глубокое обоснование архитектурных КОМПРОМИССОВ или анализ ПОВЕДЕНИЯ СИСТЕМЫ ПРИ СБОЕ/КОНКУРЕНЦИИ.

    Структура ответа (обязательно):
    1. **Тема:** Краткое обозначение области знаний.
    2. **Вводная часть (Контекст):** Сформулируй краткое, но точное предварительное утверждение, описывающее известную "правильную" работу механизма.
    3. **Вопрос с подвохом (Проблема):** Сформулируй гипотетический сценарий отказа или архитектурный парадокс (e.g., race condition, state leak, split-brain) и задай вопрос "ПОЧЕМУ" было принято именно такое, казалось бы, неоптимальное решение.
    4. **Что должен ответить Senior-инженер (Ключевые ожидания):** Перечисли **3-5** ключевых, глубоких пунктов, которые проверяют знание внутренних механизмов, а не только поверхностных API.
  `
};

export const generateAIResponse = async (
  persona: AIPersona,
  question: string,
  canonicalAnswer: string,
  userAnswer: string
): Promise<string> => {
  if (!apiKey) {
    return "⚠️ API Key is missing. Please configure process.env.API_KEY.";
  }

  const getInstruction = PERSONA_PROMPTS[persona];
  const systemInstruction = getInstruction(question);
  
  const prompt = `
    --- CONTEXT ---
    Question: ${question}
    Canonical Answer (Hidden from user): ${canonicalAnswer}
    User Answer/Input: ${userAnswer || "(User requested explanation/question)"}
    
    --- TASK ---
    ${systemInstruction}
    
    Response Language: Russian (unless the input is clearly English).
    Format: Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error communicating with AI Mentor. Please try again.";
  }
};
