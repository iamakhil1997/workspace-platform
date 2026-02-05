import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useGlobal } from '../../context/GlobalContext';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';

export default function TimeTracking() {
    const { isClockedIn, toggleClockIn, user } = useGlobal();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleClockAction = async () => {
        if (loading) return;
        setError(null);
        setLoading(true);

        const action = isClockedIn ? "clock_out" : "clock_in";

        // For clock in, we need location
        if (action === "clock_in") {
            if (!("geolocation" in navigator)) {
                setError("Geolocation is not supported by your browser.");
                setLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await submitClockAction(action, latitude, longitude);
                },
                (err) => {
                    setError("Unable to retrieve your location. Please allow location access.");
                    setLoading(false);
                }
            );
        } else {
            // Clock out doesn't necessarily need rigorous location check, but good to send if available
            // For now, send without location or maybe last known?
            // Let's just send basic call
            await submitClockAction(action, null, null);
        }
    };

    const submitClockAction = async (action, lat, lon) => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/time-tracking/clock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: action,
                    latitude: lat,
                    longitude: lon
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Failed to process request");
            }

            const data = await res.json();
            // Update local log state for demo
            setLogs(prev => [{
                action: action === 'clock_in' ? 'Clock In' : 'Clock Out',
                time: new Date().toLocaleTimeString(),
                id: Date.now()
            }, ...prev]);

            toggleClockIn(); // Update global context

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Attendance & Time Tracking</h2>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">
                    <div className={`w-48 h-48 rounded-full border-4 ${isClockedIn ? 'border-green-100' : 'border-indigo-100'} flex items-center justify-center mb-6 relative transition-colors`}>
                        <div className="text-center">
                            <p className="text-gray-500 text-sm">Current Time</p>
                            <h3 className="text-3xl font-bold text-gray-800">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </h3>
                            {isClockedIn && <span className="text-xs text-green-600 font-medium mt-1">● Live</span>}
                        </div>
                    </div>

                    <button
                        onClick={handleClockAction}
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold transition shadow-lg flex items-center justify-center gap-2
                            ${isClockedIn
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                            } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Processing...' : (isClockedIn ? 'Stop Timer' : 'Start Timer (GPS)')}
                    </button>
                    {!isClockedIn && (
                        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                            <MapPin size={12} />
                            Location verification required
                        </p>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-700 mb-4">Today's Logs</h3>
                    <ul className="space-y-3">
                        {logs.length === 0 ? (
                            <li className="text-gray-400 text-sm italic py-2">No activity recorded today.</li>
                        ) : logs.map(log => (
                            <li key={log.id} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                                <span className={`font-medium ${log.action === 'Clock In' ? 'text-green-600' : 'text-red-600'}`}>
                                    {log.action}
                                </span>
                                <span className="text-gray-600 font-medium">{log.time}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Layout>
    );
}
