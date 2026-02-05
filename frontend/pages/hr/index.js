
import Layout from '../../components/Layout';
import Link from 'next/link';
import { useGlobal } from '../../context/GlobalContext';
import {
    UserPlus,
    LogOut,
    Monitor,
    BookOpen,
    Clock,
    FileText,
    Database,
    DollarSign,
    Target,
    Settings
} from 'lucide-react';

const QuickActionCard = ({ href, icon: Icon, title, color }) => (
    <Link href={href} className={`flex flex-col items-start p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group bg-${color}-50`}>
        <div className={`p-3 rounded-lg bg-white shadow-sm text-${color}-600 mb-3 group-hover:scale-105 transition-transform`}>
            <Icon size={20} />
        </div>
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
    </Link>
);

const FavouriteCard = ({ icon: Icon, title, href, color }) => (
    <Link href={href} className={`flex items-center gap-4 p-4 rounded-xl border border-${color}-100 bg-${color}-50/50 hover:bg-${color}-50 hover:border-${color}-200 transition-all group`}>
        <div className={`p-3 rounded-xl bg-${color}-100 text-${color}-600 group-hover:scale-110 transition-transform shadow-sm`}>
            <Icon size={22} />
        </div>
        <span className="font-medium text-gray-800 text-sm leading-tight max-w-[120px]">{title}</span>
    </Link>
);

export default function HRDashboard() {
    const { user } = useGlobal();

    // Determine greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <Layout>
            <div className="space-y-8">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm p-8 md:p-12">
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium mb-4">
                            <span>Admin Portal</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                            {greeting}, <span className="text-indigo-600">{user?.full_name?.split(' ')[0] || 'Admin'}</span>
                        </h1>
                        <p className="text-gray-500 text-lg">Let's do great things together. 🚀 ☀️</p>
                    </div>
                    {/* Abstract Cityscape Graphic Background (CSS only approximation) */}
                    <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                        <div className="flex items-end gap-1">
                            <div className="w-12 h-24 bg-indigo-900 rounded-t-lg"></div>
                            <div className="w-8 h-16 bg-purple-600 rounded-t-lg"></div>
                            <div className="w-16 h-32 bg-indigo-500 rounded-t-lg"></div>
                            <div className="w-10 h-20 bg-pink-500 rounded-t-lg"></div>
                            <div className="w-14 h-40 bg-indigo-700 rounded-t-lg"></div>
                            <div className="w-20 h-28 bg-purple-800 rounded-t-lg"></div>
                            <div className="w-8 h-12 bg-indigo-400 rounded-t-lg"></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Favourites & Tasks */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* My Favourites */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-4">My Favourites</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <FavouriteCard href="/hr/onboarding" icon={UserPlus} title="Employee Onboarding" color="indigo" />
                                <FavouriteCard href="/hr/users" icon={Settings} title="Update Employee Data" color="blue" />
                                <FavouriteCard href="/hr/onboarding" icon={UserPlus} title="Add Employee" color="indigo" />
                                <FavouriteCard href="#" icon={Database} title="Update Payroll Data" color="amber" />
                                <FavouriteCard href="#" icon={DollarSign} title="Process Payroll" color="amber" />
                                <FavouriteCard href="/hr/attendance" icon={Clock} title="Attendance & Hours" color="teal" />
                            </div>
                        </section>

                        {/* Recent Tasks (Placeholder from image) */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <QuickActionCard href="/hr/exit" icon={LogOut} title="Exit Requests" color="red" />
                                <QuickActionCard href="/hr/assets" icon={Monitor} title="Assets" color="blue" />
                                <QuickActionCard href="/hr/training" icon={BookOpen} title="Training" color="purple" />
                                <QuickActionCard href="/tickets" icon={FileText} title="Helpdesk" color="gray" />
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Status Cards */}
                    <div className="space-y-6">
                        {/* Year End Card */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 text-gray-300">
                                <Target size={20} />
                            </div>
                            <div className="w-16 h-16 mx-auto bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 text-3xl shadow-sm">
                                🎯
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">Year End Processing</h3>
                            <p className="text-sm text-gray-500 mb-4">Leave Year End is successfully completed.</p>

                            <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-left">
                                <p className="text-xs text-orange-800 font-medium">Next Steps:</p>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                    <CheckCircle size={14} className="text-green-500" />
                                    <span>No pending leave applications</span>
                                </div>
                            </div>
                        </div>

                        {/* Attendance Mini Widget (Optional) */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg">
                            <h3 className="font-semibold mb-1">Time Tracking</h3>
                            <p className="text-indigo-100 text-sm mb-4">Manage employee hours</p>
                            <Link href="/hr/attendance" className="block w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-center py-2 rounded-lg text-sm font-medium transition-colors">
                                View Attendance Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

// Icon helper since CheckCircle wasn't imported initially in the widget
import { CheckCircle } from 'lucide-react';
