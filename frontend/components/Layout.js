import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import {
    MessageSquare,
    LayoutDashboard,
    CheckSquare,
    PieChart,
    Users,
    Clock,
    Ticket,
    LogOut,
    Bell,
    Mail
} from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';

// ... (imports remain)
import LiveTimer from './LiveTimer';

const SidebarItem = ({ href, icon: Icon, label, active }) => (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${active
        ? 'bg-indigo-50 text-indigo-600 font-medium'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}>
        <Icon size={20} />
        <span>{label}</span>
    </Link>
);

export default function Layout({ children }) {
    const router = useRouter();
    const currentPath = router.pathname;
    const { user, loading, logout } = useGlobal();

    // Protect routes
    useEffect(() => {
        if (!loading && !user && !currentPath.startsWith('/auth') && currentPath !== '/') {
            router.push('/auth/login');
        }

        // Role-based protection
        if (!loading && user) {
            const isAdmin = user.role === 'admin' || user.is_superuser;
            const restrictedPaths = ['/hr', '/tickets'];

            if (!isAdmin && restrictedPaths.some(path => currentPath.startsWith(path))) {
                router.push('/dashboard');
            }
        }
    }, [user, loading, currentPath, router]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
    }

    // Allow public pages to render without layout or with simplified layout if needed
    // But typically Layout is used for protected pages. If used on public, user might be null.
    // If we want Layout on public pages, we need to handle user being null in the UI below.
    const isPublic = currentPath.startsWith('/auth') || currentPath === '/';
    if (isPublic && !user) return <>{children}</>;

    if (!user && !isPublic) return null; // Wait for redirect

    const handleLogout = () => {
        logout();
    };

    const isAdmin = user?.role === 'admin' || user?.is_superuser;

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">W</div>
                        <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Workspace</span>
                    </div>
                </div>

                <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
                    <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={currentPath === '/dashboard'} />
                    <SidebarItem href="/chat" icon={MessageSquare} label="Chats" active={currentPath === '/chat'} />

                    <div className="px-6 py-2 mt-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Productivity</span>
                    </div>
                    <SidebarItem href="/projects" icon={PieChart} label="Projects" active={currentPath === '/projects'} />
                    <SidebarItem href="/tasks" icon={CheckSquare} label="Tasks" active={currentPath === '/tasks'} />
                    <SidebarItem href="/time-tracking" icon={Clock} label="Attendance" active={currentPath === '/time-tracking'} />
                    <SidebarItem href="/mail" icon={Mail} label="Mail" active={currentPath === '/mail'} />

                    {isAdmin && (
                        <>
                            <div className="px-6 py-2 mt-4">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Administration</span>
                            </div>
                            <SidebarItem href="/tickets" icon={Ticket} label="Helpdesk" active={currentPath === '/tickets'} />
                            <SidebarItem href="/settings" icon={Users} label="Settings" active={currentPath === '/settings'} />
                            <SidebarItem href="/hr" icon={Users} label="People & KRA" active={currentPath === '/hr'} />
                        </>
                    )}

                    <div className="mt-8 mx-4 p-4 bg-gray-900 rounded-xl text-center border border-gray-800 shadow-inner">
                        <LiveTimer />
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-100 bg-white">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-sm bg-white/80">
                    <h1 className="text-xl font-semibold text-gray-800">
                        {currentPath === '/dashboard' && `Good Morning, ${user?.full_name || 'Team Member'}`}
                        {currentPath.includes('chat') && 'Messages'}
                        {currentPath.includes('projects') && 'Projects Overview'}
                        {currentPath.includes('hr') && 'HR Management'}
                        {currentPath.includes('tickets') && 'Help Desk'}
                        {currentPath.includes('time-tracking') && 'Time & Attendance'}
                    </h1>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-medium text-gray-900">{user?.full_name}</div>
                                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                            </div>
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-medium">
                                {user?.full_name?.[0] || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
