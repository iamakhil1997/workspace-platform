
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useGlobal } from '../../context/GlobalContext';
import { Clock, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function AttendanceDashboard() {
    const { user } = useGlobal();
    const [data, setData] = useState({ stats: [], online_count: 0, offline_count: 0 });
    const [loading, setLoading] = useState(true);

    const fetchAttendance = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/time-tracking/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const resData = await res.json();
                setData(resData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
        const interval = setInterval(fetchAttendance, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const formatTime = (isoString) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDuration = (isoString) => {
        if (!isoString) return '-';
        const diff = new Date() - new Date(isoString);
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m ago`;
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Attendance Overview</h1>
                        <p className="text-gray-500">Real-time status of your workforce today</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Online</p>
                                <p className="text-lg font-bold text-gray-800">{data.online_count}</p>
                            </div>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Offline</p>
                                <p className="text-lg font-bold text-gray-800">{data.offline_count}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Clock In</th>
                                    <th className="px-6 py-4">Last Active / Clock Out</th>
                                    <th className="px-6 py-4">Total Hrs Today</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center">Loading...</td></tr>
                                ) : data.stats.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">No attendance data for today</td></tr>
                                ) : (
                                    data.stats.map(stat => (
                                        <tr key={stat.user_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                        {stat.full_name?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{stat.full_name || `User #${stat.user_id}`}</p>
                                                        <p className="text-xs text-gray-500">ID: {stat.user_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${stat.status === 'online'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {stat.status === 'online' ? <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> : <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>}
                                                    {stat.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-mono text-sm">
                                                {formatTime(stat.clock_in)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {stat.status === 'online' ? (
                                                    <span className="text-green-600 text-sm flex items-center gap-1">
                                                        <Clock size={14} /> Active now
                                                    </span>
                                                ) : (
                                                    <div className="text-sm">
                                                        <p className="text-gray-900 font-mono">{formatTime(stat.clock_out)}</p>
                                                        <p className="text-xs text-gray-400">Offline for {formatDuration(stat.last_seen)}</p>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-mono font-medium ${stat.total_hours > 8 ? 'text-green-600' : 'text-gray-700'}`}>
                                                    {stat.total_hours.toFixed(2)} hrs
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
