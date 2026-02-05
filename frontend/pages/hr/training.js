
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useGlobal } from '../../context/GlobalContext';
import { BookOpen, Calendar, CheckSquare } from 'lucide-react';

export default function Training() {
    const { user } = useGlobal();
    const [trainings, setTrainings] = useState([]);

    // Create Training State
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [assigneeId, setAssigneeId] = useState('');

    const fetchTrainings = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        // Employee gets /my, HR gets /
        // Just handling consistent API usage here based on role
        let endpoint = '/api/v1/training/';
        if (user?.role === 'employee') {
            endpoint = '/api/v1/training/my';
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTrainings(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user) fetchTrainings();
    }, [user]);

    const handleAssign = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/training/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    description: desc,
                    assigned_to_id: parseInt(assigneeId),
                    due_date: new Date().toISOString() // Mock due date
                })
            });

            if (res.ok) {
                setName('');
                setDesc('');
                setAssigneeId('');
                fetchTrainings();
            }
        } catch (err) {
            alert('Failed to assign');
        }
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Training & Learning</h1>
                    <p className="text-gray-500">Track professional development</p>
                </div>

                {(user?.role === 'hr' || user?.role === 'admin') && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Assign Training</h2>
                        <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                                <input
                                    type="number"
                                    required
                                    value={assigneeId}
                                    onChange={(e) => setAssigneeId(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                                Assign
                            </button>
                        </form>
                    </div>
                )}

                <div className="grid gap-4">
                    {trainings.map(t => (
                        <div key={t.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{t.name}</h3>
                                    <p className="text-gray-500 text-sm">{t.description || 'No description'}</p>
                                    {(user?.role === 'hr' || user?.role === 'admin') && (
                                        <p className="text-xs text-indigo-600 font-medium mt-1">Assigned to ID: {t.assigned_to_id}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {t.status.toUpperCase()}
                                </span>
                                {t.due_date && (
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Calendar size={12} /> {new Date(t.due_date).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {trainings.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            No training modules found.
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
