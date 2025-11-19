
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateAIResponse } from '../services/geminiService';
import { AIPersona } from '../types';

interface AIFeedbackProps {
  question: string;
  answer: string;
}

interface PersonaConfig {
  id: AIPersona;
  label: string;
  style: string;
  tooltip: string;
}

const PERSONAS: PersonaConfig[] = [
  {
    id: 'interviewer_strict',
    label: '👨‍⚖️ Строгая проверка',
    style: 'bg-slate-800 text-white hover:bg-slate-700',
    tooltip: 'Симуляция Bar Raiser интервью. Оценка 1-5, жесткий поиск пробелов в знаниях и вопросы по "edge cases".'
  },
  {
    id: 'interviewer_friendly',
    label: '🤝 Мягкий ментор',
    style: 'bg-emerald-600 text-white hover:bg-emerald-500',
    tooltip: 'Поддерживающий стиль. Валидация правильных ответов, мягкая коррекция ошибок и советы по Soft Skills.'
  },
  {
    id: 'teacher_eli5',
    label: '👶 Объясни просто (ELI5)',
    style: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    tooltip: 'Объяснение через аналогии из реальной жизни (аэропорт, кухня, библиотека) без сложного жаргона.'
  },
  {
    id: 'architect_deep',
    label: '🧠 Deep Dive',
    style: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    tooltip: 'Архитектурный разбор: внутренности (Etcd, Kernel, Cgroups), компромиссы (Trade-offs) и масштабирование.'
  },
  {
    id: 'devil_advocate',
    label: '😈 Вопрос с подвохом',
    style: 'bg-red-100 text-red-700 hover:bg-red-200',
    tooltip: 'Chaos Engineering: сценарии сбоев (Network Partition, OOM) и проверка устойчивости решения.'
  },
  {
    id: 'analyst_compare',
    label: '📊 Сравнение (Analyst)',
    style: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
    tooltip: 'Генерация матрицы сравнения (Markdown таблица) с альтернативными технологиями и подходами.'
  },
  {
    id: 'troubleshooter_debug',
    label: '🛠️ Debug (SRE)',
    style: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
    tooltip: 'Практический чек-лист команд kubectl для отладки инцидентов и анализ Root Cause.'
  },
  {
    id: 'security_auditor',
    label: '🛡️ Security Audit',
    style: 'bg-slate-800 text-yellow-400 border border-yellow-600/50 hover:bg-slate-700',
    tooltip: 'Анализ уязвимостей, векторов атак и рекомендации по защите (Hardening) в стиле экзамена CKS.'
  },
  {
    id: 'explain_code',
    label: '💻 Explain with Code',
    style: 'bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-300',
    tooltip: 'Показать практическую реализацию (YAML/kubectl) без лишней теории.'
  },
  {
    id: 'start_interview',
    label: '🎤 Interview Me!',
    style: 'bg-violet-600 text-white hover:bg-violet-700',
    tooltip: 'Начать интерактивное интервью, где AI будет задавать вопросы по этой теме.'
  }
];

const AIFeedback: React.FC<AIFeedbackProps> = ({ question, answer }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedPersonaId, setSelectedPersonaId] = useState<AIPersona>('interviewer_strict');
  const [activePersona, setActivePersona] = useState<AIPersona | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  
  // Hint State
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  const selectedPersonaConfig = PERSONAS.find(p => p.id === selectedPersonaId) || PERSONAS[0];

  const handleAction = async (personaOverride?: AIPersona) => {
    const persona = personaOverride || selectedPersonaId;

    // Validation for standard interviewer mode
    if (persona.startsWith('interviewer') && !input.trim() && !isInterviewMode) {
      alert("Пожалуйста, напишите ваш ответ перед проверкой.");
      return;
    }

    // Validation for answering the interview question
    if (isInterviewMode && persona !== 'start_interview' && !input.trim()) {
        alert("Пожалуйста, введите ответ на вопрос интервьюера.");
        return;
    }

    // Capture current feedback (the question) as context before we clear it
    // If we are starting an interview, context is undefined
    // If we are answering (persona is strict/friendly/continuous), context is the previous AI text
    const currentContext = isInterviewMode && persona !== 'start_interview' ? (feedback || '') : undefined;

    setLoading(true);
    setActivePersona(persona);
    setFeedback(null);
    setHint(null); // Clear previous hint

    // Logic for Interview Mode State
    if (persona === 'start_interview') {
        setIsInterviewMode(true);
        setInput(''); // Clear input for user to answer the new question
    } 
    
    // NOTE: We do NOT set isInterviewMode(false) here. 
    // We want the user to stay in the loop until they explicitly cancel.

    const response = await generateAIResponse(persona, question, answer, input, currentContext);
    setFeedback(response);
    setLoading(false);

    // If we are in the loop (answering a follow-up), clear input so they can answer the next one
    if (isInterviewMode && persona !== 'start_interview') {
        setInput('');
    }
  };

  const handleGetHint = async () => {
      if (!feedback || hintLoading) return;
      
      setHintLoading(true);
      // We pass the 'feedback' (AI's current question) as the 'userAnswer' parameter 
      // so the prompt can read it and generate a hint for it.
      const hintResponse = await generateAIResponse('hint_giver', question, answer, feedback);
      setHint(hintResponse);
      setHintLoading(false);
  };

  const handleCopy = () => {
    if (!feedback) return;
    navigator.clipboard.writeText(feedback);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getFeedbackLabel = () => {
    if (isInterviewMode) return 'Interactive Interview';
    if (activePersona === 'explain_code') return 'Explain with Code';
    if (activePersona === 'start_interview') return 'Interactive Interview';
    return PERSONAS.find(p => p.id === activePersona)?.label;
  };

  const handleCancelInterview = () => {
      setIsInterviewMode(false);
      setActivePersona(null);
      setFeedback(null);
      setHint(null);
  };

  return (
    <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs transition-colors duration-300 ${isInterviewMode ? 'bg-violet-600 animate-pulse' : 'bg-gradient-to-tr from-blue-500 to-purple-600'}`}>
          {isInterviewMode ? '🎤' : 'AI'}
        </div>
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
          {isInterviewMode ? 'Интервью в процессе...' : 'Умный Помощник'}
        </h4>
      </div>

      <div className="space-y-4">
        
        {/* Persona Selector - Hide in Interview Mode */}
        {!isInterviewMode && (
            <>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Выберите режим AI:
                    </label>
                    <div className="relative">
                        <select
                        value={selectedPersonaId}
                        onChange={(e) => setSelectedPersonaId(e.target.value as AIPersona)}
                        className="appearance-none w-full bg-white border border-slate-300 text-slate-700 py-2.5 pl-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm font-medium shadow-sm cursor-pointer hover:border-slate-400 transition-colors"
                        >
                        {PERSONAS.map(p => (
                            <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                {/* Info Box for Selected Persona */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 flex gap-3 animate-fade-in">
                <div className="text-xl mt-0.5">💡</div>
                <div className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-bold text-indigo-900 block mb-0.5">Роль: {selectedPersonaConfig.label}</span>
                    {selectedPersonaConfig.tooltip}
                </div>
                </div>
            </>
        )}

        {/* Interview Mode Tip */}
        {isInterviewMode && (
            <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 animate-fade-in relative">
                <div className="flex justify-between items-start">
                   <div>
                        <p className="text-sm text-violet-800 font-medium mb-1">💬 Очередь ответа</p>
                        <p className="text-xs text-violet-600">
                            Интервьюер задал вопрос выше (или ждет вашего ответа). Введите ваш ответ ниже.
                        </p>
                   </div>
                   
                   {/* Hint Button */}
                   {feedback && (
                       <button 
                           onClick={handleGetHint}
                           disabled={hintLoading || !!hint}
                           className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded border border-amber-200 hover:bg-amber-200 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                           title="Получить подсказку на текущий вопрос"
                       >
                           {hintLoading ? (
                               <span className="animate-spin">⚙️</span>
                           ) : (
                               <span>💡 Подсказка</span>
                           )}
                       </button>
                   )}
                </div>

                {/* Protected Hint Area */}
                {hint && (
                    <div 
                        className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-yellow-200 rounded-lg shadow-inner text-xs font-medium text-slate-600 select-none cursor-help transition-all animate-fade-in relative group"
                        onContextMenu={(e) => e.preventDefault()}
                        onCopy={(e) => e.preventDefault()}
                    >
                        <div className="absolute top-1 right-2 text-[10px] text-yellow-500 font-bold opacity-50 group-hover:opacity-100 transition-opacity uppercase">
                            No Copy Mode
                        </div>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {hint}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        )}

        {/* Input Area */}
        <textarea
          className={`w-full p-3 text-sm border rounded-lg focus:ring-2 outline-none min-h-[100px] bg-white resize-y transition-all
            ${isInterviewMode 
                ? 'border-violet-300 focus:ring-violet-500 ring-2 ring-violet-100' 
                : 'border-slate-300 focus:ring-blue-500 focus:border-transparent'
            }`}
          placeholder={
            isInterviewMode 
                ? "✍️ Введите ваш ответ на вопрос интервьюера здесь..." 
                : selectedPersonaId.startsWith('interviewer') 
                    ? "📝 Введите ваш ответ здесь, чтобы AI-интервьюер мог его оценить..." 
                    : "💬 Добавьте уточняющий вопрос или контекст (необязательно)..."
            }
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {/* BUTTONS */}
        {isInterviewMode ? (
            /* Interview Mode Buttons */
            <div className="flex flex-col gap-3 animate-fade-in">
                <button
                    onClick={() => {
                         // Always use 'interviewer_continuous' to ensure the proper feedback loop format
                         // defined in geminiService is used (Short feedback + Next Question).
                         handleAction('interviewer_continuous');
                    }}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-lg font-bold text-sm shadow-lg bg-violet-600 text-white hover:bg-violet-700 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Проверка ответа...</span>
                        </>
                    ) : (
                        <>
                            <span>📩 Ответить и продолжить</span>
                        </>
                    )}
                </button>
                <button 
                    onClick={handleCancelInterview}
                    disabled={loading}
                    className="text-xs text-slate-400 hover:text-slate-600 underline text-center py-2"
                >
                    Завершить интервью
                </button>
            </div>
        ) : (
            /* Standard Actions */
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                {/* Main Action Button */}
                <button
                    onClick={() => handleAction()}
                    disabled={loading}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm shadow-md transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px] ${selectedPersonaConfig.style}`}
                >
                    {loading && activePersona === selectedPersonaId ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Анализирую...</span>
                    </>
                    ) : (
                    <span>🚀 Запустить: {selectedPersonaConfig.label}</span>
                    )}
                </button>
            </div>
        )}
      </div>

      {/* Feedback Display Area */}
      {feedback && (
        <div className="mt-6 p-5 bg-white border border-indigo-100 rounded-lg shadow-sm relative overflow-hidden animate-fade-in group/feedback">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          
          <div className="flex justify-between items-start mb-4 pb-2 border-b border-slate-100">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
              <span>🤖 Ответ AI</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">{getFeedbackLabel()}</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleCopy}
                className="text-slate-400 hover:text-indigo-600 transition-colors p-1.5 rounded-md hover:bg-indigo-50 flex items-center gap-1.5 text-xs font-medium"
              >
                {isCopied ? (
                   <>
                     <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                     <span className="text-green-600">Скопировано</span>
                   </>
                ) : (
                   <>
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                     <span>Копировать</span>
                   </>
                )}
              </button>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed font-medium prose-headings:font-bold prose-h3:text-indigo-700 prose-a:text-blue-600 prose-code:text-rose-600 prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-table:border-collapse prose-th:border prose-th:border-slate-300 prose-th:bg-slate-100 prose-th:p-2 prose-td:border prose-td:border-slate-300 prose-td:p-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {feedback || ''}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIFeedback;
