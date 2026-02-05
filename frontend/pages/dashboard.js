import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useGlobal } from '../context/GlobalContext';
import { Target, TrendingUp } from 'lucide-react';

export default function Dashboard() {
    const { isClockedIn, toggleClockIn, user } = useGlobal();
    const [kras, setKras] = useState([]);

    // Default to false if user is not loaded yet, but Layout usually handles auth redirect
    const isAdmin = user?.role === 'admin' || user?.is_superuser;

    const stats = [
        { label: 'Total Projects', value: '12', color: 'bg-blue-500' },
        { label: 'Pending Tasks', value: '5', color: 'bg-orange-500' },
        { label: 'Hours Logged', value: '32.5', color: 'bg-green-500' },
    ];

    useEffect(() => {
        if (user?.id) {
            const token = localStorage.getItem('access_token');
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/kra/users/${user.id}/kra_summary`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.ok ? res.json() : [])
                .then(setKras)
                .catch(err => console.error("Failed to load KRAs", err));
        }
    }, [user]);

    if (isAdmin) {
        stats.push({ label: 'Open Tickets', value: '2', color: 'bg-red-500' });
    }

    return (
        <Layout>
            <Head>
                <title>Dashboard - Workspace</title>
            </Head>

            <div className={`grid grid-cols-1 md:grid-cols-${isAdmin ? '4' : '3'} gap-6 mb-8`}>
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        <div className={`mt-4 h-1 w-full rounded-full bg-gray-100 overflow-hidden`}>
                            <div className={`h-full w-2/3 ${stat.color}`}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* KRA Section */}
            {user && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Target className="text-indigo-600" size={24} />
                            My KRAs
                        </h2>
                        <Link href="/kra" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View Details &rarr;</Link>
                    </div>
                    {kras.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {kras.map((kra) => (
                                <div key={kra.kra_id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-gray-900">{kra.name}</h3>
                                        <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-700 rounded-full">{kra.progress_percent.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(kra.progress_percent, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 text-right">Target Achieved</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-500">
                            No KRAs assigned yet.
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                        <button className="text-indigo-600 text-sm font-medium hover:underline">View All</button>
                    </div>
                    <div className="p-6 space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm text-gray-800"><span className="font-semibold">Sarah</span> pushed code to <span className="text-indigo-600">Frontend-Revamp</span></p>
                                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-4">
                        <button
                            onClick={toggleClockIn}
                            className={`p-4 rounded-lg ${isClockedIn ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'} transition text-sm font-medium flex flex-col items-center gap-2`}
                        >
                            <span>{isClockedIn ? '🛑 Clock Out' : '⏱️ Clock In'}</span>
                        </button>

                        {isAdmin && (
                            <Link href="/tickets" className="p-4 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition text-sm font-medium flex flex-col items-center gap-2">
                                <span>🎫 Raise Ticket</span>
                            </Link>
                        )}

                        <Link href="/tasks" className="p-4 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition text-sm font-medium flex flex-col items-center gap-2">
                            <span>✅ New Task</span>
                        </Link>
                        <Link href="/chat" className="p-4 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-sm font-medium flex flex-col items-center gap-2">
                            <span>💬 Team Chat</span>
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
