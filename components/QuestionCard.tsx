import React, { useState, useMemo, useEffect } from 'react';
import { Question } from '../types';
import AIFeedback from './AIFeedback';

interface QuestionCardProps {
  data: Question;
  index: number;
  isRead: boolean;
  isBookmarked: boolean;
  isFavorite: boolean;
  onReveal: () => void;
  onToggleBookmark: () => void;
  onToggleFavorite: () => void;
  levelColor: string;
  searchQuery?: string;
}

// Utility to escape regex characters
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  data, 
  index, 
  isRead, 
  isBookmarked,
  isFavorite,
  onReveal, 
  onToggleBookmark,
  onToggleFavorite,
  levelColor,
  searchQuery = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAnswerCopied, setIsAnswerCopied] = useState(false);
  
  // AI Assistant Visibility State (Hidden by default)
  const [isAIActive, setIsAIActive] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRevealed(true);
    onReveal();
  };

  // Robust timer cleanup using useEffect
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (isAnswerCopied) {
      timeoutId = setTimeout(() => {
        setIsAnswerCopied(false);
      }, 2000);
    }
    return () => clearTimeout(timeoutId);
  }, [isAnswerCopied]);

  const handleCopyAnswer = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Create a temporary element to extract text from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = data.a;
    const answerText = tempDiv.innerText || tempDiv.textContent || "";
    
    const textToCopy = `Question: ${data.q}\n\nAnswer:\n${answerText}`;
    
    navigator.clipboard.writeText(textToCopy);
    setIsAnswerCopied(true);
  };

  // Highlight Logic for Plain Text (Question & Tip)
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/50 text-slate-900 dark:text-white rounded-sm px-0.5">{part}</mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Highlight Logic for HTML Content (Answer)
  const processedAnswerHtml = useMemo(() => {
    if (!searchQuery.trim()) return data.a;
    
    const escapedQuery = escapeRegExp(searchQuery);
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    // Split HTML by tags to identify text nodes
    // Capture tags in the split array using capturing group
    const parts = data.a.split(/(<[^>]+>)/g);
    
    return parts.map(part => {
      // If it starts with < and ends with >, assume it's a tag and don't touch it
      if (part.match(/^<[^>]+>$/)) {
        return part;
      }
      // It's a text node, perform replacement
      return part.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-500/50 text-slate-900 dark:text-white rounded-sm px-0">$1</mark>');
    }).join('');
  }, [data.a, searchQuery]);

  return (
    <article className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md group mb-6 relative">
      {/* Header / Question */}
      <div 
        className="p-4 sm:p-6 cursor-pointer select-none" 
        onClick={toggleOpen}
      >
        <div className="flex flex-col gap-4">
            
            {/* Top Row: Tags & Actions */}
            <div className="flex flex-wrap justify-between items-start gap-3">
                 <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isRead ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                    {isRead ? 'ИЗУЧЕНО' : 'НОВОЕ'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">#{index + 1}</span>
                </div>

                <div className="flex items-center gap-2">
                     {/* Favorite / Difficult Button */}
                    <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                    className={`group/btn relative p-1.5 rounded-full transition-all duration-200 transform active:scale-95
                        ${isFavorite 
                        ? 'text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-900/20' 
                        : 'text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    aria-label={isFavorite ? "Убрать из важного" : "Отметить как сложное"}
                    >
                        <svg className={`w-6 h-6 ${isFavorite ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>

                    {/* Bookmark Button */}
                    <button
                    onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
                    className={`group/btn relative p-1.5 rounded-full transition-all duration-200 transform active:scale-95
                        ${isBookmarked 
                        ? 'text-yellow-400 hover:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                        : 'text-slate-300 dark:text-slate-600 hover:text-yellow-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    aria-label={isBookmarked ? "Убрать из закладок" : "Сохранить в закладки"}
                    >
                        <svg className={`w-6 h-6 ${isBookmarked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    </button>
                    
                    {/* Chevron */}
                    <div className={`text-slate-300 dark:text-slate-600 transition-transform duration-300 ml-2 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>
            
            {/* Question Text */}
            <h3 className={`text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-${levelColor} dark:group-hover:text-blue-400 transition-colors pr-0 sm:pr-8`}>
                {renderHighlightedText(data.q, searchQuery)}
            </h3>
        </div>
      </div>

      {/* Content Area - Using Grid Animation for infinite height support */}
      <div 
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 min-h-0">
          
          {/* AI Feedback Section */}
          <div className="px-4 sm:px-6 pt-6 pb-2">
            {!isAIActive ? (
              /* Hidden State - Activation Banner */
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:border-violet-300 dark:hover:border-violet-500 hover:bg-violet-50/30 dark:hover:bg-violet-900/20 group/ai-toggle">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shadow-sm text-xl group-hover/ai-toggle:scale-110 transition-transform">
                      🤖
                    </div>
                    <div className="text-left flex-1">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                          Умный помощник
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-normal uppercase tracking-wide">Скрыт</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Включите для <span className="font-semibold text-violet-600 dark:text-violet-400">симуляции интервью</span> или <span className="font-semibold text-violet-600 dark:text-violet-400">разбора кода</span>.
                      </p>
                    </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsAIActive(true); }}
                  className="w-full sm:w-auto whitespace-nowrap px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  <span>Включить AI</span>
                </button>
              </div>
            ) : (
              /* Active State - Full UI */
              <div className="relative animate-fade-in">
                  <div className="absolute top-2 right-2 z-10">
                      <button 
                          onClick={() => setIsAIActive(false)}
                          className="text-[10px] font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                          title="Скрыть помощника"
                      >
                          ✕ Скрыть
                      </button>
                  </div>
                  <AIFeedback question={data.q} answer={data.a} />
              </div>
            )}
          </div>

          {/* Answer Container - Smooth Slide Down Animation */}
          <div className="relative">
            {/* Content Wrapper for Height Transition */}
            <div 
              className={`transition-[grid-template-rows,opacity] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] grid ${isRevealed ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="overflow-hidden min-h-0">
                  <div className={`p-4 sm:p-6 pb-6 pt-4 text-slate-700 dark:text-slate-300 leading-relaxed transform transition-transform duration-700 ease-out ${isRevealed ? 'translate-y-0' : '-translate-y-4'}`}>
                      
                      {/* Copy Answer Button (Visible only when revealed) */}
                      <div className="flex justify-end mb-2">
                          <button 
                          onClick={handleCopyAnswer}
                          className={`group/copy relative flex items-center gap-1.5 text-xs font-bold transition-all duration-200 p-2 rounded-lg border ${
                              isAnswerCopied 
                              ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 shadow-sm' 
                              : 'bg-white/80 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 text-slate-400 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm'
                          }`}
                          aria-label="Копировать вопрос и ответ"
                          >
                          <div className="relative w-4 h-4 flex items-center justify-center">
                              {/* Checkmark Icon (Scale In) */}
                              <svg 
                              className={`w-4 h-4 absolute inset-0 transition-all duration-300 transform ${isAnswerCopied ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} 
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                              </svg>
                              
                              {/* Clipboard Icon (Fade Out) */}
                              <svg 
                              className={`w-4 h-4 absolute inset-0 transition-all duration-300 transform ${isAnswerCopied ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`} 
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                              </svg>
                          </div>
                          <span className={`transition-colors duration-200 ${isAnswerCopied ? 'text-green-600 dark:text-green-400' : ''}`}>
                              {isAnswerCopied ? 'Скопировано!' : 'Копировать'}
                          </span>
                          </button>
                      </div>

                      {/* Answer Content HTML */}
                      <div 
                      className="prose prose-slate dark:prose-invert prose-sm max-w-none [&_code]:bg-slate-100 dark:[&_code]:bg-slate-700 [&_code]:text-violet-700 dark:[&_code]:text-violet-300 [&_code]:px-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs [&_ul]:list-disc [&_ul]:pl-5 [&_h4]:font-bold [&_h4]:text-slate-900 dark:[&_h4]:text-white [&_pre]:overflow-x-auto [&_pre]:bg-slate-800 dark:[&_pre]:bg-black/50 [&_pre]:text-slate-100 [&_pre]:p-3 [&_pre]:rounded-lg"
                      dangerouslySetInnerHTML={{ __html: processedAnswerHtml }} 
                      />

                      {/* Pro Tip */}
                      {data.tip && (
                      <div className="mt-6 relative pl-4 border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-r-lg">
                          <span className="absolute -top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          Совет
                          </span>
                          <p className="text-emerald-800 dark:text-emerald-200 text-sm italic mt-1">{renderHighlightedText(data.tip, searchQuery)}</p>
                      </div>
                      )}
                  </div>
              </div>
            </div>

            {/* Reveal Button - Not absolute anymore, takes up space */}
            {!isRevealed && (
              <div className="flex items-center justify-center p-6 w-full">
                <button 
                  onClick={handleReveal}
                  className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 text-sm w-full sm:w-auto justify-center"
                >
                  👁️ Показать ответ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default QuestionCard;