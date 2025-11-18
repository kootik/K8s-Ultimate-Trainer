import React, { useState, useEffect, useMemo } from 'react';
import { LevelType, LevelConfig } from './types';
import { LEVELS } from './constants';
import QuestionCard from './components/QuestionCard';

const App: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState<LevelType | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [readQuestions, setReadQuestions] = useState<Set<string>>(new Set());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('k8s-trainer-bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem('k8s-trainer-bookmarks', JSON.stringify(Array.from(bookmarks)));
  }, [bookmarks]);

  // Derived state for active data
  const levelData = currentLevel ? LEVELS[currentLevel] : null;
  
  // Search Logic Helpers
  const isSearchActive = searchQuery.trim().length > 0;
  
  const filterQuestion = (q: any, query: string, context: string = '') => {
    const lowerQuery = query.toLowerCase();
    return (
      q.q.toLowerCase().includes(lowerQuery) ||
      q.a.toLowerCase().includes(lowerQuery) ||
      (q.tip && q.tip.toLowerCase().includes(lowerQuery)) ||
      context.toLowerCase().includes(lowerQuery)
    );
  };

  // Logic for Bookmarks View
  const isBookmarksView = currentModuleId === 'bookmarks' && !isSearchActive;
  
  const activeModule = !isBookmarksView && !isSearchActive && levelData 
    ? levelData.modules.find(m => m.id === currentModuleId) 
    : null;

  // Calculate progress
  const progress = useMemo(() => {
    if (!levelData) return 0;
    const totalQuestions = levelData.modules.reduce((acc, m) => acc + m.questions.length, 0);
    const levelReads = Array.from(readQuestions).filter((id: string) => id.startsWith(`${currentLevel}-`));
    return totalQuestions === 0 ? 0 : (levelReads.length / totalQuestions) * 100;
  }, [levelData, readQuestions, currentLevel]);

  // Calculate bookmarks count for current level
  const levelBookmarksCount = useMemo(() => {
    if (!currentLevel) return 0;
    return Array.from(bookmarks).filter((id: string) => id.startsWith(`${currentLevel}-`)).length;
  }, [bookmarks, currentLevel]);

  const handleLevelSelect = (level: LevelType) => {
    setCurrentLevel(level);
    setCurrentModuleId(null); // Reset module
    setSearchQuery('');
    setIsMobileMenuOpen(false);
  };

  const handleGoHome = () => {
    setCurrentLevel(null);
    setCurrentModuleId(null);
    setSearchQuery('');
    setIsMobileMenuOpen(false);
  };

  const handleMarkRead = (fullId: string) => {
    setReadQuestions(prev => new Set(prev).add(fullId));
  };

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleModuleSelect = (id: string) => {
    setCurrentModuleId(id);
    setSearchQuery(''); // Clear search when explicitly selecting a module
    setIsMobileMenuOpen(false);
  };

  const handleBookmarksSelect = () => {
    setCurrentModuleId('bookmarks');
    setIsMobileMenuOpen(false);
  };

  // Get questions to display
  const questionsToDisplay = useMemo(() => {
    if (!levelData) return [];

    // 1. Search Mode: Search across ALL modules in current level
    if (isSearchActive) {
      const results: Array<{ data: any, id: string, originalIndex: number, moduleTitle: string }> = [];
      levelData.modules.forEach(mod => {
        mod.questions.forEach((q, idx) => {
          if (filterQuestion(q, searchQuery, mod.desc)) {
            results.push({ 
              data: q, 
              id: `${currentLevel}-${mod.id}-${idx}`, 
              originalIndex: idx,
              moduleTitle: mod.title
            });
          }
        });
      });
      return results;
    }

    // 2. Bookmarks View
    if (isBookmarksView) {
      const bookmarked: Array<{ data: any, id: string, originalIndex: number }> = [];
      levelData.modules.forEach(mod => {
        mod.questions.forEach((q, idx) => {
          const id = `${currentLevel}-${mod.id}-${idx}`;
          if (bookmarks.has(id)) {
            bookmarked.push({ data: q, id, originalIndex: idx });
          }
        });
      });
      return bookmarked;
    }

    // 3. Specific Module View
    if (activeModule) {
      return activeModule.questions.map((q, idx) => ({
        data: q,
        id: `${currentLevel}-${activeModule.id}-${idx}`,
        originalIndex: idx
      }));
    }

    return [];
  }, [levelData, isBookmarksView, activeModule, bookmarks, currentLevel, searchQuery, isSearchActive]);

  // Filter Modules for Sidebar based on Search
  const sidebarModules = useMemo(() => {
    if (!levelData) return [];
    if (!isSearchActive) return levelData.modules;

    return levelData.modules.filter(mod => {
      const titleMatch = mod.title.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = mod.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const questionsMatch = mod.questions.some(q => filterQuestion(q, searchQuery));
      return titleMatch || descMatch || questionsMatch;
    });
  }, [levelData, searchQuery, isSearchActive]);


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
    <div className="flex h-screen overflow-hidden bg-slate-50 relative">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-80 bg-slate-900 text-white flex flex-col flex-shrink-0 shadow-2xl transition-transform duration-300 ease-in-out
        md:static md:translate-x-0 md:shadow-xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 bg-slate-900">
          <button onClick={handleGoHome} className="text-xs text-slate-400 hover:text-white mb-4 flex items-center gap-1 transition-colors uppercase tracking-wider font-bold">
            ← Change Level
          </button>
          <h1 className="text-xl font-bold text-white tracking-tight">K8s Trainer</h1>
          <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-${levelData?.color} text-white`}>
            {levelData?.title}
          </span>
        </div>

        {/* Search Input */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-700 focus:border-slate-600 focus:text-white sm:text-sm transition-colors"
              placeholder="Filter modules & questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearchActive && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
          {/* Bookmarks Navigation Item - Only show if not searching */}
          {!isSearchActive && (
            <>
              <button
                onClick={handleBookmarksSelect}
                className={`w-full text-left px-4 py-3 rounded-lg mb-4 text-sm font-bold transition-all flex items-center gap-2 group
                  ${currentModuleId === 'bookmarks' 
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
              >
                 <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <span className="flex-grow">Saved Questions</span>
                {levelBookmarksCount > 0 && (
                    <span className="text-[10px] bg-yellow-500 text-slate-900 px-2 py-0.5 rounded-full font-extrabold shadow-sm">
                      {levelBookmarksCount}
                    </span>
                )}
              </button>
              <div className="h-px bg-slate-800 mb-4 mx-2"></div>
            </>
          )}

          {sidebarModules.length > 0 ? (
            sidebarModules.map(mod => (
              <button
                key={mod.id}
                onClick={() => handleModuleSelect(mod.id)}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 text-sm font-medium transition-all flex items-center justify-between group
                  ${currentModuleId === mod.id && !isSearchActive
                    ? 'bg-white/10 text-white border-l-4 border-white' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                  }`}
              >
                <span className="truncate mr-2">{mod.title}</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 group-hover:text-white">{mod.questions.length}</span>
              </button>
            ))
          ) : (
             <div className="text-center py-4 text-slate-500 text-xs">No modules found</div>
          )}
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
          <div className="md:hidden mr-4 flex items-center gap-3">
             <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-700 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-slate-100">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
             <button onClick={handleGoHome} className="text-slate-400 text-xs font-bold uppercase tracking-wider hover:text-slate-600 transition-colors">← Levels</button>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-800 truncate">
              {isSearchActive
                ? "🔍 Search Results"
                : isBookmarksView 
                  ? "⭐ Saved Questions" 
                  : (activeModule ? activeModule.title : "Select a Module")}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5 hidden md:block truncate">
               {isSearchActive
                ? `Found ${questionsToDisplay.length} matches for "${searchQuery}"`
                : isBookmarksView 
                  ? "Your personal collection of bookmarked topics" 
                  : (activeModule ? activeModule.desc : "Choose a topic from the sidebar")}
            </p>
          </div>
        </header>

        {/* Questions Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-24 scroll-smooth">
          {questionsToDisplay.length > 0 ? (
            <div className="max-w-3xl mx-auto animate-fade-in">
              {questionsToDisplay.map((item) => (
                <div key={item.id}>
                   {isSearchActive && (item as any).moduleTitle && (
                       <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6 first:mt-0">
                          From: {(item as any).moduleTitle}
                       </div>
                   )}
                  <QuestionCard
                    index={item.originalIndex}
                    data={item.data}
                    isRead={readQuestions.has(item.id)}
                    isBookmarked={bookmarks.has(item.id)}
                    onReveal={() => handleMarkRead(item.id)}
                    onToggleBookmark={() => toggleBookmark(item.id)}
                    levelColor={levelData?.color || 'blue-600'}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
              {isSearchActive ? (
                <>
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-lg font-medium text-center">No matches found for "{searchQuery}".<br/>Try a different keyword.</p>
                </>
              ) : isBookmarksView ? (
                <>
                  <div className="text-6xl mb-4 opacity-50">⭐</div>
                  <p className="text-lg font-medium text-center">No saved questions yet.<br/>Click the star icon on any question to save it.</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">👈</div>
                  <p className="text-lg font-medium text-center">Select a module from the menu<br/>to load questions.</p>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;