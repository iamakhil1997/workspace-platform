
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useGlobal } from '../../context/GlobalContext';
import { LogOut, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function ExitProcess() {
    const { user } = useGlobal();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    // For employee to submit
    const [reason, setReason] = useState('');
    const [lastDay, setLastDay] = useState('');

    const fetchRequests = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/exit-requests/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user?.role === 'hr' || user?.role === 'admin') {
            fetchRequests();
        }
    }, [user]);

    const handleSubmitExit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/exit-requests/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reason, last_working_day: new Date(lastDay).toISOString() })
            });
            if (res.ok) {
                alert('Exit request submitted.');
                setReason('');
                setLastDay('');
            }
        } catch (err) {
            alert('Failed to submit');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        const token = localStorage.getItem('access_token');
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/exit-requests/${id}?status=${status}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchRequests();
        } catch (err) {
            alert('Failed to update');
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Exit Process</h1>
                    <p className="text-gray-500">Manage resignations and offboarding</p>
                </div>

                {/* Employee View: Submit Request */}
                {user?.role === 'employee' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Submit Resignation</h2>
                        <form onSubmit={handleSubmitExit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leaving</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-100 outline-none"
                                    rows="4"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Last Working Day</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-100 outline-none"
                                    value={lastDay}
                                    onChange={(e) => setLastDay(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
                            >
                                <LogOut size={18} /> Submit Resignation
                            </button>
                        </form>
                    </div>
                )}

                {/* HR View: Manage Requests */}
                {(user?.role === 'hr' || user?.role === 'admin') && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800">Exit Requests</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                                    <tr>
                                        <th className="px-6 py-3">Employee ID</th>
                                        <th className="px-6 py-3">Reason</th>
                                        <th className="px-6 py-3">Proposed Date</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {requests.map(req => (
                                        <tr key={req.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-900">#{req.employee_id}</td>
                                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{req.reason}</td>
                                            <td className="px-6 py-4 text-gray-600">{new Date(req.last_working_day).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {req.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 flex gap-2">
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleUpdateStatus(req.id, 'approved')} className="text-green-600 hover:text-green-800" title="Approve">
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button onClick={() => handleUpdateStatus(req.id, 'rejected')} className="text-red-600 hover:text-red-800" title="Reject">
                                                            <AlertTriangle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {requests.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No pending exit requests</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
