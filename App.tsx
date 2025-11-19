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
  
  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('k8s-trainer-theme') === 'dark';
  });

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('k8s-trainer-bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // Favorites/Difficult State
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('k8s-trainer-favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem('k8s-trainer-bookmarks', JSON.stringify(Array.from(bookmarks)));
  }, [bookmarks]);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('k8s-trainer-favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  // Persist Theme - This applies the class to the HTML tag which Tailwind watches
  useEffect(() => {
    localStorage.setItem('k8s-trainer-theme', darkMode ? 'dark' : 'light');
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

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

  // Logic for Views
  const isBookmarksView = currentModuleId === 'bookmarks' && !isSearchActive;
  const isFavoritesView = currentModuleId === 'favorites' && !isSearchActive;
  
  const activeModule = !isBookmarksView && !isFavoritesView && !isSearchActive && levelData 
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

  // Calculate favorites count for current level
  const levelFavoritesCount = useMemo(() => {
    if (!currentLevel) return 0;
    return Array.from(favorites).filter((id: string) => id.startsWith(`${currentLevel}-`)).length;
  }, [favorites, currentLevel]);

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

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
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

  const handleFavoritesSelect = () => {
    setCurrentModuleId('favorites');
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

    // 2. Favorites View (Marked as Difficult)
    if (isFavoritesView) {
      const favs: Array<{ data: any, id: string, originalIndex: number }> = [];
      levelData.modules.forEach(mod => {
        mod.questions.forEach((q, idx) => {
          const id = `${currentLevel}-${mod.id}-${idx}`;
          if (favorites.has(id)) {
            favs.push({ data: q, id, originalIndex: idx });
          }
        });
      });
      return favs;
    }

    // 3. Bookmarks View
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

    // 4. Specific Module View
    if (activeModule) {
      return activeModule.questions.map((q, idx) => ({
        data: q,
        id: `${currentLevel}-${activeModule.id}-${idx}`,
        originalIndex: idx
      }));
    }

    return [];
  }, [levelData, isBookmarksView, isFavoritesView, activeModule, bookmarks, favorites, currentLevel, searchQuery, isSearchActive]);

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
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-y-auto">
        <div className="absolute top-4 right-4 z-50">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-md text-slate-600 dark:text-slate-300 hover:scale-110 border border-slate-200 dark:border-slate-700"
              aria-label="Сменить тему"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-16 pb-32">
          <div className="text-center mb-8 md:mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 md:mb-6">
              Kubernetes <span className="text-blue-600 dark:text-blue-400">Ultimate Hub</span>
            </h1>
            <p className="text-base md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
              AI-тренажер для подготовки к техническим интервью. Освойте K8s от базовых примитивов до ядра Linux.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {(Object.values(LEVELS) as LevelConfig[]).map((level, idx) => (
              <div 
                key={level.id}
                onClick={() => handleLevelSelect(level.id)}
                className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-t-4 ${level.borderColor} p-6 md:p-8 cursor-pointer hover:-translate-y-1 hover:shadow-xl group flex flex-col animate-fade-in active:scale-[0.98] md:active:scale-100 border-x border-b border-slate-100 dark:border-slate-700/50`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center justify-between md:block mb-4 md:mb-6">
                    <div className="text-4xl md:text-6xl transform group-hover:scale-110 transition-transform duration-300">{level.icon}</div>
                    <h2 className={`text-xl md:text-2xl font-bold text-slate-800 dark:text-white ${level.textHover} transition-colors md:mt-6`}>{level.title}</h2>
                </div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 md:mb-4 mt-1 text-${level.color} dark:opacity-90`}>{level.subTitle}</p>
                <p className="text-slate-600 dark:text-slate-300 mb-6 md:mb-8 text-sm leading-relaxed flex-grow">
                  {level.description}
                </p>
                <button className={`w-full py-3 rounded-lg font-bold text-sm bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 ${level.bgHover} group-hover:text-white transition-all shadow-sm border border-slate-100 dark:border-slate-600`}>
                  Начать обучение
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
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 relative">
      
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 md:w-80 
        bg-slate-900 dark:bg-slate-950 
        text-white flex flex-col flex-shrink-0 shadow-2xl transition-all duration-300 ease-in-out border-r border-slate-800 dark:border-slate-900
        md:static md:translate-x-0 md:shadow-xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 dark:border-slate-900 bg-slate-900 dark:bg-slate-950">
          {/* Sidebar Header with Level Switcher */}
          <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-white tracking-tight cursor-pointer" onClick={handleGoHome}>K8s Trainer</h1>
              <div className="flex items-center gap-3 md:hidden">
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-slate-800 dark:bg-slate-900 text-slate-400 hover:text-white transition-colors border border-slate-700"
                  aria-label="Сменить тему"
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
          </div>
          
          {/* Inline Level Switcher */}
          <div className="grid grid-cols-3 gap-2">
            {(Object.values(LEVELS) as LevelConfig[]).map((level) => {
                const isActive = currentLevel === level.id;
                return (
                  <button
                    key={level.id}
                    onClick={() => handleLevelSelect(level.id)}
                    className={`
                      px-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-center border
                      ${isActive 
                        ? `bg-${level.color} text-white border-${level.color} shadow-md transform scale-105` 
                        : 'bg-slate-800 dark:bg-slate-900 text-slate-500 border-slate-700 hover:bg-slate-700 hover:text-slate-300'
                      }
                    `}
                  >
                    {level.title}
                  </button>
                );
            })}
          </div>
        </div>

        {/* Search Input */}
        <div className="px-4 pt-4 pb-2 bg-slate-900 dark:bg-slate-950">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-700 dark:border-slate-800 rounded-lg leading-5 bg-slate-800 dark:bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-700 focus:border-slate-600 focus:text-white sm:text-sm"
              placeholder="Фильтр модулей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearchActive && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white cursor-pointer group/app relative"
                aria-label="Очистить поиск"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 bg-slate-900 dark:bg-slate-950">
          {/* Bookmarks & Favorites Navigation Items */}
          {!isSearchActive && (
            <>
              <button
                onClick={handleFavoritesSelect}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 text-sm font-bold transition-all flex items-center gap-2 group
                  ${currentModuleId === 'favorites' 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
              >
                  <svg className="w-4 h-4 text-rose-500 fill-current" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                <span className="flex-grow">Важное / Сложное</span>
                {levelFavoritesCount > 0 && (
                    <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-extrabold shadow-sm">
                      {levelFavoritesCount}
                    </span>
                )}
              </button>

              <button
                onClick={handleBookmarksSelect}
                className={`w-full text-left px-4 py-3 rounded-lg mb-4 text-sm font-bold transition-all flex items-center gap-2 group
                  ${currentModuleId === 'bookmarks' 
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
              >
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <span className="flex-grow">Закладки</span>
                {levelBookmarksCount > 0 && (
                    <span className="text-[10px] bg-yellow-500 text-slate-900 px-2 py-0.5 rounded-full font-extrabold shadow-sm">
                      {levelBookmarksCount}
                    </span>
                )}
              </button>
              <div className="h-px bg-slate-800 dark:bg-slate-900 mb-4 mx-2"></div>
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
                <span className="text-[10px] bg-slate-800 dark:bg-slate-900 px-2 py-0.5 rounded-full text-slate-500 group-hover:text-white">{mod.questions.length}</span>
              </button>
            ))
          ) : (
              <div className="text-center py-4 text-slate-500 text-xs">Модули не найдены</div>
          )}
        </nav>

        <div className="p-5 bg-slate-800 dark:bg-slate-950 border-t border-slate-700 dark:border-slate-900">
          <div className="flex justify-between items-end mb-2">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Прогресс</div>
            <div className="text-sm font-mono text-white">{Math.round(progress)}%</div>
          </div>
          <div className="w-full bg-slate-700 dark:bg-slate-900 rounded-full h-2">
            <div 
              className={`bg-${levelData?.color} h-2 rounded-full transition-all duration-500`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50 dark:bg-slate-900 w-full">
        {/* Mobile Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-4 md:px-6 flex items-center shadow-sm z-10 flex-shrink-0">
          <div className="md:hidden mr-3 flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(true)} 
                className="text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 -ml-2"
                aria-label="Открыть меню"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white truncate">
                {isSearchActive
                    ? "Результаты поиска"
                    : isFavoritesView
                    ? "Важное / Сложное"
                    : isBookmarksView 
                        ? "Закладки" 
                        : (activeModule ? activeModule.title : "Выберите модуль")}
                </h2>
                  {/* Show Level Badge on Mobile Header */}
                  <span className={`md:hidden px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-${levelData?.color} text-white`}>
                    {levelData?.title}
                  </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate">
                {isSearchActive
                ? `Найдено совпадений: ${questionsToDisplay.length}`
                : isFavoritesView
                  ? "Вопросы, отмеченные как сложные"
                  : isBookmarksView 
                    ? "Ваши сохраненные темы" 
                    : (activeModule ? activeModule.desc : "Выберите тему в меню слева")}
            </p>
          </div>
          
          {/* Desktop Theme Toggle */}
          <button 
              onClick={toggleTheme}
              className="hidden md:flex ml-4 p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 hover:scale-105 border border-slate-200 dark:border-slate-600"
              aria-label="Сменить тему"
            >
              {darkMode ? '☀️' : '🌙'}
          </button>
        </header>

        {/* Questions Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 scroll-smooth">
          {questionsToDisplay.length > 0 ? (
            <div className="max-w-3xl mx-auto animate-fade-in">
              {questionsToDisplay.map((item) => (
                <div key={item.id}>
                    {isSearchActive && (item as any).moduleTitle && (
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6 first:mt-0">
                          Модуль: {(item as any).moduleTitle}
                        </div>
                    )}
                  <QuestionCard
                    index={item.originalIndex}
                    data={item.data}
                    isRead={readQuestions.has(item.id)}
                    isBookmarked={bookmarks.has(item.id)}
                    isFavorite={favorites.has(item.id)}
                    onReveal={() => handleMarkRead(item.id)}
                    onToggleBookmark={() => toggleBookmark(item.id)}
                    onToggleFavorite={() => toggleFavorite(item.id)}
                    levelColor={levelData?.color || 'blue-600'}
                    searchQuery={searchQuery}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 opacity-60 p-6 text-center">
              {isSearchActive ? (
                <>
                  <div className="text-5xl md:text-6xl mb-4">🔍</div>
                  <p className="text-base md:text-lg font-medium">По запросу "{searchQuery}" ничего не найдено.<br/>Попробуйте изменить ключевые слова.</p>
                </>
              ) : isFavoritesView ? (
                <>
                    <div className="text-5xl md:text-6xl mb-4 opacity-50 text-rose-400">❤️</div>
                    <p className="text-base md:text-lg font-medium">Нет сложных вопросов.<br/>Нажмите на иконку сердца, чтобы отметить сложные темы.</p>
                </>
              ) : isBookmarksView ? (
                <>
                  <div className="text-5xl md:text-6xl mb-4 opacity-50 text-yellow-400">⭐</div>
                  <p className="text-base md:text-lg font-medium">Нет закладок.<br/>Нажмите на звездочку, чтобы сохранить вопрос.</p>
                </>
              ) : (
                <>
                  <div className="text-5xl md:text-6xl mb-4">👈</div>
                  <p className="text-base md:text-lg font-medium">Выберите модуль в меню,<br/>чтобы загрузить вопросы.</p>
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