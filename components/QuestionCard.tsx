
import React, { useState } from 'react';
import { Question } from '../types';
import AIFeedback from './AIFeedback';

interface QuestionCardProps {
  data: Question;
  index: number;
  isRead: boolean;
  onReveal: () => void;
  levelColor: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ data, index, isRead, onReveal, levelColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRevealed(true);
    onReveal();
  };

  return (
    <article className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md group mb-6">
      {/* Header / Question */}
      <div 
        className="p-6 cursor-pointer select-none flex justify-between items-start gap-4" 
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
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
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
