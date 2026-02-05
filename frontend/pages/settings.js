
import { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { useGlobal } from '../context/GlobalContext';
import { MapPin, Save, AlertCircle, Camera, Upload } from 'lucide-react';

export default function Settings() {
    const { user, setUser } = useGlobal(); // Assume context provides setUser
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [location, setLocation] = useState({ lat: '', lng: '', radius: 100 });
    const fileInputRef = useRef(null);

    // ... (Existing effect and fetchCompany logic - assuming it works for now or copy it if needed)
    // I will copy the essential parts and add the new feature.

    const [company, setCompany] = useState(null);

    // Helper to fetch company (duplicated for simplicity in this full file write)
    const fetchCompany = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/companies/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCompany(data);
                if (data.latitude) {
                    setLocation({
                        lat: data.latitude,
                        lng: data.longitude,
                        radius: data.allowed_radius || 100
                    });
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    useState(() => {
        fetchCompany();
    }, []);

    const handleGetCurrentLocation = () => {
        if (!("geolocation" in navigator)) {
            setMessage({ type: 'error', text: 'Geolocation not supported' });
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation(prev => ({
                    ...prev,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }));
                // Also auto-fill radius if empty
                if (!location.radius) setLocation(prev => ({ ...prev, radius: 100 }));
                setLoading(false);
                setMessage({ type: 'success', text: 'Location fetched from browser!' });
            },
            (error) => {
                setLoading(false);
                setMessage({ type: 'error', text: 'Failed to access location. Check browser permissions.' });
            }
        );
    };

    const handleSaveLocation = async () => {
        setLoading(true);
        setMessage(null);
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/companies/me/location`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    latitude: parseFloat(location.lat),
                    longitude: parseFloat(location.lng),
                    allowed_radius: parseFloat(location.radius)
                })
            });

            if (res.ok) {
                const data = await res.json();
                setCompany(data);
                setMessage({ type: 'success', text: 'Office location saved successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to save location' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleUpload(file);
        }
    };

    const handleUpload = async (file) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('access_token');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/users/me/profile-picture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setMessage({ type: 'success', text: 'Profile picture updated!' });
                // Refresh context
                if (setUser) setUser(updatedUser);
            } else {
                setMessage({ type: 'error', text: 'Failed to upload image' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Settings</h1>
                    <p className="text-gray-500">Manage your profile and workspace preferences</p>
                </div>

                {message && (
                    <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.type === 'error' && <AlertCircle size={18} />}
                        {message.type === 'success' && <Save size={18} />}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Profile Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Profile</h2>
                            <p className="text-sm text-gray-500">Update your photo and personal details</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-100 ring-2 ring-transparent group-hover:ring-indigo-100 transition-all">
                                {user?.profile_picture ? (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.profile_picture}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                        <Camera size={32} />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition items-center justify-center flex"
                                title="Change photo"
                            >
                                <Upload size={14} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">{user?.full_name || 'User'}</h3>
                            <p className="text-sm text-gray-500">{user?.role === 'admin' ? 'Administrator' : 'Team Member'}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${user?.is_verified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                    {user?.is_verified ? 'Verified Account' : 'Pending Verification'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Office Location</h2>
                            <p className="text-sm text-gray-500">Define the allowed area for time tracking</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                            <p className="text-sm text-gray-600 mb-2">
                                Click below to auto-detect your location, or use these coordinates: <br />
                                <strong>Nippon Q1 Mall (Kochi):</strong> Lat: 9.9978, Lng: 76.3150
                            </p>
                            <button
                                onClick={handleGetCurrentLocation}
                                disabled={loading}
                                className="text-indigo-600 font-semibold text-sm hover:underline flex items-center gap-1"
                            >
                                <MapPin size={16} /> Use Current Location
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={location.lat}
                                    onChange={(e) => setLocation({ ...location, lat: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none"
                                    placeholder="0.000000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={location.lng}
                                    onChange={(e) => setLocation({ ...location, lng: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none"
                                    placeholder="0.000000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Radius (meters)</label>
                            <input
                                type="number"
                                value={location.radius}
                                onChange={(e) => setLocation({ ...location, radius: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={handleSaveLocation}
                                disabled={loading}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
                            >
                                {loading ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
