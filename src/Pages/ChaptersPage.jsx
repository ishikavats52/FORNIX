import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    fetchChaptersBySubject,
    fetchTopicsByChapter,
    fetchChapterNotes,
    selectChapters,
    selectTopicsForChapter,
    selectChapterNotes,
    selectChaptersLoading,
} from '../redux/slices/chaptersSlice';
import { selectUser } from '../redux/slices/authSlice';
import { selectUserProfile, fetchUserDetails } from '../redux/slices/userSlice';
import PDFViewerModal from '../Components/PDFViewerModal';
import ChapterQuizModal from '../Components/ChapterQuizModal';
import UpgradePrompt from '../Components/UpgradePrompt';
import QuizAttemptsCounter from '../Components/QuizAttemptsCounter';
import { canAttemptQuiz, getUsedQuizAttempts, hasExceededQuizLimit, getNoteType } from '../utils/accessControl';

function ChaptersPage() {
    const { subjectId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Potentially passed from previous page
    const courseId = location.state?.courseId || '029ec354-81bf-460e-a444-a04051a3b13d'; // Default or from params

    const chapters = useSelector(selectChapters);
    const loading = useSelector(selectChaptersLoading);
    const user = useSelector(selectUser);
    const userProfile = useSelector(selectUserProfile);

    // Use profile if available, otherwise fall back to auth user
    const activeUser = userProfile || user;

    // Fetch full user profile if we only have basic auth info
    useEffect(() => {
        if (user?.user_id && !userProfile) {
            dispatch(fetchUserDetails(user.user_id));
        } else if (user?.id && !userProfile) {
            dispatch(fetchUserDetails(user.id));
        }
    }, [dispatch, user, userProfile]);

    const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'quizzes'
    const [expandedChapters, setExpandedChapters] = useState({});
    const [selectedChapters, setSelectedChapters] = useState([]);

    // PDF Viewer State
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [selectedPdf, setSelectedPdf] = useState(null);

    // Upgrade Prompt State
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

    useEffect(() => {
        if (subjectId) {
            dispatch(fetchChaptersBySubject(subjectId));
        }
    }, [dispatch, subjectId]);

    const handleSelectChapter = (chapterId) => {
        setSelectedChapters(prev =>
            prev.includes(chapterId)
                ? prev.filter(id => id !== chapterId)
                : [...prev, chapterId]
        );
    };

    const toggleChapter = (chapterId) => {
        const isExpanding = !expandedChapters[chapterId];

        setExpandedChapters(prev => ({
            ...prev,
            [chapterId]: isExpanding
        }));

        // Fetch content only if we are expanding
        if (isExpanding) {
            if (activeTab === 'notes') {
                const noteType = getNoteType(user, courseId);
                dispatch(fetchChapterNotes({ courseId, chapterId, noteType }));
            } else {
                // Fetch topics for quizzes tab
                dispatch(fetchTopicsByChapter(chapterId));
            }
        }
    };

    // When tab changes, if any section is open, we might need to fetch data for it
    useEffect(() => {
        Object.keys(expandedChapters).forEach(chapterId => {
            if (expandedChapters[chapterId]) {
                if (activeTab === 'notes') {
                    const noteType = getNoteType(activeUser, courseId);
                    dispatch(fetchChapterNotes({ courseId, chapterId, noteType }));
                } else {
                    dispatch(fetchTopicsByChapter(chapterId));
                }
            }
        });
    }, [activeTab, dispatch, courseId, activeUser]);

    const handleOpenPdf = (note) => {
        const url = note.file_url || note.pdf_url || note.url;
        setSelectedPdf({ url: url, title: note.title || note.name || 'Document' });
        setShowPdfModal(true);
    };

    // Check quiz access before navigation
    const handleQuizNavigation = (path) => {
        // Check if user can attempt quiz
        if (!canAttemptQuiz(activeUser, courseId)) {
            setShowUpgradePrompt(true);
            return false;
        }
        navigate(path);
        return true;
    };

    if (loading && chapters.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8 flex md:items-center justify-between flex-col md:flex-row gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Study Content</h1>
                        <p className="text-gray-600 mt-2">Access notes and question bank for this subject</p>
                    </div>

                    {/* Quiz Attempts Counter for Free Users */}
                    {activeUser && !activeUser.has_active_subscription && (
                        <div className="md:w-80">
                            <QuizAttemptsCounter
                                used={getUsedQuizAttempts(activeUser)}
                                total={2}
                            />
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-6 mb-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`pb-3 px-2 font-bold text-lg transition-all relative flex items-center gap-2 ${activeTab === 'notes'
                            ? 'text-orange-500'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <svg className={`w-5 h-5 transition-colors ${activeTab === 'notes' ? 'text-orange-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Study Notes
                        {activeTab === 'notes' && (
                            <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-600 rounded-t-full"></span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('quizzes')}
                        className={`pb-3 px-2 font-bold text-lg transition-all relative flex items-center gap-2 ${activeTab === 'quizzes'
                            ? 'text-orange-500'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <svg className={`w-5 h-5 transition-colors ${activeTab === 'quizzes' ? 'text-orange-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.726 2.179a2 2 0 01-1.96 1.414H8a2 2 0 01-1.96-1.414l-.726-2.179a2 2 0 00-1.96-1.414l-2.387.477a2 2 0 00-1.022.547l-1.16 1.16a2 2 0 01-2.828 0l-3.374-3.374a2 2 0 010-2.828l1.16-1.16a2 2 0 00.547-1.022l.477-2.387a2 2 0 00-1.414-1.96L.841 7.234a2 2 0 01-1.414-1.96V4a2 2 0 011.414-1.96l2.179-.726a2 2 0 001.414-1.96l-.477-2.387a2 2 0 00.547-1.022l1.16-1.16a2 2 0 012.828 0l3.374 3.374a2 2 0 010 2.828l-1.16 1.16a2 2 0 00-.547-1.022l-.477-2.387a2 2 0 001.414-1.96l.726-2.179a2 2 0 011.96-1.414H16a2 2 0 011.96 1.414l.726 2.179a2 2 0 001.96 1.414l2.387-.477a2 2 0 001.022-.547l1.16-1.16a2 2 0 012.828 0l3.374 3.374a2 2 0 010 2.828l-1.16 1.16z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        Question Bank
                        {activeTab === 'quizzes' && (
                            <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-600 rounded-t-full"></span>
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
                    {chapters.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500 text-lg">No chapters available for this subject yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {chapters.map(chapter => (
                                <ChapterAccordion
                                    key={chapter.id}
                                    chapter={chapter}
                                    activeTab={activeTab}
                                    isOpen={!!expandedChapters[chapter.id]}
                                    onToggle={() => toggleChapter(chapter.id)}
                                    isSelected={selectedChapters.includes(chapter.id)}
                                    onSelect={() => handleSelectChapter(chapter.id)}
                                    onOpenPdf={handleOpenPdf}
                                    onQuizNavigate={handleQuizNavigation}
                                    courseId={courseId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <PDFViewerModal
                isOpen={showPdfModal}
                onClose={() => setShowPdfModal(false)}
                pdfUrl={selectedPdf?.url}
                title={selectedPdf?.title}
            />

            {/* Floating Bulk Quiz Bar */}
            {selectedChapters.length > 0 && activeTab === 'quizzes' && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] p-4 z-50 transform transition-transform duration-300 translate-y-0">
                    <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div>
                            <span className="font-bold text-lg text-gray-900">{selectedChapters.length}</span>
                            <span className="text-gray-600 ml-2">Chapter{selectedChapters.length > 1 ? 's' : ''} Selected</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedChapters([])}
                                className="px-4 py-2 text-gray-500 font-semibold hover:text-gray-800 transition"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={() => handleQuizNavigation(`/quiz/start?multiChapterIds=${selectedChapters.join(',')}`)}
                                className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                            >
                                ⚡ Start Bulk Test
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade Prompt Modal */}
            <UpgradePrompt
                isOpen={showUpgradePrompt}
                onClose={() => setShowUpgradePrompt(false)}
                feature="quiz"
                user={activeUser}
                courseId={courseId}
            />
        </div>
    );
}

// Sub-component for Accordion Item
function ChapterAccordion({ chapter, activeTab, isOpen, onToggle, isSelected, onSelect, onOpenPdf, onQuizNavigate, courseId }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const notesData = useSelector(selectChapterNotes(chapter.id));
    const topicsData = useSelector(selectTopicsForChapter(chapter.id));
    const chapterTopics = topicsData.topics;

    const [isChapterQuizModalOpen, setChapterQuizModalOpen] = useState(false);

    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md bg-white">
            <div className={`w-full flex items-center justify-between p-5 transition-colors ${isOpen ? 'bg-orange-50/50' : 'bg-white hover:bg-gray-50'}`}>
                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={onToggle}>
                    {activeTab === 'quizzes' && (
                        <div
                            className="mr-2 flex items-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect();
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => { }} // Controlled via onClick div wrapper 
                                className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                            />
                        </div>
                    )}
                    <span className={`p-2 rounded-lg ${activeTab === 'notes' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                        {activeTab === 'notes' ? '📄' : '🧩'}
                    </span>
                    <div>
                        <h3 className={`font-bold text-lg ${isOpen ? 'text-orange-900' : 'text-gray-800'}`}>{chapter.name}</h3>
                        <p className="text-gray-500 text-xs mt-1">{chapter.description || 'View content'}</p>
                    </div>
                </div>
                <div onClick={onToggle} className={`cursor-pointer w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-orange-200 rotate-180 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Expanded Content */}
            <div className={`transition-all duration-300 ease-in-out border-t border-dashed border-gray-200 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="p-6 bg-white">
                    {/* NOTES VIEW */}
                    {activeTab === 'notes' && (
                        <div>
                            {notesData.loading ? (
                                <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div></div>
                            ) : notesData.notes && notesData.notes.length > 0 ? (
                                <div className="grid gap-3">
                                    {notesData.notes.map((note, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-orange-50 border border-gray-100 hover:border-orange-200 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white p-2 rounded shadow-sm text-red-500">
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 group-hover:text-orange-700 transition-colors">{note.title}</h4>
                                                    <p className="text-xs text-gray-500">{note.description || 'PDF Document'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onOpenPdf(note)}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all shadow-sm"
                                            >
                                                View
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 italic">No notes available for this chapter.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* QUIZZES / TOPICS VIEW */}
                    {activeTab === 'quizzes' && (
                        <div>
                            <div className={`flex ${chapterTopics.length > 0 ? 'justify-between' : 'justify-center'} items-center mb-6 py-2`}>
                                {chapterTopics.length > 0 && (
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Available Topics</p>
                                )}
                                <button
                                    onClick={() => setChapterQuizModalOpen(true)}
                                    className={`flex items-center gap-2 group transition-all duration-300 ${chapterTopics.length > 0
                                        ? 'px-4 py-2 bg-orange-100 text-orange-700 hover:bg-orange-500 hover:text-white'
                                        : 'px-8 py-4 bg-orange-500 text-white hover:bg-orange-600 scale-110 shadow-lg hover:shadow-orange-200'
                                        } rounded-xl font-bold text-sm md:text-base`}
                                >
                                    <span className={`text-lg transition-transform group-hover:rotate-12 ${chapterTopics.length === 0 ? 'text-2xl' : ''}`}>⚡</span>
                                    {chapterTopics.length > 0 ? 'Chapter Test' : 'Take Chapter Test'}
                                </button>
                            </div>

                            {chapterTopics.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {chapterTopics.map((topic) => (
                                        <div
                                            key={topic.id}
                                            className="p-4 border border-gray-100 rounded-xl hover:border-orange-300 hover:shadow-md transition-all cursor-pointer flex justify-between items-center group bg-gray-50/30"
                                            onClick={() => onQuizNavigate(`/quiz/start?topicIds=${topic.id}`)}
                                        >
                                            <span className="font-medium text-gray-700 group-hover:text-orange-700">{topic.name}</span>
                                            <div className="w-8 h-8 rounded-full bg-white border border-gray-100 group-hover:bg-orange-500 group-hover:border-orange-500 flex items-center justify-center text-gray-300 group-hover:text-white transition-all">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <ChapterQuizModal
                                isOpen={isChapterQuizModalOpen}
                                onClose={() => setChapterQuizModalOpen(false)}
                                chapter={chapter}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChaptersPage;
