import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
    toggleChat,
    sendMessageToAI,
    addUserMessage,
    resetSession,
    restoreSession,
    fetchChatSessions,
    fetchSessionMessages,
    selectChatMessages,
    selectChatLoading,
    selectChatSessionId,
    selectChatIsOpen,
    selectChatSessions,
    selectCourseContext,
    setCourseContext
} from '../redux/slices/chatSlice';
import { selectUser } from '../redux/slices/authSlice';

const ChatWidget = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const messages = useSelector(selectChatMessages);
    const loading = useSelector(selectChatLoading);
    const sessionId = useSelector(selectChatSessionId);
    const isOpen = useSelector(selectChatIsOpen);
    const user = useSelector(selectUser);

    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const sessions = useSelector(selectChatSessions);
    const [showHistory, setShowHistory] = useState(false);

    // Course selector state
    const [selectedCourse, setSelectedCourse] = useState('General');

    const courseOptions = [
        { value: 'General', label: '🌐 General' },
        { value: 'AMC', label: '🇦🇺 AMC' },
        { value: 'NEET UG', label: '🎓 NEET UG' },
        { value: 'NEET PG', label: '🏥 NEET PG' },
        { value: 'FMGE', label: '🇮🇳 FMGE' },
        { value: 'PLAB1', label: '🇬🇧 PLAB1' },
    ];

    // Helper to detect course from query
    const detectCourseFromQuery = (text) => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('amc') || lowerText.includes('australian medical council')) return 'AMC';
        if (lowerText.includes('neet ug') || lowerText.includes('undergraduate')) return 'NEET UG';
        if (lowerText.includes('neet pg') || lowerText.includes('postgraduate')) return 'NEET PG';
        if (lowerText.includes('fmge') || lowerText.includes('foreign medical')) return 'FMGE';
        if (lowerText.includes('plab') || lowerText.includes('plab1') || lowerText.includes('uk medical')) return 'PLAB1';
        return null;
    };

    useEffect(() => {
        const userId = user?.user_id || user?.id;
        if (isOpen && userId) {
            dispatch(fetchChatSessions(userId));
        }
    }, [isOpen, user, dispatch]);

    // Load session from storage on mount
    useEffect(() => {
        const savedSession = localStorage.getItem('chatSessionId');
        const savedCourse = localStorage.getItem('chatCourseContext');

        if (savedSession) {
            dispatch(restoreSession(savedSession));
            dispatch(fetchSessionMessages(savedSession));
        }

        if (savedCourse) {
            dispatch(setCourseContext(savedCourse));
        }
    }, [dispatch]);

    // Auto-detect course from URL on change, but prioritize active session
    useEffect(() => {
        if (sessionId) return; // Don't change context if in an active session

        const path = location.pathname;
        let newCourse = null;

        if (path.includes('/courses/amc')) {
            newCourse = 'AMC';
        } else if (path.includes('/courses/neet-ug')) {
            newCourse = 'NEET UG';
        } else if (path.includes('/courses/neet-pg')) {
            newCourse = 'NEET PG';
        } else if (path.includes('/courses/fmge')) {
            newCourse = 'FMGE';
        } else if (path.includes('/courses/plab1')) {
            newCourse = 'PLAB1';
        } else if (path === '/' || path === '/dashboard') {
            // Reset to General only on main pages, keep context otherwise if navigating deeply?
            // Actually, safer to default to General if not in a course route to avoid confusion
            newCourse = 'General'; // Set newCourse to General
        }

        if (newCourse && newCourse !== selectedCourse) {
            dispatch(setCourseContext(newCourse));
        }
    }, [location.pathname, sessionId, selectedCourse, dispatch]);

    // Save context and session to localStorage
    useEffect(() => {
        if (sessionId) {
            localStorage.setItem('chatSessionId', sessionId);
        } else {
            localStorage.removeItem('chatSessionId'); // Clear if sessionId becomes null
        }
        if (selectedCourse) {
            localStorage.setItem('chatCourseContext', selectedCourse);
        } else {
            localStorage.removeItem('chatCourseContext'); // Clear if selectedCourse becomes null
        }
    }, [sessionId, selectedCourse]);

    const handleSessionClick = (sessionId) => {
        dispatch(fetchSessionMessages(sessionId));
        setShowHistory(false);
    };

    const handleNewChat = () => {
        dispatch(resetSession());
        localStorage.removeItem('chatSessionId');
        localStorage.removeItem('chatCourseContext');
        setShowHistory(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!showHistory) {
            scrollToBottom();
        }
    }, [messages, isOpen, showHistory]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Determine course to send
        let courseToSend = selectedCourse;

        // Always try to infer from query to allow cross-course questions
        const detected = detectCourseFromQuery(input);
        if (detected) {
            courseToSend = detected;
            // Update state so UI reflects the new context if needed, or keep it as is?
            // User might be confused if the UI suddenly changes "General" to "AMC" just by asking one question
            // But it's helpful feedback. Let's update it for consistency.
            if (detected !== selectedCourse) {
                setSelectedCourse(detected);
            }
        }

        dispatch(addUserMessage(input));
        dispatch(sendMessageToAI({
            userId: user?.user_id || user?.id || 'guest',
            query: input,
            courseName: courseToSend,
            sessionId: sessionId
        }));
        setInput(''); 
    };

    if (!user) return null; // Or show prompt to login

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            <div
                className={`bg-white h-0 w-0  ${isOpen && "h-[500px] max-w-[calc(100vw-2rem)] max-h-[70vh] w-96"}  rounded-2xl shadow-2xl border border-orange-100 flex flex-col transition-all duration-300 transform origin-bottom-right mb-4 overflow-hidden ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
                    }`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <span className="text-lg">🤖</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">FORNIX AI</h3>
                            <p className="text-xs text-orange-100">Study Companion</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (!showHistory) {
                                    dispatch(fetchChatSessions(user?.user_id || user?.id));
                                }
                                setShowHistory(!showHistory);
                            }}
                            className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                            title="History"
                        >
                            <span className="text-lg">🕒</span>
                        </button>
                        <button
                            onClick={() => dispatch(toggleChat())}
                            className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                    {showHistory ? (
                        <div className="absolute inset-0 bg-white z-10 flex flex-col">
                            <div className="p-4 border-b border-orange-100 flex justify-between items-center bg-orange-50/50">
                                <h4 className="font-bold text-gray-700">Unified History</h4>
                                <button onClick={handleNewChat} className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-full hover:bg-orange-600 shadow-sm font-medium">
                                    + New Chat
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {sessions.length === 0 ? (
                                    <p className="text-center text-gray-400 text-sm mt-10">No history found</p>
                                ) : (
                                    sessions.map((session) => (
                                        <button
                                            key={session.id}
                                            onClick={() => handleSessionClick(session.id)}
                                            className={`w-full text-left p-3 rounded-xl border transition-all ${sessionId === session.id ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100 hover:border-orange-200 hover:bg-orange-50/30'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className="font-semibold text-gray-800 text-sm block mb-0.5">{session.course_name || 'General'}</span>
                                                <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{new Date(session.started_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">Session ID: {session.id.slice(0, 8)}...</p>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-orange-50/30 flex flex-col" style={{ height: '100%' }}>
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                            ? 'bg-orange-500 text-white rounded-br-none'
                                            : 'bg-white border border-orange-100 text-gray-700 rounded-bl-none shadow-sm'
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-orange-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-100"></span>
                                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area (Hide when in History view) */}
                {!showHistory && (
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-orange-100 shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-gray-50"
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="bg-orange-500 text-white p-2.5 rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-orange-200"
                            >
                                <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Floating Toggle Button */}
            <button
                onClick={() => dispatch(toggleChat())}
                className={`bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg shadow-orange-300 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center ${isOpen ? 'rotate-90 opacity-0 pointer-events-none absolute' : 'opacity-100'}`}
            >
                <span className="text-2xl">💬</span>
            </button>

            {/* Alternative Close Button when open (optional, often toggle inside header is enough but FAB could morph) */}
            {/* For now, just the header close button handles closing */}
        </div>
    );
};

export default ChatWidget;
