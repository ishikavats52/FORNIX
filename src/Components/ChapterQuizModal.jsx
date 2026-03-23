import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchChapterQuiz, selectQuizLoading } from '../redux/slices/quizSlice';
import { selectUser } from '../redux/slices/authSlice';
import { selectUserProfile } from '../redux/slices/userSlice';
import { showNotification } from '../redux/slices/uiSlice';

const ChapterQuizModal = ({ isOpen, onClose, chapter }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const userProfile = useSelector(selectUserProfile);
    const loading = useSelector(selectQuizLoading);

    const activeUser = userProfile || user;

    const [questionType, setQuestionType] = useState('Easy');

    if (!isOpen || !chapter) return null;

    const handleStart = async () => {
        try {
            const payload = {
                chapter_id: chapter.id,
                question_type: questionType.toLowerCase()
            };

            console.log('ChapterQuizModal: Starting with payload:', payload);
            const result = await dispatch(fetchChapterQuiz(payload)).unwrap();
            console.log('ChapterQuizModal: Response result:', result);
            
            onClose();
            // Use attempt_id for navigation if available
            const attemptId = result.attempt_id || result.data?.attempt_id;
            console.log('ChapterQuizModal: Decided attemptId:', attemptId);
            
            if (attemptId) {
                navigate(`/quiz/taking/${attemptId}`, { state: { isChapterQuiz: true } });
            } else {
                console.warn('ChapterQuizModal: No attempt_id found, using direct path');
                navigate('/quiz/taking/direct', { state: { isChapterQuiz: true } });
            }
            
        } catch (error) {
            console.error('Failed to start chapter quiz:', error);
            dispatch(showNotification({
                type: 'error',
                message: typeof error === 'string' ? error : (error?.message || 'Failed to start quiz')
            }));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up border border-gray-100">
                <div className="bg-gradient-to-r from-orange-500 to-pink-600 p-8 text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h3 className="text-2xl font-bold relative z-10 mb-1">Chapter Practice</h3>
                    <p className="text-orange-100 text-sm relative z-10 font-medium">{chapter.name || 'Chapter Quiz'}</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Difficulty */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                            Select Difficulty
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Easy', 'Moderate', 'Difficult'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setQuestionType(type)}
                                    className={`py-4 px-2 rounded-xl font-bold transition-all duration-200 border-2 ${
                                        questionType === type
                                            ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100 scale-105'
                                            : 'bg-white border-gray-100 text-gray-500 hover:border-orange-200 hover:text-orange-600'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleStart}
                            disabled={loading}
                            className="flex-[2] py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-100 hover:shadow-2xl hover:scale-[1.02] transform transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Starting...
                                </>
                            ) : (
                                <>
                                    <span>Start Quiz</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChapterQuizModal;
