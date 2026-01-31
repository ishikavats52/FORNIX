import React from 'react';

/**
 * UpgradePrompt Modal Component
 * Shows when user tries to access locked content
 * Simple message with button to scroll to pricing section
 */
function UpgradePrompt({ isOpen, onClose, feature = 'default', user, courseId = null, courseName = null }) {
    if (!isOpen) return null;

    const messages = {
        quiz: {
            title: '🎯 Free Quiz Limit Reached',
            description: `You've used all 2 free quiz attempts. Upgrade to get unlimited quizzes, full notes, and complete access to all content.`,
        },
        mock_test: {
            title: '🎯 Premium Feature',
            description: 'Mock tests are exclusively available for premium users. Please purchase a plan to access this feature.',
        },
        full_notes: {
            title: '📚 Premium Feature',
            description: 'Full notes are exclusively available for premium users. Please purchase a plan to access complete study materials.',
        },
        course_access: {
            title: '🔒 Course Locked',
            description: 'This course is not included in your current plan. Please purchase a subscription to unlock access.',
        }
    };

    const content = messages[feature] || messages.quiz;

    const handleViewPlans = () => {
        onClose();
        // Scroll to pricing section on the same page
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Lock Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-2 text-center">{content.title}</h2>
                    <p className="text-white/90 text-center">{content.description}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Current Status */}
                    {user && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {user.has_active_subscription ? 'Premium Account' : 'Free Account'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleViewPlans}
                            className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition font-bold text-lg"
                        >
                            View Plans
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UpgradePrompt;
