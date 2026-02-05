
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useGlobal } from '../../context/GlobalContext';
import { Mail, Lock, CheckCircle, AlertCircle, Building, User } from 'lucide-react';

export default function Login() {
    const router = useRouter();
    const { login } = useGlobal();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('employee'); // 'employee' or 'hr'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username: email, password: password })
            });

            const data = await res.json();

            if (res.ok) {
                login(data.access_token);
                // Redirect logic
                setTimeout(() => {
                    // Logic to redirect based on role could go here, but for now dashboard is fine.
                    router.push('/dashboard');
                }, 500);
            } else {
                setError(data.detail || 'Login failed');
            }
        } catch (err) {
            setError('Network error/Server offline');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                {/* Header with Role Toggle */}
                <div className="px-8 pt-8 pb-6 text-center">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-indigo-200">
                        W
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-500 text-sm mb-6">Sign in to your workspace account</p>

                    <div className="inline-flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setRole('employee')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${role === 'employee'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <User size={16} /> Employee
                        </button>
                        <button
                            onClick={() => setRole('hr')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${role === 'hr'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Building size={16} /> HR / Admin
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
                    {/* Visual cue for HR login */}
                    {role === 'hr' && (
                        <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs px-4 py-3 rounded-lg flex items-start gap-2">
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            <p>You are logging in to the HR Admin portal. Access is restricted to authorized personnel.</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-700 bg-gray-50/50 focus:bg-white"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-700 bg-gray-50/50 focus:bg-white"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Signing in...' : 'Sign In to Workspace'}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link href="/auth/register" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
                                Register
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
