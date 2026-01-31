import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    computeSmartTracking,
    selectSmartTrackingData,
    selectSmartTrackingLoading,
    selectSmartTrackingError
} from '../redux/slices/smartTrackingSlice';
import { selectUser } from '../redux/slices/authSlice';
import { fetchCoursesWithPlans, selectCourses } from '../redux/slices/coursesSlice';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

function SmartTrackingPage() {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const data = useSelector(selectSmartTrackingData);
    const loading = useSelector(selectSmartTrackingLoading);
    const error = useSelector(selectSmartTrackingError);
    const courses = useSelector(selectCourses);

    // Default to first available course or specific if known. 
    // In a real app, we might let the user choose the course. 
    // Using the ID from the prompt as a fallback or the first enrolled course.
    const [selectedCourseId, setSelectedCourseId] = useState('cc613b33-3986-4d67-b33a-009b57a72dc8');
    const [showFullPlan, setShowFullPlan] = useState(false);

    useEffect(() => {
        dispatch(fetchCoursesWithPlans());
    }, [dispatch]);

    useEffect(() => {
        if (user?.id || user?.user_id) {
            const userId = user.id || user.user_id;
            dispatch(computeSmartTracking({
                userId,
                courseId: selectedCourseId
            }));
        }
    }, [dispatch, user, selectedCourseId]);

    // --- Chart Configurations (Minimal/Decent UI) ---
    const pacingChartData = useMemo(() => {
        if (!data?.pacing?.by_subject) return null;

        // Sort by hours descending for better visual
        const sorted = [...data.pacing.by_subject].sort((a, b) => b.hours_per_week - a.hours_per_week).slice(0, 10);

        return {
            labels: sorted.map(s => s.subject_name.length > 15 ? s.subject_name.substring(0, 15) + '...' : s.subject_name),
            datasets: [
                {
                    label: 'Recommended Hours/Week',
                    data: sorted.map(s => s.hours_per_week),
                    backgroundColor: 'rgba(249, 115, 22, 0.8)', // Orange-500
                    borderColor: 'rgba(234, 88, 12, 1)', // Orange-600
                    borderWidth: 1,
                    borderRadius: 4,
                }
            ]
        };
    }, [data]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top', labels: { font: { family: 'Inter', size: 12 } } },
            title: { display: false }
        },
        scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
        }
    };

    if (loading && !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-orange-50/30 pt-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-32">
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                    <p className="text-gray-800 font-semibold mb-2">Unable to load tracking data</p>
                    <p className="text-sm text-gray-500 mb-4">{typeof error === 'string' ? error : 'Server error occurred'}</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-800 text-white rounded text-sm hover:bg-slate-700">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-orange-50/30 pt-32 pb-20 font-sans text-gray-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Smart Study Tracking</h1>
                        <p className="text-orange-600 mt-1 font-medium">AI-driven insights to optimize your preparation</p>
                    </div>
                    {/* Course Selector if needed */}
                    <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="bg-white border border-gray-300 text-slate-700 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block p-2.5 shadow-sm"
                    >
                        {courses.length > 0 ? courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : <option value={selectedCourseId}>Default Course</option>}
                    </select>
                </div>

                {data && (
                    <div className="space-y-8">

                        {/* Metrics Cards - Clean, Minimal */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <MetricCard label="Avg Quiz Score" value={`${data?.metrics?.avg_quiz_score ?? 0}%`} sub="Last attempt performance" />
                            <MetricCard label="Weekly Hours" value={data?.pacing?.weekly_hours ?? 0} sub="Recommended study time" />
                            <MetricCard label="Total Weeks" value={data?.pacing?.total_weeks ?? 0} sub="Until completion" />
                            <MetricCard label="Weak Areas" value={data?.weaknesses?.length ?? 0} sub="High priority topics" />
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Column: Pacing & Weaknesses */}
                            <div className="lg:col-span-2 space-y-8">

                                {/* Pacing Chart */}
                                <div className="bg-white p-6 rounded-xl border border-orange-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Subject Pacing</h3>
                                    <div className="h-64">
                                        {pacingChartData && <Bar options={chartOptions} data={pacingChartData} />}
                                    </div>
                                </div>

                                {/* Study Plan Timeline */}
                                <div className="bg-white p-6 rounded-xl border border-orange-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Study Plan</h3>
                                    <div className="relative border-l-2 border-orange-200 ml-3 space-y-8">
                                        {(data?.study_plan || []).slice(0, showFullPlan ? undefined : 5).map((item, idx) => (
                                            <div key={idx} className="relative pl-8">
                                                <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-orange-500 shadow-sm"></span>
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                                                    <h4 className="text-base font-semibold text-gray-800">{item.area_name}</h4>
                                                    <span className="text-xs font-mono bg-orange-50 px-2 py-1 rounded text-orange-700 border border-orange-100">{item.weeks} Weeks • {item.hours_per_week} hrs/wk</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{item.milestone}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(item.topics || []).map((t, i) => (
                                                        <span key={i} className="text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded text-gray-500">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {(data?.study_plan?.length > 5) && (
                                        <button
                                            onClick={() => setShowFullPlan(!showFullPlan)}
                                            className="w-full mt-6 text-center text-sm text-orange-600 hover:text-orange-800 font-medium border-t border-orange-100 pt-3 transition-colors"
                                        >
                                            {showFullPlan ? 'Show Less' : 'View Full Plan'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Weaknesses & Actions */}
                            <div className="space-y-8">

                                {/* Next Actions */}
                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg shadow-orange-200">
                                    <h3 className="text-lg font-bold mb-4 text-white">Recommended Actions</h3>
                                    <ul className="space-y-3">
                                        {(data?.data?.next_actions || data?.next_actions || []).map((action, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-orange-50">
                                                <span className="mt-1 text-white font-bold">➜</span>
                                                {action}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Weaknesses */}
                                <div className="bg-white p-6 rounded-xl border border-orange-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Focus Areas</h3>
                                    <div className="space-y-4">
                                        {(data?.weaknesses || []).map((w, idx) => (
                                            <div key={idx} className="p-3 bg-red-50/50 border border-red-100 rounded-lg">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-semibold text-gray-800 text-sm">{w.area_name}</span>
                                                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">{w.severity > 3 ? 'High Priority' : 'Needs Review'}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{w.reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function MetricCard({ label, value, sub }) {
    return (
        <div className="bg-white p-5 rounded-xl border border-orange-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">{label}</span>
            <div>
                <span className="text-3xl font-bold text-orange-600 block mb-1">{value}</span>
                <span className="text-xs text-gray-400">{sub}</span>
            </div>
        </div>
    );
}

export default SmartTrackingPage;
