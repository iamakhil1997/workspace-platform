
import { useState } from 'react';
import Layout from '../../components/Layout';
import { useGlobal } from '../../context/GlobalContext';
import { UserPlus, Mail, AlertTriangle } from 'lucide-react';

export default function Onboarding() {
    const { user } = useGlobal();
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleInvite = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/users/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email, full_name: fullName, role: 'employee' })
            });

            if (res.ok) {
                const data = await res.json();
                // In a real app, email is sent. Here we might show the link for demo or just success.
                setMessage({ type: 'success', text: `Invitation sent! Link (Dev Mode): /auth/onboarding?token=${data.token}` });
                setEmail('');
                setFullName('');
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.detail || 'Failed to send invite' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'hr' && user?.role !== 'admin') {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500">
                    <AlertTriangle size={48} className="mb-4 text-amber-500" />
                    <h2 className="text-xl font-semibold text-gray-800">Access Restricted</h2>
                    <p>You do not have permission to view this page.</p>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Onboarding & Invitations</h1>
                    <p className="text-gray-500">Invite new employees to the workspace</p>
                </div>

                {message && (
                    <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.type === 'success' ? <Mail size={18} /> : <AlertTriangle size={18} />}
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <form onSubmit={handleInvite} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 outline-none"
                                placeholder="e.g. Sarah Connor"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 outline-none"
                                placeholder="sarah@company.com"
                            />
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
                            >
                                <UserPlus size={18} />
                                {loading ? 'Sending Invite...' : 'Send Invitation'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
