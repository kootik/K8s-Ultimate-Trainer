import React, { useState, useEffect, useRef } from 'react';
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
    label: '👨‍⚖️ Строгий',
    style: 'bg-slate-800 text-white hover:bg-slate-700 border-slate-800',
    tooltip: 'Симуляция Bar Raiser интервью. Оценка 1-5, жесткий поиск пробелов в знаниях.'
  },
  {
    id: 'interviewer_friendly',
    label: '🤝 Ментор',
    style: 'bg-emerald-600 text-white hover:bg-emerald-500 border-emerald-600',
    tooltip: 'Поддерживающий стиль. Валидация правильных ответов и советы по Soft Skills.'
  },
  {
    id: 'teacher_eli5',
    label: '👶 ELI5 (Просто)',
    style: 'bg-purple-600 text-white hover:bg-purple-500 border-purple-600',
    tooltip: 'Объяснение через аналогии (аэропорт, кухня) без сложного жаргона.'
  },
  {
    id: 'architect_deep',
    label: '🧠 Deep Dive',
    style: 'bg-blue-600 text-white hover:bg-blue-500 border-blue-600',
    tooltip: 'Архитектурный разбор: внутренности (Etcd, Kernel), компромиссы и масштабирование.'
  },
  {
    id: 'devil_advocate',
    label: '😈 Подвох',
    style: 'bg-red-600 text-white hover:bg-red-500 border-red-600',
    tooltip: 'Chaos Engineering: сценарии сбоев и проверка устойчивости решения.'
  },
  {
    id: 'analyst_compare',
    label: '📊 Сравнение',
    style: 'bg-amber-600 text-white hover:bg-amber-500 border-amber-600',
    tooltip: 'Матрица сравнения (таблица) с альтернативными технологиями.'
  },
  {
    id: 'troubleshooter_debug',
    label: '🛠️ Debug',
    style: 'bg-cyan-600 text-white hover:bg-cyan-500 border-cyan-600',
    tooltip: 'Чек-лист команд kubectl для отладки инцидентов и анализ Root Cause.'
  },
  {
    id: 'security_auditor',
    label: '🛡️ Security',
    style: 'bg-yellow-600 text-white hover:bg-yellow-500 border-yellow-600',
    tooltip: 'Анализ уязвимостей и рекомендации по защите (Hardening).'
  },
  {
    id: 'explain_code',
    label: '💻 Код',
    style: 'bg-slate-600 text-white hover:bg-slate-500 border-slate-600',
    tooltip: 'Показать практическую реализацию (YAML/kubectl) без теории.'
  },
  {
    id: 'start_interview',
    label: '🎤 Интервью',
    style: 'bg-violet-600 text-white hover:bg-violet-500 border-violet-600',
    tooltip: 'Начать интерактивное интервью, где AI будет задавать вопросы.'
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
  
  // Selector State (Option 2)
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  
  // Hint State
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  // Editor State
  const [editedCode, setEditedCode] = useState('');
  
  const selectedPersonaConfig = PERSONAS.find(p => p.id === selectedPersonaId) || PERSONAS[0];

  // Extract code when feedback comes in for explain_code persona
  useEffect(() => {
    if (feedback && activePersona === 'explain_code') {
        // Try to extract code between triple backticks
        const codeBlockRegex = /```(?:yaml|bash|sh|json|kubectl)?\s*([\s\S]*?)```/;
        const match = feedback.match(codeBlockRegex);
        if (match && match[1]) {
            setEditedCode(match[1].trim());
        } else {
            setEditedCode(feedback.trim());
        }
    }
  }, [feedback, activePersona]);

  const handleAction = async (personaOverride?: AIPersona) => {
    const persona = personaOverride || selectedPersonaId;

    if (persona.startsWith('interviewer') && !input.trim() && !isInterviewMode) {
      alert("Пожалуйста, напишите ваш ответ перед проверкой.");
      return;
    }

    if (isInterviewMode && persona !== 'start_interview' && !input.trim()) {
        alert("Пожалуйста, введите ответ на вопрос интервьюера.");
        return;
    }

    const currentContext = isInterviewMode && persona !== 'start_interview' ? (feedback || '') : undefined;

    setLoading(true);
    setActivePersona(persona);
    setFeedback(null);
    setHint(null);
    setEditedCode('');

    if (persona === 'start_interview') {
        setIsInterviewMode(true);
        setInput('');
    } 
    
    const response = await generateAIResponse(persona, question, answer, input, currentContext);
    setFeedback(response);
    setLoading(false);
    
    // Close selector if it was open (though usually it's closed before running)
    setIsSelectorOpen(false);

    if (isInterviewMode && persona !== 'start_interview') {
        setInput('');
    }
  };

  const handleGetHint = async () => {
      if (!feedback || hintLoading) return;
      
      setHintLoading(true);
      const hintResponse = await generateAIResponse('hint_giver', question, answer, feedback);
      setHint(hintResponse);
      setHintLoading(false);
  };

  const handleCopy = () => {
    const textToCopy = activePersona === 'explain_code' ? editedCode : feedback;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getFeedbackLabel = () => {
    if (isInterviewMode) return 'Интерактивное интервью';
    if (activePersona === 'explain_code') return 'Live редактор кода';
    if (activePersona === 'start_interview') return 'Интерактивное интервью';
    return PERSONAS.find(p => p.id === activePersona)?.label;
  };

  const handleCancelInterview = () => {
      setIsInterviewMode(false);
      setActivePersona(null);
      setFeedback(null);
      setHint(null);
  };

  const getIconFromLabel = (label: string) => label.split(' ')[0];
  const getNameFromLabel = (label: string) => label.split(' ').slice(1).join(' ');

  return (
    <div className="mt-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs transition-colors duration-300 flex-shrink-0 ${isInterviewMode ? 'bg-violet-600 animate-pulse' : 'bg-gradient-to-tr from-blue-500 to-purple-600'}`}>
          {isInterviewMode ? '🎤' : 'AI'}
        </div>
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
          {isInterviewMode ? 'Интервью в процессе...' : 'Умный Помощник'}
        </h4>
      </div>

      <div className="space-y-4">
        
        {/* MODE SELECTION - VISUAL GRID (OPTION 2) */}
        {!isInterviewMode && (
            <div className="mb-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Выбранный режим:
                </label>
                
                {/* Active Persona Card - Click to Toggle Grid */}
                <button
                    onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                    className={`w-full group relative text-left p-4 rounded-xl border-2 transition-all duration-300 
                    bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50
                    ${isSelectorOpen 
                        ? 'border-blue-500 ring-2 ring-blue-500/20' 
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                >
                     <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {/* Large Icon Box */}
                            <div className={`h-12 w-12 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110 ${selectedPersonaConfig.style}`}>
                                {getIconFromLabel(selectedPersonaConfig.label)}
                            </div>
                            
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                                    {getNameFromLabel(selectedPersonaConfig.label)}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug max-w-xs sm:max-w-sm">
                                    {selectedPersonaConfig.tooltip}
                                </p>
                            </div>
                        </div>
                        
                        {/* Chevron */}
                        <div className={`p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${isSelectorOpen ? 'rotate-180 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : ''}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </button>

                {/* Expandable Grid */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isSelectorOpen ? 'max-h-[800px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1">
                        {PERSONAS.filter(p => p.id !== selectedPersonaId).map(p => (
                            <button
                                key={p.id}
                                onClick={() => { setSelectedPersonaId(p.id); setIsSelectorOpen(false); }}
                                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left group/item"
                            >
                                <div className={`h-9 w-9 rounded-lg flex-shrink-0 flex items-center justify-center text-sm shadow-sm opacity-80 group-hover/item:opacity-100 ${p.style}`}>
                                    {getIconFromLabel(p.label)}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-xs text-slate-700 dark:text-slate-200">
                                        {getNameFromLabel(p.label)}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate pr-2">
                                        {p.tooltip}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Interview Mode Tip */}
        {isInterviewMode && (
            <div className="bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-500/20 rounded-lg p-4 animate-fade-in relative">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                   <div>
                        <p className="text-sm text-violet-800 dark:text-violet-300 font-medium mb-1">💬 Очередь ответа</p>
                        <p className="text-xs text-violet-600 dark:text-violet-400">
                            Интервьюер задал вопрос выше (или ждет вашего ответа). Введите ваш ответ ниже.
                        </p>
                   </div>
                   
                   {/* Hint Button */}
                   {feedback && (
                       <button 
                           onClick={handleGetHint}
                           disabled={hintLoading || !!hint}
                           className="w-full sm:w-auto text-xs px-3 py-2 sm:py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded border border-amber-200 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg shadow-inner text-xs font-medium text-slate-600 dark:text-slate-300 select-none cursor-help transition-all animate-fade-in relative group"
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
          className={`w-full p-3 text-sm border rounded-lg focus:ring-2 outline-none min-h-[100px] resize-y transition-all
            ${isInterviewMode 
                ? 'bg-white dark:bg-slate-800 border-violet-300 dark:border-violet-700 focus:ring-violet-500 ring-2 ring-violet-100 dark:ring-violet-900/20 text-slate-900 dark:text-slate-100' 
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-100'
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
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline text-center py-2"
                >
                    Завершить интервью
                </button>
            </div>
        ) : (
            /* Standard Actions */
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Main Action Button */}
                <button
                    onClick={() => handleAction()}
                    disabled={loading}
                    className={`w-full sm:flex-1 py-3 px-4 rounded-lg font-bold text-sm shadow-md transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${selectedPersonaConfig.style}`}
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
                    <span>🚀 Запустить: {getNameFromLabel(selectedPersonaConfig.label)}</span>
                    )}
                </button>
            </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="mt-6 border rounded-lg shadow-sm relative overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 animate-pulse">
          <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
             <div className="flex items-center gap-2">
                 <div className="h-4 w-4 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                 <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                 <div className="h-4 w-px bg-slate-300 dark:bg-slate-600"></div>
                 <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
             </div>
             <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          
          <div className="p-4 sm:p-5 space-y-4">
            <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            
            <div className="space-y-2">
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>

            <div className="w-full h-24 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700/50"></div>
            
             <div className="space-y-2">
                <div className="h-4 w-11/12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Display Area */}
      {feedback && (
        <div className={`mt-6 border rounded-lg shadow-sm relative overflow-hidden animate-fade-in group/feedback ${activePersona === 'explain_code' ? 'bg-slate-900 border-slate-700' : 'bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-900/30'}`}>
          
          {/* Header */}
          <div className={`flex justify-between items-center px-4 py-2 border-b ${activePersona === 'explain_code' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-900/30 text-indigo-900 dark:text-indigo-200'}`}>
            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
               {activePersona === 'explain_code' ? '💻 Live Editor' : '🤖 Ответ AI'}
               <span className="opacity-50">|</span>
               <span className="opacity-75 truncate max-w-[120px] sm:max-w-none">{getFeedbackLabel()}</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleCopy}
                className={`transition-colors p-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium ${activePersona === 'explain_code' ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-indigo-100 dark:hover:bg-indigo-800 text-slate-500 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-indigo-200'}`}
              >
                {isCopied ? (
                   <>
                     <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                     <span className="text-green-500 hidden sm:inline">Скопировано</span>
                   </>
                ) : (
                   <>
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                     <span className="hidden sm:inline">Копировать</span>
                   </>
                )}
              </button>
            </div>
          </div>

          {/* Content Body */}
          {activePersona === 'explain_code' ? (
              // Live Code Editor View
              <div className="relative">
                  <textarea
                    value={editedCode}
                    onChange={(e) => setEditedCode(e.target.value)}
                    className="w-full h-64 sm:h-96 bg-slate-900 text-blue-300 font-mono text-xs sm:text-sm p-4 focus:outline-none focus:ring-0 resize-y leading-relaxed"
                    spellCheck={false}
                  />
                  <div className="absolute bottom-2 right-4 text-[10px] text-slate-600 pointer-events-none">
                      YAML / Bash / JSON
                  </div>
              </div>
          ) : (
              // Standard Markdown View
              <div className="p-4 sm:p-5 prose prose-sm max-w-none text-slate-800 dark:text-slate-200 leading-relaxed font-medium prose-headings:font-bold prose-h3:text-indigo-700 dark:prose-h3:text-indigo-400 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:text-violet-700 dark:prose-code:text-violet-300 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-table:border-collapse prose-th:border prose-th:border-slate-300 dark:prose-th:border-slate-600 prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-th:p-2 prose-td:border prose-td:border-slate-300 dark:prose-td:border-slate-600 prose-td:p-2 prose-pre:overflow-x-auto prose-pre:bg-slate-800 dark:prose-pre:bg-black/50 prose-pre:text-slate-100 prose-strong:text-slate-900 dark:prose-strong:text-white">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {feedback || ''}
                </ReactMarkdown>
              </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIFeedback;