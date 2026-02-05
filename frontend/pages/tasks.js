import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useGlobal } from '../context/GlobalContext';
import { CheckCircle, Circle, User, Edit3 } from 'lucide-react';

export default function Tasks() {
    const { user } = useGlobal();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterBy, setFilterBy] = useState('assigned'); // 'assigned' or 'created'

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/tasks/?filter_by=${filterBy}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setTasks(data);
                }
            } catch (error) {
                console.error("Failed to fetch tasks", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [filterBy]); // Re-fetch when filter changes

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setFilterBy('assigned')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${filterBy === 'assigned' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Assigned to Me
                    </button>
                    <button
                        onClick={() => setFilterBy('created')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${filterBy === 'created' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Created by Me
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : tasks.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
                    <p className="text-gray-500 mt-1">
                        {filterBy === 'assigned' ? "You have no pending tasks." : "You haven't created any tasks yet."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tasks.map((task) => (
                        <div key={task.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition">
                            <div className="flex items-center gap-4">
                                <button className={`text-gray-400 hover:text-indigo-600 ${task.completed ? 'text-green-500' : ''}`}>
                                    {task.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                                </button>
                                <div>
                                    <h3 className={`font-medium text-gray-900 ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.title}</h3>
                                    {task.description && <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {filterBy === 'created' && (
                                    <span className="flex items-center text-xs text-gray-500 gap-1 bg-gray-50 px-2 py-1 rounded">
                                        <User size={12} /> Assignee: {task.assignee_id}
                                    </span>
                                )}
                                <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                                    Project #{task.project_id}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}
