import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchEnrolledCourses,
    selectEnrolledCourses,
    selectCoursesLoading,
} from '../redux/slices/coursesSlice';
import {
    fetchUserProgress,
    fetchStudyMaterials,
    fetchMCQBank,
    selectProgress,
    selectActivePlan,
    selectStudyMaterials,
    selectMCQBank,
} from '../redux/slices/dashboardSlice';
import { selectUser, logoutUser } from '../redux/slices/authSlice';
import {
    fetchUserDetails,
    selectUserProfile,
} from '../redux/slices/userSlice';
import {
    fetchRankings,
    selectTopRankings,
    selectUserRank,
    selectRankingsLoading,
} from '../redux/slices/rankingsSlice';
import { updateUserProfile } from '../redux/slices/userSlice';
import { showNotification } from '../redux/slices/uiSlice';
import Leaderboard from '../Components/Leaderboard';

function Dashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector(selectUser);
    const userProfile = useSelector(selectUserProfile);
    // const courses = useSelector(selectEnrolledCourses);
    const courses = useSelector((state) => state.courses.enrolledCourses);

    const loading = useSelector(selectCoursesLoading);
    const progress = useSelector(selectProgress);
    const activePlan = useSelector(selectActivePlan);
    const studyMaterials = useSelector(selectStudyMaterials);
    const mcqBank = useSelector(selectMCQBank);

    const topRankings = useSelector(selectTopRankings);
    const userRank = useSelector(selectUserRank);
    const rankingsLoading = useSelector(selectRankingsLoading);

    const [activeTab, setActiveTab] = useState('courses');
    const [profilePictureUrl, setProfilePictureUrl] = useState(null);
    const [uploadingPicture, setUploadingPicture] = useState(false);

    // Image compression - reduced size for smaller base64 strings
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxSize = 150; // Reduced from 300 to create smaller base64
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxSize) {
                            height = (height * maxSize) / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = (width * maxSize) / height;
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                    const compressed = canvas.toDataURL('image/jpeg', 0.6); // Reduced quality from 0.8 to 0.6
                    console.log('Compressed image size:', compressed.length, 'characters');
                    resolve(compressed);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const handleProfilePictureChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            dispatch(showNotification({ type: 'error', message: 'Please select an image file' }));
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            dispatch(showNotification({ type: 'error', message: 'Image must be less than 2MB' }));
            return;
        }

        try {
            setUploadingPicture(true);
            const compressed = await compressImage(file);

            // Immediately upload
            const userId = user?.user_id || user?.id || user?.uuid;
            const updateData = {
                id: userId,
                profile_picture: compressed
            };

            await dispatch(updateUserProfile(updateData)).unwrap();

            // Update local state immediately for responsiveness
            setProfilePictureUrl(compressed);

            // Refetch to ensure consistency
            dispatch(fetchUserDetails(userId));

            setUploadingPicture(false);
            dispatch(showNotification({ type: 'success', message: 'Profile picture updated!' }));
        } catch (error) {
            setUploadingPicture(false);
            dispatch(showNotification({ type: 'error', message: 'Failed to update profile picture' }));
        }
    };

    // Get the display user (prefer profile over auth user)
    const displayUser = userProfile || user;

    // Load profile picture from userProfile or localStorage
    useEffect(() => {
        const userId = user?.user_id || user?.id || user?.uuid;
        if (userId) {
            const localStorageKey = `profile_picture_${userId}`;
            const savedPicture = userProfile?.profile_picture || localStorage.getItem(localStorageKey);
            setProfilePictureUrl(savedPicture);
        }
    }, [user, userProfile]);

    useEffect(() => {
        const userId = user?.user_id || user?.id || user?.uuid;
        if (userId) {
            dispatch(fetchUserDetails(userId));
            dispatch(fetchEnrolledCourses(userId));
            dispatch(fetchUserProgress(userId));
            dispatch(fetchStudyMaterials(userId));
            dispatch(fetchMCQBank(userId));
            dispatch(fetchRankings());
        }
    }, [dispatch, user]);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/');
    };

    const handleCourseClick = (courseId) => {
        navigate(`/courses/${courseId}`);
    };

    const handleSubjectClick = (subjectId) => {
        navigate(`/subjects/${subjectId}`);
    };

    const handleMaterialClick = (materialId) => {
        navigate(`/materials/${materialId}`);
    };

    const handleMCQClick = (mcqId) => {
        navigate(`/mcq/${mcqId}`);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-32">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-6">Please log in to view your dashboard.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (loading && !courses.length) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-purple-50 to-blue-50 pt-32 pb-12">
            {/* Beautiful Profile Card */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* linear Header */}
                    <div className="h-40 bg-linear-to-r from-orange-500 relative">
                        <div className="absolute inset-0 bg-black opacity-10"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-black/20 to-transparent"></div>
                    </div>

                    {/* Profile Content */}
                    <div className="relative px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-center md:items-end -mt-20 md:-mt-16">
                            {/* Avatar */}
                            <div className="relative group">
                                {profilePictureUrl ? (
                                    <img
                                        src={profilePictureUrl}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full object-cover shadow-2xl border-4 border-white"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-white">
                                        {displayUser?.name || displayUser?.full_name ?
                                            (displayUser.name || displayUser.full_name).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                            : 'ST'}
                                    </div>
                                )}

                                {/* Upload Button */}
                                <input
                                    type="file"
                                    id="dashboard-profile-picture-input"
                                    accept="image/*"
                                    onChange={handleProfilePictureChange}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="dashboard-profile-picture-input"
                                    className="absolute bottom-2 right-2 bg-orange-500 hover:bg-orange-600 rounded-full p-2 shadow-lg cursor-pointer transition transform hover:scale-110 border-2 border-white z-10"
                                >
                                    {uploadingPicture ? (
                                        <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </label>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 md:ml-8 mt-4 md:mt-0 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {displayUser?.name || displayUser?.full_name || 'Student'}
                                </h1>
                                <p className="text-gray-600 mt-1">{displayUser?.email || 'student@fornix.com'}</p>
                                <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                                    {userProfile?.has_active_subscription ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Active Student
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            Free User
                                        </span>
                                    )}
                                    {activePlan && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 ">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                            {activePlan}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-3 mt-4 md:mt-0">
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="px-6 py-2 bg-linear-to-r from-orange-500 to-orange-400  text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition font-semibold"
                                >
                                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    View Profile
                                </button>
                                <button
                                    onClick={() => navigate('/quiz/history')}
                                    className="px-6 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-orange-500 hover:text-orange-500 transition font-semibold"
                                >
                                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Quiz History
                                </button>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                            <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-600">Total Courses</p>
                                        <p className="text-2xl font-bold text-orange-900">{courses.length}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-500">Quizzes Taken</p>
                                        <p className="text-2xl font-bold text-orange-800">{progress?.quizzes_taken || 0}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-500">Study Time</p>
                                        <p className="text-2xl font-bold text-orange-900">{progress?.study_hours || 0}h</p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-500">Avg Score</p>
                                        <p className="text-2xl font-bold text-orange-900">{progress?.average_score || 0}%</p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="flex space-x-4 border-b">
                    <button
                        onClick={() => setActiveTab('courses')}
                        className={`px-4 py-2 font-semibold transition ${activeTab === 'courses'
                            ? 'border-b-2 border-orange-500 text-orange-500'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        My Courses
                    </button>
                    <button
                        onClick={() => setActiveTab('progress')}
                        className={`px-4 py-2 font-semibold transition ${activeTab === 'progress'
                            ? 'border-b-2 border-orange-500 text-orange-500'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Progress
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Courses Tab */}
                {activeTab === 'courses' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">My Enrolled Courses</h2>

                        </div>

                        {courses.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {courses.map((item, idx) => {
                                    // Handle potential structure variations
                                    const course = item.course || item;
                                    const plan = item.plan || item.enrolled_plan || {};
                                    const subscription = item.subscription || {};

                                    console.log('Dashboard Course Item:', item);

                                    // Dynamic colors based on course name (fallback logic) - MATCHING Courses.jsx
                                    const cardColor = (course.name || "").includes("NEET PG")
                                        ? "emerald"
                                        : (course.name || "").includes("NEET UG")
                                            ? "blue"
                                            : (course.name || "").includes("AMC")
                                                ? "purple"
                                                : "orange";

                                    // Determine redirect path
                                    let courseLink = `/courses/${course.id}/subjects`;
                                    if ((course.name || "").toLowerCase().includes('amc')) {
                                        courseLink = '/courses/amc';
                                    }

                                    return (
                                        <div
                                            key={course.id || idx}
                                            onClick={() => navigate(courseLink)}
                                            className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col cursor-pointer"
                                        >
                                            <div className="h-52 bg-gray-200 relative group overflow-hidden">
                                                {/* Placeholder gradient if no image */}
                                                <div
                                                    className={`absolute inset-0 bg-linear-to-br from-${cardColor}-400 to-${cardColor}-600 opacity-90 transition-opacity group-hover:opacity-100`}
                                                ></div>

                                                {/* Prioritize icon_url, fallback to image_url */}
                                                {(course.icon_url || course.image_url) && (
                                                    <img
                                                        src={course.icon_url || course.image_url}
                                                        alt={course.name}
                                                        className={`w-full h-full object-cover absolute inset-0 ${course.icon_url ? '' : 'mix-blend-overlay opacity-50'}`}
                                                    />
                                                )}

                                                <div className="absolute bottom-4 left-6 right-6">
                                                    <div className="bg-white/20 backdrop-blur-md rounded-lg p-2 inline-block mb-2">
                                                        <span className="text-white text-xs font-bold uppercase tracking-wider px-2">
                                                            {course.category || "Enrolled"}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <h3 className="text-3xl font-bold text-white drop-shadow-md leading-tight">
                                                            {course.name}
                                                        </h3>
                                                        {/* Status Badge */}
                                                        <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
                                                            Active
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-8 flex-1 flex flex-col">
                                                <p className="text-gray-600 mb-8 leading-relaxed flex-1">
                                                    {course.description ||
                                                        "Comprehensive curriculum designed by top medical experts."}
                                                </p>

                                                {/* Plan Details Section - Styled to fit correctly */}
                                                <div className="mt-auto">
                                                    <div className="group/plan border border-gray-200 rounded-xl p-4 hover:border-orange-500 hover:bg-orange-50 transition-all relative overflow-hidden flex justify-between items-center gap-4 mb-4">
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-gray-800">
                                                                {plan.name || "Current Plan"}
                                                            </h4>
                                                            {subscription.end_date && (
                                                                <p className="text-xs text-gray-500">
                                                                    Expires: {new Date(subscription.end_date).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                            {plan.duration_in_days && (
                                                                <p className="text-xs text-gray-500">
                                                                    Duration: {plan.duration_in_days} Days
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(courseLink);
                                                        }}
                                                        className={`w-full block text-center bg-${cardColor}-500 text-white py-4 rounded-xl font-bold hover:bg-${cardColor}-600 transition shadow-lg shadow-${cardColor}-200`}
                                                    >
                                                        Continue Learning
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Progress Tab */}
                {activeTab === 'progress' && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h2>
                        <div className="text-center py-8">
                            <p className="text-gray-500">Progress tracking will be available soon.</p>
                        </div>
                    </div>
                )}

                {/* Rankings Widget - Always Visible */}
                <div className="mt-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span>🏆</span> Top Performers
                            </h2>
                            <button
                                onClick={() => navigate('/rankings')}
                                className="text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center gap-1"
                            >
                                View Full Rankings
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        <Leaderboard
                            rankings={topRankings}
                            userRank={userRank}
                            totalUsers={0}
                            loading={rankingsLoading}
                            limit={5}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

