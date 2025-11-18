import React, { useState } from 'react';
import { generateAIResponse } from '../services/geminiService';
import { AIPersona } from '../types';

interface AIFeedbackProps {
  question: string;
  answer: string;
}

const AIFeedback: React.FC<AIFeedbackProps> = ({ question, answer }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<AIPersona | null>(null);

  const handleAction = async (persona: AIPersona) => {
    if (persona.startsWith('interviewer') && !input.trim()) {
      alert("Пожалуйста, напишите ваш ответ перед проверкой.");
      return;
    }

    setLoading(true);
    setActivePersona(persona);
    setFeedback(null);

    const response = await generateAIResponse(persona, question, answer, input);
    setFeedback(response);
    setLoading(false);
  };

  // Markdown rendering helper (simple regex for basic formatting to avoid heavy deps if possible, but safe logic)
  const renderMarkdown = (text: string) => {
    // Very basic safety replacement for bold and list items to render visually
    // In a real production app, use 'react-markdown'
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/### (.*?)\n/g, '<h3 class="text-md font-bold mt-2 mb-1">$1</h3>')
      .replace(/\n- (.*?)/g, '<br>• $1');
    
    return { __html: html };
  };

  return (
    <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
          AI
        </div>
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
          Умный Помощник
        </h4>
      </div>

      <div className="space-y-3">
        <textarea
          className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[80px] bg-white resize-y"
          placeholder="Введите ваш ответ здесь для проверки..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleAction('interviewer_strict')}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded hover:bg-slate-700 transition disabled:opacity-50"
          >
            👨‍⚖️ Строгая проверка
          </button>
           <button
            onClick={() => handleAction('interviewer_friendly')}
            disabled={loading}
            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-500 transition disabled:opacity-50"
          >
            🤝 Мягкий ментор
          </button>
          <button
            onClick={() => handleAction('teacher_eli5')}
            disabled={loading}
            className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-bold rounded hover:bg-purple-200 transition disabled:opacity-50"
          >
            👶 Объясни просто (ELI5)
          </button>
          <button
            onClick={() => handleAction('architect_deep')}
            disabled={loading}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded hover:bg-blue-200 transition disabled:opacity-50"
          >
            🧠 Deep Dive
          </button>
           <button
            onClick={() => handleAction('devil_advocate')}
            disabled={loading}
            className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200 transition disabled:opacity-50"
          >
            😈 Вопрос с подвохом
          </button>
        </div>
      </div>

      {loading && (
        <div className="mt-4 p-4 bg-white border border-slate-100 rounded-lg animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      )}

      {feedback && (
        <div className="mt-4 p-5 bg-white border border-indigo-100 rounded-lg shadow-sm relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <div className="text-xs font-bold text-indigo-500 mb-2 uppercase tracking-wider">
            {activePersona === 'interviewer_strict' && 'Вердикт интервьюера'}
            {activePersona === 'interviewer_friendly' && 'Совет ментора'}
            {activePersona === 'teacher_eli5' && 'Простое объяснение'}
            {activePersona === 'architect_deep' && 'Архитектурный разбор'}
            {activePersona === 'devil_advocate' && 'Follow-up Challenge'}
          </div>
          <div 
            className="prose prose-sm max-w-none text-slate-800 leading-relaxed whitespace-pre-wrap font-medium"
            dangerouslySetInnerHTML={renderMarkdown(feedback)} 
          />
        </div>
      )}
    </div>
  );
};

export default AIFeedback;