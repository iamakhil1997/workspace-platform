
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useGlobal } from '../../context/GlobalContext';
import { Monitor, Plus, Check } from 'lucide-react';

export default function Assets() {
    const { user } = useGlobal();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);

    // Create Asset State
    const [name, setName] = useState('');
    const [type, setType] = useState('Laptop');
    const [serial, setSerial] = useState('');

    const fetchAssets = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/assets/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAssets(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const handleCreateAsset = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/assets/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, type, serial_number: serial })
            });

            if (res.ok) {
                setName('');
                setSerial('');
                fetchAssets();
            }
        } catch (err) {
            alert('Error creating asset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Asset Management</h1>
                    <p className="text-gray-500">Track company assets and assignments</p>
                </div>

                {(user?.role === 'hr' || user?.role === 'admin') && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Plus size={20} className="text-indigo-600" /> Convert New Asset
                        </h2>
                        <form onSubmit={handleCreateAsset} className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-100"
                                    placeholder="e.g. MacBook Pro 16"
                                />
                            </div>
                            <div className="w-48">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-100"
                                >
                                    <option>Laptop</option>
                                    <option>Monitor</option>
                                    <option>Phone</option>
                                    <option>Accessory</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                                <input
                                    type="text"
                                    value={serial}
                                    onChange={(e) => setSerial(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-100"
                                    placeholder="SN-123456"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium"
                            >
                                Add Asset
                            </button>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assets.map(asset => (
                        <div key={asset.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Monitor size={24} />
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${asset.status === 'available' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {asset.status.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">{asset.type}</p>
                                <div className="text-xs text-gray-400 font-mono bg-gray-50 inline-block px-2 py-1 rounded border border-gray-100">
                                    SN: {asset.serial_number || 'N/A'}
                                </div>
                            </div>
                            {(user?.role === 'hr' || user?.role === 'admin') && asset.status === 'available' && (
                                <div className="mt-4 pt-4 border-t border-gray-50">
                                    {/* Simplified assignment UI - normally would be a user select dropdown */}
                                    {/* For MVP we just show it's available */}
                                    <button className="text-sm text-indigo-600 font-medium hover:underline">
                                        Assign to User
                                    </button>
                                </div>
                            )}
                            {asset.assigned_to_id && (
                                <div className="mt-4 pt-4 border-t border-gray-50 text-sm text-gray-600">
                                    Assigned to User #{asset.assigned_to_id}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
