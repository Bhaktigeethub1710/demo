import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { findBestAnswer, getQuickActions } from '@/data/faqData';

const ChatbotWindow = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const prevLanguageRef = useRef(i18n.language);

    // Get welcome message in current language
    const getWelcomeMessage = () => ({
        type: 'bot',
        text: t('chatbot.welcome'),
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    });

    // Initialize with welcome message
    useEffect(() => {
        setMessages([getWelcomeMessage()]);
    }, []);

    // Reset chat with new welcome message when language changes
    useEffect(() => {
        if (prevLanguageRef.current !== i18n.language) {
            setMessages([getWelcomeMessage()]);
            prevLanguageRef.current = i18n.language;
        }
    }, [i18n.language, t]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Reset chat when closing
    const handleClose = () => {
        setMessages([getWelcomeMessage()]);
        setMessage('');
        setIsTyping(false);
        onClose();
    };

    const handleSendMessage = (text = message) => {
        const userText = text.trim();
        if (userText) {
            // Add user message
            const newMessage = {
                type: 'user',
                text: userText,
                timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, newMessage]);
            setMessage('');
            setIsTyping(true);

            // Find the best answer from FAQ data (now language-aware)
            setTimeout(() => {
                const answer = findBestAnswer(userText);
                setMessages(prev => [...prev, {
                    type: 'bot',
                    text: answer,
                    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                }]);
                setIsTyping(false);
            }, 600);
        }
    };

    const handleQuickAction = (action) => {
        handleSendMessage(action);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Get quick actions in current language
    const currentQuickActions = getQuickActions();

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-20 z-40 transition-opacity duration-300"
                    onClick={handleClose}
                />
            )}

            {/* Chat Window */}
            <div
                className={`fixed bottom-6 right-6 z-50 w-[320px] h-[480px] rounded-2xl shadow-2xl transition-all duration-300 ease-out transform ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95 pointer-events-none'
                    }`}
                style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
                }}
            >
                {/* Dark mode variant (you can toggle this based on theme) */}
                <div className="flex flex-col h-full rounded-2xl overflow-hidden bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-slate-700">

                    {/* Header */}
                    <div
                        className="relative px-5 py-4 text-white"
                        style={{
                            background: 'linear-gradient(135deg, #0d47a1 0%, #1e40af 50%, #2563eb 100%)',
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <span className="text-lg font-bold">न्याय</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base">{t('chatbot.assistantName')}</h3>
                                    <p className="text-xs text-blue-100">{t('chatbot.alwaysHere')}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
                                aria-label="Close chat"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-800 dark:to-slate-900">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-md ${msg.type === 'user'
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-sm'
                                        : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 rounded-bl-sm border border-gray-100 dark:border-slate-600'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                                    <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'
                                        }`}>
                                        {msg.timestamp}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex justify-start animate-slide-up">
                                <div className="bg-white dark:bg-slate-700 rounded-2xl px-4 py-3 shadow-md border border-gray-100 dark:border-slate-600 rounded-bl-sm">
                                    <div className="flex space-x-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Actions - Show only at start */}
                        {messages.length === 1 && !isTyping && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {currentQuickActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickAction(action)}
                                        className="px-3 py-1.5 text-xs bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-300 rounded-full border border-blue-200 dark:border-slate-600 hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t('chatbot.placeholder')}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 text-sm transition-all"
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!message.trim() || isTyping}
                                className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-slate-600 dark:disabled:to-slate-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                                aria-label="Send message"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatbotWindow;
