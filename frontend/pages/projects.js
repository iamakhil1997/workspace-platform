import { useEffect, useState } from "react";
import Layout from '../components/Layout';
import { Folder } from 'lucide-react';

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/projects/?filter_by=my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load projects");
                return res.json();
            })
            .then(setProjects)
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                    + New Project
                </button>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-4">{error.message}</div>}

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Folder size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((proj) => (
                        <div key={proj.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                    <Folder size={20} />
                                </div>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Active</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{proj.name}</h3>
                            <p className="text-gray-500 text-sm line-clamp-2">{proj.description || "No description provided."}</p>
                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
                                <span>Team Project</span>
                                <span>view details →</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}
