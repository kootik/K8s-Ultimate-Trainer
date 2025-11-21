
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createChatSession, checkGlobalChatRateLimit, recordGlobalChatMessage } from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

const GlobalChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '👋 Привет! Я твой AI-ментор. Я могу объяснить любую тему по Kubernetes, Docker или Python. Просто спроси!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatSessionRef = useRef<Chat | null>(null); 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initialize chat session only once
  useEffect(() => {
    if (!chatSessionRef.current) {
        try {
            chatSessionRef.current = createChatSession();
        } catch (e) {
            console.error("Failed to create chat session:", e);
        }
    }
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();

    // Rate Limit Check
    const { allowed, timeLeft } = checkGlobalChatRateLimit();
    if (!allowed) {
        const minutes = Math.ceil((timeLeft || 0) / 60000);
        setMessages(prev => [...prev, 
            { role: 'user', text: userMsg },
            { role: 'model', text: `⚠️ **Лимит сообщений превышен (10/час).**\n\nПожалуйста, подождите ${minutes} мин. перед следующим вопросом. Это ограничение помогает поддерживать сервис бесплатным и быстрым для всех. ⏳` }
        ]);
        setInput('');
        return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);
    
    // Record usage
    recordGlobalChatMessage();

    try {
        if (!chatSessionRef.current) {
             chatSessionRef.current = createChatSession();
        }

        const result = await chatSessionRef.current.sendMessageStream({ message: userMsg });
        
        let fullResponse = "";
        // Add placeholder for model response
        setMessages(prev => [...prev, { role: 'model', text: '' }]);

        for await (const chunk of result) {
             const c = chunk as GenerateContentResponse;
             const text = c.text;
             if (text) {
                 fullResponse += text;
                 setMessages(prev => {
                     const newArr = [...prev];
                     const lastMsg = newArr[newArr.length - 1];
                     if (lastMsg.role === 'model') {
                         lastMsg.text = fullResponse;
                     }
                     return newArr;
                 });
             }
        }
    } catch (error) {
        console.error("Chat Error", error);
        setMessages(prev => [...prev, { role: 'model', text: '⚠️ Ошибка соединения. Пожалуйста, попробуйте еще раз.' }]);
        // Try to re-init session if it failed
        try {
            chatSessionRef.current = createChatSession();
        } catch(e) {}
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
        {/* Toggle Button */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center ${isOpen ? 'bg-slate-800 text-slate-300 rotate-45' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
            title={isOpen ? "Закрыть чат" : "Нужна помощь?"}
        >
            {isOpen ? (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            )}
        </button>

        {/* Chat Window */}
        <div className={`fixed bottom-24 right-4 md:right-6 z-50 w-[90vw] md:w-[400px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10 pointer-events-none'} max-h-[70vh] md:max-h-[600px] h-[600px]`}>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-violet-600 flex items-center justify-center text-white text-lg shadow-md">
                        🤖
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                            AI Ментор
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            Gemini 2.5 Flash (Free)
                        </p>
                    </div>
                </div>
                <button onClick={() => setMessages([])} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Очистить историю">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-black/20 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                             msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                         }`}>
                            {msg.role === 'model' ? (
                                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:m-0 prose-ul:my-1 prose-ul:pl-4 prose-ol:pl-4 prose-code:bg-slate-100 dark:prose-code:bg-slate-900 prose-code:px-1 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:text-pink-600 dark:prose-code:text-pink-400">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                </div>
                            ) : (
                                msg.text
                            )}
                         </div>
                    </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-1.5">
                             <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                             <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                             <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 shrink-0">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Задай вопрос..."
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-400"
                />
                <button 
                    type="submit" 
                    disabled={!input.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
            </form>
        </div>
    </>
  );
};

export default GlobalChatBot;
