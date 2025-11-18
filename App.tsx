import React, { useState, useEffect, useMemo } from 'react';
import { LevelType, LevelConfig } from './types';
import { LEVELS } from './constants';
import QuestionCard from './components/QuestionCard';

const App: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState<LevelType | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [readQuestions, setReadQuestions] = useState<Set<string>>(new Set());

  // Derived state for active data
  const levelData = currentLevel ? LEVELS[currentLevel] : null;
  const activeModule = levelData?.modules.find(m => m.id === currentModuleId);

  // Calculate progress
  const progress = useMemo(() => {
    if (!levelData) return 0;
    const totalQuestions = levelData.modules.reduce((acc, m) => acc + m.questions.length, 0);
    const levelReads = Array.from(readQuestions).filter((id: string) => id.startsWith(`${currentLevel}-`));
    return totalQuestions === 0 ? 0 : (levelReads.length / totalQuestions) * 100;
  }, [levelData, readQuestions, currentLevel]);

  const handleLevelSelect = (level: LevelType) => {
    setCurrentLevel(level);
    setCurrentModuleId(null); // Reset module
  };

  const handleGoHome = () => {
    setCurrentLevel(null);
    setCurrentModuleId(null);
  };

  const handleMarkRead = (qIndex: number) => {
    if (currentLevel && currentModuleId) {
      const id = `${currentLevel}-${currentModuleId}-${qIndex}`;
      setReadQuestions(prev => new Set(prev).add(id));
    }
  };

  // --- RENDER: LANDING PAGE ---
  if (!currentLevel) {
    return (
      <div className="min-h-screen bg-slate-50 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
              Kubernetes <span className="text-blue-600">Ultimate Hub</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium">
              AI-Powered Interview Trainer. Master K8s from Core to Kernel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {(Object.values(LEVELS) as LevelConfig[]).map((level, idx) => (
              <div 
                key={level.id}
                onClick={() => handleLevelSelect(level.id)}
                className={`bg-white rounded-2xl shadow-lg border-t-4 ${level.borderColor} p-8 cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group flex flex-col animate-fade-in`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{level.icon}</div>
                <h2 className={`text-2xl font-bold text-slate-800 ${level.textHover} transition-colors`}>{level.title}</h2>
                <p className={`text-xs font-bold uppercase tracking-wider mb-4 mt-1 text-${level.color}`}>{level.subTitle}</p>
                <p className="text-slate-600 mb-8 text-sm leading-relaxed flex-grow">
                  {level.description}
                </p>
                <button className={`w-full py-3 rounded-lg font-bold text-sm bg-slate-50 text-slate-700 ${level.bgHover} group-hover:text-white transition-all`}>
                  Start Training
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: MAIN APP ---
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-900 text-white flex flex-col flex-shrink-0 shadow-xl z-20 hidden md:flex">
        <div className="p-6 border-b border-slate-800 bg-slate-900">
          <button onClick={handleGoHome} className="text-xs text-slate-400 hover:text-white mb-4 flex items-center gap-1 transition-colors uppercase tracking-wider font-bold">
            ← Change Level
          </button>
          <h1 className="text-xl font-bold text-white tracking-tight">K8s Trainer</h1>
          <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-${levelData?.color} text-white`}>
            {levelData?.title}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {levelData?.modules.map(mod => (
            <button
              key={mod.id}
              onClick={() => setCurrentModuleId(mod.id)}
              className={`w-full text-left px-4 py-3 rounded-lg mb-1 text-sm font-medium transition-all flex items-center justify-between group
                ${currentModuleId === mod.id 
                  ? 'bg-white/10 text-white border-l-4 border-white' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                }`}
            >
              <span className="truncate mr-2">{mod.title}</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 group-hover:text-white">{mod.questions.length}</span>
            </button>
          ))}
        </nav>

        <div className="p-5 bg-slate-800 border-t border-slate-700">
          <div className="flex justify-between items-end mb-2">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Progress</div>
            <div className="text-sm font-mono text-white">{Math.round(progress)}%</div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`bg-${levelData?.color} h-2 rounded-full transition-all duration-500`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10 flex-shrink-0">
          <div className="md:hidden mr-4">
             <button onClick={handleGoHome} className="text-slate-500">←</button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800">
              {activeModule ? activeModule.title : "Select a Module"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5 hidden md:block">
              {activeModule ? activeModule.desc : "Choose a topic from the sidebar"}
            </p>
          </div>
        </header>

        {/* Questions Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-24 scroll-smooth">
          {activeModule ? (
            <div className="max-w-3xl mx-auto animate-fade-in">
              {activeModule.questions.map((q, idx) => (
                <QuestionCard
                  key={idx}
                  index={idx}
                  data={q}
                  isRead={readQuestions.has(`${currentLevel}-${activeModule.id}-${idx}`)}
                  onReveal={() => handleMarkRead(idx)}
                  levelColor={levelData?.color || 'blue-600'}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
              <div className="text-6xl mb-4">👈</div>
              <p className="text-lg font-medium text-center">Select a module from the menu<br/>to load questions.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;