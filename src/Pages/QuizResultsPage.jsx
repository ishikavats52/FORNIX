import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import AudioPlayer from '../Components/AudioPlayer';
import {
    fetchQuizResults,
    fetchAttemptDetails,
    selectQuizResults,
    selectQuizLoading,
    selectQuizError,
    clearQuizResult,
} from '../redux/slices/quizSlice';
import { selectUser } from '../redux/slices/authSlice';
import {
    fetchMockTestResult,
    selectMockTestResult,
    selectCurrentMockTest,
    selectMockTestsLoading,
    selectMockTestsError,
} from '../redux/slices/mockTestsSlice';

const AudioExplanationSection = ({ question }) => {
    const audioUrls = question.explanation_audio_urls || {};
    const languages = Object.keys(audioUrls);
    const maleUrl = question.male_explanation_audio_url;
    const femaleUrl = question.female_explanation_audio_url;
    
    // Default to EN if available, otherwise first language, otherwise empty
    const [selectedLang, setSelectedLang] = useState(languages.includes('en') ? 'en' : (languages[0] || ''));
    const [gender, setGender] = useState('male');
    const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
    
    useEffect(() => {
        if (languages.length > 0) {
            console.log(`Question Audio Info [${question.id}]:`, {
                languages,
                hindi_url: audioUrls.hi || audioUrls.HI || 'Not found',
                all_urls: audioUrls
            });
        }
    }, [languages, audioUrls, question.id]);

    // Determine the active URL
    let currentAudioUrl = null;
    const selectedLangAudio = selectedLang ? audioUrls[selectedLang] : null;
    const isLangObject = selectedLangAudio && typeof selectedLangAudio === 'object';

    if (selectedLangAudio) {
        if (typeof selectedLangAudio === 'string') {
            currentAudioUrl = selectedLangAudio;
        } else if (isLangObject) {
            currentAudioUrl = gender === 'male' 
                ? (selectedLangAudio.male || selectedLangAudio.female) 
                : (selectedLangAudio.female || selectedLangAudio.male);
        }
    } else {
        currentAudioUrl = gender === 'male' ? maleUrl : femaleUrl;
    }

    const handleLangChange = (e) => {
        setSelectedLang(e.target.value);
        setShouldAutoPlay(true);
    };

    const handleGenderChange = (g) => {
        setGender(g);
        setShouldAutoPlay(true);
    };

    if (!maleUrl && !femaleUrl && languages.length === 0) return null;

    // We should show gender toggle if we are in standard mode OR if the selected language has gendered audio
    const showGenderToggle = (!selectedLang || !languages.length || isLangObject) && (maleUrl || femaleUrl || isLangObject);

    return (
        <div className="mt-4 p-4 bg-white/50 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🎧</span>
                    <p className="text-sm font-bold text-blue-900 uppercase tracking-wider">Audio Explanation</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Language Dropdown */}
                    {languages.length > 0 && (
                        <div className="flex items-center gap-2 bg-blue-100/50 rounded-lg px-2 py-1 border border-blue-200">
                            <span className="text-xs font-bold text-blue-700 uppercase">Lang:</span>
                            <select 
                                value={selectedLang} 
                                onChange={handleLangChange}
                                className="text-xs font-bold bg-transparent border-none focus:ring-0 cursor-pointer text-blue-900"
                            >
                                {languages.map(lang => (
                                    <option key={lang} value={lang}>
                                        {lang.toUpperCase()}
                                    </option>
                                ))}
                                { (maleUrl || femaleUrl) && <option value="">Standard</option> }
                            </select>
                        </div>
                    )}

                    {/* Gender Toggle */}
                    {showGenderToggle && (
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {['male', 'female'].map((g) => {
                                // Check availability for this specific language or standard
                                const available = isLangObject 
                                    ? (selectedLangAudio[g])
                                    : (g === 'male' ? maleUrl : femaleUrl);

                                if (!available) return null;

                                return (
                                    <button
                                        key={g}
                                        onClick={() => handleGenderChange(g)}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                                            gender === g 
                                                ? 'bg-white shadow-sm text-blue-600' 
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {currentAudioUrl && typeof currentAudioUrl === 'string' && currentAudioUrl.trim() !== '' ? (
                <AudioPlayer audioUrl={currentAudioUrl} autoPlay={shouldAutoPlay} />
            ) : (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="text-amber-500">⚠️</span>
                    <p className="text-xs text-amber-700 font-medium italic">Audio explanation currently unavailable in this selection</p>
                </div>
            )}
        </div>
    );
};

function QuizResultsPage() {
    const { quizId } = useParams();
    console.log('QuizResultsPage initialized with quizId:', quizId);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const reduxResults = useSelector(selectQuizResults);
    const attemptDetails = useSelector((state) => state.quiz.attemptDetails);
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
            const userId = user?.user_id || user?.id || user?.uuid;
            console.log('QuizResultsPage: Fetching attempt details for quizId/attemptId:', quizId);
            dispatch(fetchAttemptDetails({ attempt_id: quizId, user_id: userId }));
        }
    }, [dispatch, quizId, isMockTest, testIdFromUrl, attemptIdFromState, user]);

    // Use appropriate results based on type
    const results = quizId === 'direct' ? localResults : (isMockTest ? mockTestResult : (attemptDetails || reduxResults));
    const loading = isMockTest ? mockTestLoading : (quizId === 'direct' ? false : quizLoading);
    const error = isMockTest ? mockTestError : (quizId === 'direct' ? null : quizError);

    // Helper to extract stats safely from various response structures
    const getStats = (data) => {
        if (!data) return {};

        // Check for results.attempt (New Details API standard)
        if (data.attempt) {
            const att = data.attempt;
            return {
                total_questions: att.total_questions || 0,
                correct_answers: att.correct_answers || 0,
                wrong_answers: (att.total_questions || 0) - (att.correct_answers || 0),
                score: att.score || 0,
                percentage: att.score || 0,
                time_taken: att.time_taken_seconds || att.time_taken || 0
            };
        }

        // Check for results.result.analysis (Mock Test API standard)
        if (data.result?.analysis) {
            const analysis = { ...data.result.analysis };
            if (analysis.wrong_answers === undefined && analysis.incorrect_answers !== undefined) {
                analysis.wrong_answers = analysis.incorrect_answers;
            }
            if (analysis.percentage === undefined && analysis.score !== undefined) {
                analysis.percentage = analysis.score;
            }
            return analysis;
        }
        // Check for data.analysis
        if (data.analysis) {
            const analysis = { ...data.analysis };
            if (analysis.wrong_answers === undefined && analysis.incorrect_answers !== undefined) {
                analysis.wrong_answers = analysis.incorrect_answers;
            }
            if (analysis.percentage === undefined && analysis.score !== undefined) {
                analysis.percentage = analysis.score;
            }
            return analysis;
        }
        
        // Check for correct/total/score (AMC API standard)
        if (data.total !== undefined) {
             const stats = {
                 score: data.score || 0,
                 correct_answers: data.correct || 0,
                 wrong_answers: (data.total || 0) - (data.correct || 0),
                 total_questions: data.total || 0,
                 percentage: data.score || 0
             };
             return stats;
        }
        // Check for specific AMC fields in the direct response
        if (data?.total_questions !== undefined) {
            return {
                total_questions: data.total_questions,
                correct_answers: data.correct_answers !== undefined ? data.correct_answers : (data.correct || 0),
                wrong_answers: data.wrong_answers !== undefined ? data.wrong_answers : (data.incorrect_answers || (data.total_questions - (data.correct || 0))),
                score: data.score || 0,
                percentage: data.percentage !== undefined ? data.percentage : (data.score || 0),
                time_taken: data.time_taken !== undefined ? data.time_taken : (data.time_spent || 0)
            };
        }

        // Check for flat structure (Redux/Local standard)
        const stats = { ...data };
        if (stats.wrong_answers === undefined && stats.incorrect_answers !== undefined) {
            stats.wrong_answers = stats.incorrect_answers;
        }

        if (stats.percentage === undefined && stats.score !== undefined) {
            stats.percentage = stats.score;
        }
        return stats;
    };

    console.log("QuizResultsPage: Results data:", results);

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
                    <p className="text-gray-600 mb-6">{error || 'Unable to load test results'}</p>
                    <button
                        onClick={() => navigate('/quiz/history')}
                        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                    >
                        View Test History
                    </button>
                </div>
            </div>
        );
    }

    // Use extracted stats instead of manually calculating or accessing results directly
    // const percentage = ... (Removd duplicate declaration)

    // Handle both 'review' and 'questions' array formats from different API endpoints
    // Check results.result.questions / details as well
    const reviewQuestions = results?.attempt?.review || results?.review || results?.questions || results?.results || results?.data?.questions || results?.data || results?.result?.details || results?.details || results?.result?.questions || [];
    console.log("QuizResultsPage: reviewQuestions:", reviewQuestions);


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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Results</h1>
                    <p className="text-gray-600 mb-6">{results.quiz_title || results.result?.test_title || 'Test Completed'}</p>

                    <div className={`text-6xl font-bold mb-4 ${getScoreColor(percentage)}`}>
                        {percentage}%
                    </div>

                    <p className="text-2xl font-semibold text-gray-700 mb-6">
                        {getScoreMessage(percentage)}
                    </p>

                    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-3xl font-bold text-blue-600">{total_questions}</div>
                            <div className="text-sm text-gray-600 mt-1">Total Questions</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="text-3xl font-bold text-green-600">{correct_answers}</div>
                            <div className="text-sm text-gray-600 mt-1">Correct</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4">
                            <div className="text-3xl font-bold text-red-600">{wrong_answers}</div>
                            <div className="text-sm text-gray-600 mt-1">Incorrect</div>
                        </div>
                    </div>
                    {!!results.time_taken && (
                        <div className="mt-6 text-gray-600">
                            <span className="font-semibold">Time Taken:</span> {results?.result?.time_taken || results?.time_taken}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center mb-8">
                    <button
                        onClick={() => navigate('/courses/amc')}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
                    >
                        Take Another Test
                    </button>
                    <button
                        onClick={() => navigate('/quiz/history')}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                        View History
                    </button>
                    {/* <button
                        onClick={() => navigate('/rankings')}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                    >
                        View Rankings
                    </button> */}
                </div>

                {/* Detailed Results */}
                {reviewQuestions && reviewQuestions.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Review</h2>

                        <div className="space-y-6">
                            {reviewQuestions.map((item, index) => {
                                // Extract question data - could be nested in item.question (New API) or flat (Old API/Local)
                                const question = item.question || item;
                                
                                // Handle both API response formats
                                const isCorrect = item.is_correct !== undefined
                                    ? item.is_correct
                                    : (item.user_answer !== undefined && question.correct_answer !== undefined && 
                                       (String(item.user_answer) === String(question.correct_answer) || 
                                       (item.selected_key && String(item.selected_key).toLowerCase() === String(question.correct_key || question.correct_answer).toLowerCase())));

                                return (
                                    <div
                                        key={index}
                                        className={`border-2 rounded-lg p-6 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 flex-1">
                                                {index + 1}. {question.question_text || question.question || (typeof question.text === 'string' ? question.text : (question.text?.content || question.content || 'Question Text Missing'))}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                                }`}>
                                                {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-4 mt-4">
                                            {/* Options Section */}
                                            <div className="grid gap-2">
                                                {(question.options || []).map((opt) => {
                                                    const optionKey = typeof opt === 'string' ? opt.charAt(0).toLowerCase() : (opt.option_key || opt.key);
                                                    const optionContent = typeof opt === 'string' ? opt : (opt.content || opt.text);

                                                    // Determine selection state
                                                    const isUserAnswer = (item.selected_key && String(item.selected_key).toLowerCase() === String(optionKey).toLowerCase()) ||
                                                        (item.user_answer && String(item.user_answer).toLowerCase() === String(optionKey).toLowerCase());

                                                    const isCorrectAnswer = (question.correct_key && String(question.correct_key).toLowerCase() === String(optionKey).toLowerCase()) ||
                                                        (question.correct_answer && String(question.correct_answer).toLowerCase() === String(optionKey).toLowerCase());

                                                    return (
                                                        <div
                                                            key={optionKey}
                                                            className={`p-3 rounded-lg border flex items-center justify-between ${isCorrectAnswer
                                                                ? 'bg-green-100 border-green-500'
                                                                : isUserAnswer
                                                                    ? 'bg-red-100 border-red-500'
                                                                    : 'bg-white border-gray-200'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isCorrectAnswer ? 'bg-green-500 text-white' : isUserAnswer ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'
                                                                    }`}>
                                                                    {String(optionKey).toUpperCase()}
                                                                </span>
                                                                <span className="text-gray-800">{optionContent}</span>
                                                            </div>

                                                            <div className="flex flex-col items-end">
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
                                        </div>

                                        {(question.explanation || question.explanation_text) && (
                                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mt-4">
                                                <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                                                <p className="text-sm text-blue-800">{question.explanation || question.explanation_text}</p>

                                                <AudioExplanationSection question={question} />
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

