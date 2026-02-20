import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMixedQuiz, selectQuizLoading } from '../redux/slices/quizSlice';
import { selectUser } from '../redux/slices/authSlice';
import { selectUserProfile, fetchUserDetails } from '../redux/slices/userSlice';
import { canAttemptQuiz, trackQuizAttempt } from '../utils/accessControl';

const MixedQuizModal = ({ isOpen, onClose, chapterId, chapterName, courseId = null, onAccessDenied = null }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const userProfile = useSelector(selectUserProfile);
    const loading = useSelector(selectQuizLoading);

    // Use profile if available, otherwise fall back to auth user
    const activeUser = userProfile || user;

    // Fetch full user profile if we only have basic auth info
    // Only run this if the modal is open, to save resources
    React.useEffect(() => {
        if (isOpen && user?.user_id && !userProfile) {
            dispatch(fetchUserDetails(user.user_id));
        } else if (isOpen && user?.id && !userProfile) {
            dispatch(fetchUserDetails(user.id));
        }
    }, [dispatch, user, userProfile, isOpen]);

    const [config, setConfig] = useState({
        easy: 5,
        moderate: 5,
        difficult: 5
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: parseInt(value) || 0
        }));
    };

    const handleStart = async () => {
        if (!activeUser) {
            alert('Please login first');
            return;
        }

        // Check quiz access
        if (!canAttemptQuiz(activeUser, courseId)) {
            if (onAccessDenied) {
                onAccessDenied();
            }
            onClose();
            return;
        }

        const payload = {
            chapter_id: chapterId,
            user_id: activeUser.user_id || activeUser.id,
            ...config
        };

        try {
            await dispatch(fetchMixedQuiz(payload)).unwrap();
            // Track the attempt for free users
            trackQuizAttempt(activeUser, chapterId);
            onClose();
            navigate('/quiz/taking/direct');
        } catch (err) {
            console.error(err);
            alert('Failed to start mixed quiz');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                    <h3 className="text-xl font-bold">Mixed Difficulty Quiz</h3>
                    <p className="text-purple-100 text-sm mt-1">{chapterName}</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                <span>Easy Questions</span>
                                <span className="text-green-600 font-bold">{config.easy}</span>
                            </label>
                            <input
                                type="range"
                                name="easy"
                                min="0"
                                max="20"
                                value={config.easy}
                                onChange={handleChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                            />
                        </div>

                        <div>
                            <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                <span>Moderate Questions</span>
                                <span className="text-orange-500 font-bold">{config.moderate}</span>
                            </label>
                            <input
                                type="range"
                                name="moderate"
                                min="0"
                                max="20"
                                value={config.moderate}
                                onChange={handleChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                        </div>

                        <div>
                            <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                <span>Difficult Questions</span>
                                <span className="text-red-600 font-bold">{config.difficult}</span>
                            </label>
                            <input
                                type="range"
                                name="difficult"
                                min="0"
                                max="20"
                                value={config.difficult}
                                onChange={handleChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                            />
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center text-sm">
                            <span className="font-semibold text-gray-600">Total Questions:</span>
                            <span className="font-bold text-gray-900 text-lg">{config.easy + config.moderate + config.difficult}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleStart}
                            disabled={loading || (config.easy + config.moderate + config.difficult === 0)}
                            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Generating...' : 'Start Quiz'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MixedQuizModal;
