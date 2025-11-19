import React, { useState } from 'react';
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
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  data, 
  index, 
  isRead, 
  isBookmarked,
  isFavorite,
  onReveal, 
  onToggleBookmark,
  onToggleFavorite,
  levelColor 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAnswerCopied, setIsAnswerCopied] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRevealed(true);
    onReveal();
  };

  const handleCopyAnswer = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Create a temporary element to extract text from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = data.a;
    const answerText = tempDiv.innerText || tempDiv.textContent || "";
    
    const textToCopy = `Question: ${data.q}\n\nAnswer:\n${answerText}`;
    
    navigator.clipboard.writeText(textToCopy);
    setIsAnswerCopied(true);
    setTimeout(() => setIsAnswerCopied(false), 2000);
  };

  return (
    <article className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md group mb-6 relative">
      {/* Header / Question */}
      <div 
        className="p-6 cursor-pointer select-none flex justify-between items-start gap-4 pr-32" 
        onClick={toggleOpen}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isRead ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {isRead ? 'ИЗУЧЕНО' : 'НОВОЕ'}
            </span>
            <span className="text-xs text-slate-400 font-mono">#{index + 1}</span>
          </div>
          <h3 className={`text-lg font-bold text-slate-800 leading-snug group-hover:text-${levelColor} transition-colors`}>
            {data.q}
          </h3>
        </div>
        <div className={`text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-6 right-12 flex items-center gap-2">
        {/* Favorite / Difficult Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className={`group/btn relative p-1.5 rounded-full transition-all duration-200 transform hover:scale-110 z-10
            ${isFavorite 
              ? 'text-rose-500 hover:text-rose-600 bg-rose-50' 
              : 'text-slate-300 hover:text-rose-500 hover:bg-slate-50'
            }`}
          aria-label={isFavorite ? "Remove from important" : "Mark as Difficult"}
        >
           <svg className={`w-6 h-6 ${isFavorite ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
           </svg>
           {/* Tooltip */}
           <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] font-medium rounded shadow-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
             {isFavorite ? "Remove important" : "Mark as difficult"}
           </span>
        </button>

        {/* Bookmark Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
          className={`group/btn relative p-1.5 rounded-full transition-all duration-200 transform hover:scale-110 z-10
            ${isBookmarked 
              ? 'text-yellow-400 hover:text-yellow-500 bg-yellow-50' 
              : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-50'
            }`}
          aria-label={isBookmarked ? "Remove from saved" : "Save for later"}
        >
           <svg className={`w-6 h-6 ${isBookmarked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
           </svg>
           {/* Tooltip */}
           <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] font-medium rounded shadow-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
             {isBookmarked ? "Remove bookmark" : "Save for later"}
           </span>
        </button>
      </div>

      {/* Content Area */}
      <div 
        className={`transition-all duration-500 ease-in-out bg-slate-50/50 border-t border-slate-100 overflow-hidden ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        {/* AI Feedback - Always Visible if Expanded */}
        <div className="px-6 pt-6 pb-2">
           <AIFeedback question={data.q} answer={data.a} />
        </div>

        {/* Answer Container */}
        <div className="relative">
          {/* Reveal Blocker - Only blocks answer */}
          {!isRevealed && (
            <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
              <button 
                onClick={handleReveal}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 text-sm"
              >
                👁️ Показать ответ
              </button>
            </div>
          )}

          <div className={`p-6 pb-6 pt-4 text-slate-700 leading-relaxed transition-filter duration-300 ${!isRevealed ? 'blur-sm select-none h-24 overflow-hidden' : ''}`}>
            
            {/* Copy Answer Button (Visible only when revealed) */}
            {isRevealed && (
              <div className="absolute top-2 right-6 z-20">
                <button 
                  onClick={handleCopyAnswer}
                  className={`group/copy relative flex items-center gap-1.5 text-xs font-bold transition-all duration-200 p-2 rounded-lg border ${
                    isAnswerCopied 
                      ? 'bg-green-50 text-green-600 border-green-200 shadow-sm' 
                      : 'bg-white/80 hover:bg-white text-slate-400 border-slate-200 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm'
                  }`}
                  aria-label="Copy Question & Answer"
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
                  <span className={`transition-colors duration-200 ${isAnswerCopied ? 'text-green-600' : ''}`}>
                    {isAnswerCopied ? 'Copied!' : 'Copy Q&A'}
                  </span>
                  
                  {/* Tooltip */}
                  <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] font-medium rounded shadow-lg opacity-0 group-hover/copy:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Copy full Q&A
                  </span>
                </button>
              </div>
            )}

            {/* Answer Content HTML */}
            <div 
              className="prose prose-slate prose-sm max-w-none [&_code]:bg-slate-100 [&_code]:text-rose-600 [&_code]:px-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs [&_ul]:list-disc [&_ul]:pl-5 [&_h4]:font-bold [&_h4]:text-slate-900"
              dangerouslySetInnerHTML={{ __html: data.a }} 
            />

            {/* Pro Tip */}
            {data.tip && (
              <div className="mt-6 relative pl-4 border-l-4 border-emerald-500 bg-emerald-50 p-4 rounded-r-lg">
                <span className="absolute -top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Pro Tip
                </span>
                <p className="text-emerald-800 text-sm italic">{data.tip}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default QuestionCard;