import React from 'react';

const Leaderboard = ({ rankings, userRank, totalUsers, loading, limit }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!rankings || rankings.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rankings Yet</h3>
                <p className="text-gray-500">Complete quizzes to see your ranking!</p>
            </div>
        );
    }

    const getMedalIcon = (rank) => {
        switch (rank) {
            case 1:
                return '🥇';
            case 2:
                return '🥈';
            case 3:
                return '🥉';
            default:
                return null;
        }
    };

    const getRankColor = (rank) => {
        switch (rank) {
            case 1:
                return 'from-yellow-400 to-yellow-600';
            case 2:
                return 'from-gray-300 to-gray-500';
            case 3:
                return 'from-orange-400 to-orange-600';
            default:
                return 'from-purple-500 to-indigo-600';
        }
    };

    return (
        <div className="space-y-4">
            {/* User's Rank Card (if available and not in top rankings) */}
            {userRank && userRank > (limit || 20) && (
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-300 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                #{userRank}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Your Rank</p>
                                <p className="text-sm text-gray-600">Out of {totalUsers} users</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Keep going!</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Rankings List */}
            <div className="space-y-3">
                {rankings.map((user, index) => {
                    const rank = index + 1;
                    const medal = getMedalIcon(rank);
                    const isCurrentUser = userRank === rank;

                    return (
                        <div
                            key={user.user_id || index}
                            className={`rounded-xl p-4 transition-all ${isCurrentUser
                                    ? 'bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-300 shadow-md'
                                    : 'bg-white border border-gray-200 hover:shadow-md'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Rank */}
                                <div className={`w-12 h-12 bg-gradient-to-br ${getRankColor(rank)} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg`}>
                                    {medal || `#${rank}`}
                                </div>

                                {/* User Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-gray-900">
                                            {user.full_name || 'Anonymous User'}
                                        </p>
                                        {isCurrentUser && (
                                            <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                                                You
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold">{user.total_score || 0}</span> points
                                        </p>
                                        {user.quizzes_completed && (
                                            <p className="text-sm text-gray-500">
                                                {user.quizzes_completed} quiz{user.quizzes_completed !== 1 ? 'zes' : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Score Badge */}
                                <div className="text-right">
                                    <div className={`px-4 py-2 rounded-lg ${rank <= 3 ? 'bg-gradient-to-r from-yellow-100 to-orange-100' : 'bg-gray-100'
                                        }`}>
                                        <p className="text-2xl font-bold text-gray-900">{user.total_score || 0}</p>
                                        <p className="text-xs text-gray-500">Score</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Total Users Info */}
            {totalUsers > 0 && (
                <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Showing top {Math.min(rankings.length, limit || 20)} of {totalUsers} total users
                    </p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
