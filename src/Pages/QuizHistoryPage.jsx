import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchQuizHistory,
    resetQuiz,
    selectQuizHistory,
    selectQuizLoading,
    selectQuizError,
} from '../redux/slices/quizSlice';
import { selectUser } from '../redux/slices/authSlice';

function QuizHistoryPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector(selectUser);
    const quizHistory = useSelector(selectQuizHistory);
    const loading = useSelector(selectQuizLoading);
    const error = useSelector(selectQuizError);

    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [resetDialog, setResetDialog] = useState({ open: false, chapterId: null, quizTitle: '' });

    useEffect(() => {
        // Get user_id from user object - could be 'user_id', 'id', or 'uuid'
        const userId = user?.user_id || user?.id || user?.uuid;
        if (userId) {
            dispatch(fetchQuizHistory(userId));
        }
    }, [dispatch, user]);

    const handleResetQuiz = async (chapterId, quizTitle) => {
        try {
            await dispatch(resetQuiz({ chapter_id: chapterId })).unwrap();
            // Refresh quiz history after reset
            const userId = user?.user_id || user?.id || user?.uuid;
            if (userId) {
                dispatch(fetchQuizHistory(userId));
            }
            setResetDialog({ open: false, chapterId: null, quizTitle: '' });
            // Show success notification (you can add a notification system)
            alert(`Quiz progress for "${quizTitle}" has been reset successfully!`);
        } catch (error) {
            alert(`Failed to reset quiz: ${error}`);
        }
    };

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'text-green-600 bg-green-50';
        if (percentage >= 60) return 'text-blue-600 bg-blue-50';
        if (percentage >= 40) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredHistory = React.useMemo(() => {
        if (!quizHistory || !Array.isArray(quizHistory)) return [];

        let filtered = [...quizHistory];

        // Apply filter
        if (filter !== 'all') {
            filtered = filtered.filter(quiz => quiz.course_name?.toLowerCase() === filter.toLowerCase());
        }

        // Apply sort
        filtered.sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.completed_at || b.created_at) - new Date(a.completed_at || a.created_at);
            } else if (sortBy === 'score') {
                const scoreA = (a.correct_answers / a.total_questions) * 100;
                const scoreB = (b.correct_answers / b.total_questions) * 100;
                return scoreB - scoreA;
            }
            return 0;
        });

        return filtered;
    }, [quizHistory, filter, sortBy]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-32">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading quiz history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz History</h1>
                    <p className="text-gray-600">Track your progress and review past quizzes</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-50">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Course
                            </label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="all">All Courses</option>
                                <option value="neet pg">NEET PG</option>
                                <option value="neet ug">NEET UG</option>
                                <option value="amc">AMC</option>
                            </select>
                        </div>

                        <div className="flex-1 min-w-50">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sort by
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="date">Date (Newest First)</option>
                                <option value="score">Score (Highest First)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Quiz History List */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {filteredHistory.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quiz History</h3>
                        <p className="text-gray-600 mb-6">You haven't taken any quizzes yet</p>
                        <button
                            onClick={() => navigate('/courses')}
                            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                        >
                            Start Your First Quiz
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredHistory.map((quiz, index) => {
                            const percentage = quiz.total_questions > 0
                                ? Math.round((quiz.correct_answers / quiz.total_questions) * 100)
                                : 0;

                            return (
                                <div
                                    key={quiz.id || index}
                                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => navigate(`/quiz/results/${quiz.id}`)}
                                        >
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                {quiz.quiz_title || quiz.title || 'Quiz'}
                                            </h3>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                {quiz.course_name && (
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                        </svg>
                                                        {quiz.course_name}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {formatDate(quiz.completed_at || quiz.created_at)}
                                                </span>
                                                {quiz.time_taken && (
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {quiz.time_taken}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="ml-6 flex items-center gap-4">
                                            <div className="text-right">
                                                <div className={`text-4xl font-bold mb-1 ${getScoreColor(percentage).split(' ')[0]}`}>
                                                    {percentage}%
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {quiz.correct_answers}/{quiz.total_questions} correct
                                                </div>
                                            </div>

                                            {/* Reset Button */}
                                            {quiz.chapter_id && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setResetDialog({
                                                            open: true,
                                                            chapterId: quiz.chapter_id,
                                                            quizTitle: quiz.quiz_title || quiz.title || 'Quiz'
                                                        });
                                                    }}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-semibold"
                                                    title="Reset quiz progress"
                                                >
                                                    Reset
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Reset Confirmation Dialog */}
                {resetDialog.open && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Reset Quiz Progress?</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to reset your progress for <strong>"{resetDialog.quizTitle}"</strong>?
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleResetQuiz(resetDialog.chapterId, resetDialog.quizTitle)}
                                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                                >
                                    Yes, Reset
                                </button>
                                <button
                                    onClick={() => setResetDialog({ open: false, chapterId: null, quizTitle: '' })}
                                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default QuizHistoryPage;

