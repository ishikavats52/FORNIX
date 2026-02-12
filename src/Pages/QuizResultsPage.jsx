import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import AudioPlayer from '../Components/AudioPlayer';
import {
    fetchQuizResults,
    selectQuizResults,
    selectQuizLoading,
    selectQuizError,
} from '../redux/slices/quizSlice';
import { selectUser } from '../redux/slices/authSlice';
import {
    fetchMockTestResult,
    selectMockTestResult,
    selectCurrentMockTest,
    selectMockTestsLoading,
    selectMockTestsError,
} from '../redux/slices/mockTestsSlice';

function QuizResultsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { quizId } = useParams();

    const reduxResults = useSelector(selectQuizResults);
    const quizLoading = useSelector(selectQuizLoading);
    const quizError = useSelector(selectQuizError);

    const mockTestResult = useSelector(selectMockTestResult);
    const currentMockTest = useSelector(selectCurrentMockTest);
    const mockTestLoading = useSelector(selectMockTestsLoading);
    const mockTestError = useSelector(selectMockTestsError);

    const [localResults, setLocalResults] = useState(null);

    const isMockTest = quizId && quizId.includes('-mock-test');
    // For mock tests, the quizId parameter IS the attempt_id (based on how we navigate in QuizTakingPage)
    // or if the URL construction is different, we parse it. 
    // In QuizTakingPage: navigate(`/quiz/results/${testId}-mock-test`); 
    // And testId was result.test_id || ... || attemptId.
    // Let's assume the ID in the URL is the one we need to fetch results for.
    // If the identifying ID for result fetching is attempt_id, then we should ensure we are extracting it.

    // However, looking at the slice update, we need `attempt_id`.
    // Let's assume the ID extracted from URL is the attempt_id.
    const testIdFromUrl = isMockTest ? quizId.replace('-mock-test', '') : null;
    const attemptIdFromState = location.state?.attemptId;
    const user = useSelector(selectUser);

    console.log("testid from url", testIdFromUrl)

    console.log('attemptiddddddd', attemptIdFromState)
    console.log('quijjjjj', quizId)

    useEffect(() => {
        if (quizId === 'direct') {
            // Load results from localStorage for direct quizzes
            const storedResults = localStorage.getItem('quiz_results_direct');

            if (storedResults) {
                try {
                    const parsedResults = JSON.parse(storedResults);
                    setLocalResults(parsedResults);
                } catch (error) {
                    console.error('Failed to parse stored quiz results:', error);
                }
            }
        } else if (isMockTest && testIdFromUrl) {
            // Fetch mock test results
            const userId = user?.user_id || user?.id || user?.uuid;
            if (userId) {
                dispatch(fetchMockTestResult({

                    attempt_id: testIdFromUrl,
                    user_id: userId
                }));
            }
        } else if (quizId) {
            dispatch(fetchQuizResults(quizId));
        }
    }, [dispatch, quizId, isMockTest, testIdFromUrl, attemptIdFromState, user]);

    // Use appropriate results based on type
    const results = quizId === 'direct' ? localResults : (isMockTest ? mockTestResult : reduxResults);
    const loading = isMockTest ? mockTestLoading : (quizId === 'direct' ? false : quizLoading);
    const error = isMockTest ? mockTestError : (quizId === 'direct' ? null : quizError);

    // Helper to extract stats safely from various response structures
    const getStats = (data) => {
        if (!data) return {};
        // Check for results.result.analysis (Mock Test API standard)
        if (data.result?.analysis) return data.result.analysis;
        // Check for data.analysis
        if (data.analysis) return data.analysis;
        // Check for flat structure (Redux/Local standard)
        return data;
    };

    console.log("result", results)

    const {
        score = 0,
        correct_answers = 0,
        wrong_answers = 0,
        total_questions = 0,
        percentage = 0
    } = getStats(results);

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-blue-600';
        if (percentage >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreMessage = (percentage) => {
        if (percentage >= 80) return 'Excellent! 🎉';
        if (percentage >= 60) return 'Good Job! 👍';
        if (percentage >= 40) return 'Keep Practicing! 💪';
        return 'Need More Practice 📚';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-32">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading results...</p>
                </div>
            </div>
        );
    }

    if (error || !results) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-32">
                <div className="text-center max-w-md">
                    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Results Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'Unable to load quiz results'}</p>
                    <button
                        onClick={() => navigate('/quiz/history')}
                        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                    >
                        View Quiz History
                    </button>
                </div>
            </div>
        );
    }

    // Use extracted stats instead of manually calculating or accessing results directly
    // const percentage = ... (Removd duplicate declaration)

    // Handle both 'review' and 'questions' array formats from different API endpoints
    // Check results.result.questions / details as well
    console.log('rreeeee', results)
    const reviewQuestions = quizId === "direct" ? results?.questions : results?.result?.details || results?.details


    //     const reviewQuestions = Array.isArray(results?.review)
    //   ? results.review
    //   : Array.isArray(results?.questions)
    //   ? results.questions
    //   : Array.isArray(results?.result?.details)
    //   ? results.result.details
    //   : Array.isArray(results?.details)
    //   ? results.details
    //   : [];


    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Score Card */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Results</h1>
                    <p className="text-gray-600 mb-6">{results.quiz_title || results.result?.test_title || 'Quiz Completed'}</p>

                    <div className={`text-6xl font-bold mb-4 ${getScoreColor(percentage)}`}>
                        {percentage}%
                    </div>

                    <p className="text-2xl font-semibold text-gray-700 mb-6">
                        {getScoreMessage(percentage)}
                    </p>

                    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-3xl font-bold text-blue-600">{quizId === "direct" ? results.total_questions : results?.result.analysis.total_questions}</div>
                            <div className="text-sm text-gray-600 mt-1">Total Questions</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="text-3xl font-bold text-green-600">{quizId === "direct" ? results.correct_answers : results?.result.analysis.correct_answers}</div>
                            <div className="text-sm text-gray-600 mt-1">Correct</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4">
                            <div className="text-3xl font-bold text-red-600">

                                {quizId === "direct" ? results.incorrect_answers : results?.result.analysis.wrong_answers}

                                <div className="text-sm text-gray-600 mt-1">Incorrect</div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                    </div>
                    {results.time_taken && (
                        <div className="mt-6 text-gray-600">
                            <span className="font-semibold">Time Taken:</span> {results?.result.time_taken}
                        </div>


                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center mb-8">
                    <button
                        onClick={() => navigate('/courses')}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
                    >
                        Take Another Quiz
                    </button>
                    <button
                        onClick={() => navigate('/quiz/history')}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                        View History
                    </button>
                    <button
                        onClick={() => navigate('/rankings')}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                    >
                        View Rankings
                    </button>
                </div>

                {/* Detailed Results */}
                {reviewQuestions && reviewQuestions.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Review</h2>

                        <div className="space-y-6">
                            {reviewQuestions.map((question, index) => {
                                // Handle both API response formats
                                const isCorrect = question.is_correct !== undefined
                                    ? question.is_correct
                                    : question.user_answer === question.correct_answer;

                                return (
                                    <div
                                        key={index}
                                        className={`border-2 rounded-lg p-6 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 flex-1">
                                                {index + 1}. {question.question_text || question.question}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                                }`}>
                                                {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            {question.options?.map((option, optIndex) => {
                                                // Handle both formats: array of strings or array of objects with content
                                                const optionText = typeof option === 'string' ? option : option.content;
                                                const optionKey = typeof option === 'string' ? null : option.option_key;

                                                // For new API format with option_key
                                                const isUserAnswer = question.selected_key
                                                    ? optionKey === question.selected_key
                                                    : optIndex === question.user_answer;
                                                const isCorrectAnswer = question.correct_key
                                                    ? optionKey === question.correct_key
                                                    : optIndex === question.correct_answer;

                                                return (
                                                    <div
                                                        key={optIndex}
                                                        className={`p-3 rounded-lg ${isCorrectAnswer
                                                            ? 'bg-green-100 border-2 border-green-500'
                                                            : isUserAnswer
                                                                ? 'bg-red-100 border-2 border-red-500'
                                                                : 'bg-white border border-gray-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-800">{optionText}</span>
                                                            {isCorrectAnswer && (
                                                                <span className="text-green-600 font-semibold text-sm">
                                                                    ✓ Correct Answer
                                                                </span>
                                                            )}
                                                            {isUserAnswer && !isCorrectAnswer && (
                                                                <span className="text-red-600 font-semibold text-sm">
                                                                    Your Answer
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {question.explanation && (
                                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                                <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                                                <p className="text-sm text-blue-800">{question.explanation}</p>

                                                {/* Audio Player - conditionally rendered */}
                                                {(question.male_explanation_audio_url || question.female_explanation_audio_url) && (
                                                    <div className="mt-3">
                                                        <p className="text-xs font-semibold text-blue-900 mb-2">🎧 Audio Explanation:</p>
                                                        {question.male_explanation_audio_url && (
                                                            <AudioPlayer audioUrl={question.male_explanation_audio_url} />
                                                        )}
                                                        {!question.male_explanation_audio_url && question.female_explanation_audio_url && (
                                                            <AudioPlayer audioUrl={question.female_explanation_audio_url} />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default QuizResultsPage;

