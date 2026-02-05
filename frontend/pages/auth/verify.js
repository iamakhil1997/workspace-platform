
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';

export default function Verify() {
    const router = useRouter();
    const { token } = router.query;
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (token) {
            verifyEmail(token);
        } else if (router.isReady) {
            setStatus('error');
            setMessage('Invalid verification link.');
        }
    }, [token, router.isReady]);

    const verifyEmail = async (token) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/users/verify?token=${token}`, {
                method: 'POST'
            });
            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage('Email verified successfully! You can now access the workspace.');
            } else {
                setStatus('error');
                setMessage(data.detail || 'Verification failed. Link may be expired.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error occurred.');
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-50 blur-3xl opacity-60"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-cyan-50 blur-3xl opacity-60"></div>
            </div>

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 z-10 border border-gray-100 text-center">
                <div className="mb-6 flex justify-center">
                    {status === 'verifying' && <div className="animate-spin text-indigo-600"><Loader size={48} /></div>}
                    {status === 'success' && <div className="text-green-500"><CheckCircle size={64} /></div>}
                    {status === 'error' && <div className="text-red-500"><XCircle size={64} /></div>}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {status === 'verifying' && 'Verifying...'}
                    {status === 'success' && 'Verified!'}
                    {status === 'error' && 'Verification Failed'}
                </h1>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    {message}
                </p>

                {status === 'success' && (
                    <Link href="/auth/login" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 w-full justify-center">
                        Go to Login <ArrowRight size={18} />
                    </Link>
                )}

                {status === 'error' && (
                    <Link href="/auth/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium transition-colors">
                        Back to Login
                    </Link>
                )}
            </div>

            <div className="mt-8 text-center text-gray-400 text-sm z-10">
                &copy; 2024 Workspace Platform
            </div>
        </div>
    );
}
