// frontend/pages/dashboard.js
/**
 * Simple dashboard page showing navigation to projects, tasks, and chat.
 * Uses a premium glassmorphism container.
 */
import Head from "next/head";
import Link from "next/link";

export default function Dashboard() {
    return (
        <>
            <Head>
                <title>Dashboard – Workspace Platform</title>
                <meta name="description" content="User dashboard with quick access to projects, tasks, and chat." />
            </Head>
            <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
                <section className="bg-white/30 backdrop-blur-lg rounded-xl p-8 shadow-xl max-w-3xl w-full text-center">
                    <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link href="/projects">
                            <a className="block bg-white/20 rounded-lg p-4 hover:bg-white/30 transition">
                                <h2 className="text-xl font-semibold text-white">Projects</h2>
                                <p className="text-white/80">Create and view your projects.</p>
                            </a>
                        </Link>
                        <Link href="/tasks">
                            <a className="block bg-white/20 rounded-lg p-4 hover:bg-white/30 transition">
                                <h2 className="text-xl font-semibold text-white">Tasks</h2>
                                <p className="text-white/80">Manage your tasks.</p>
                            </a>
                        </Link>
                        <Link href="/chat">
                            <a className="block bg-white/20 rounded-lg p-4 hover:bg-white/30 transition">
                                <h2 className="text-xl font-semibold text-white">Chat</h2>
                                <p className="text-white/80">Real‑time communication.</p>
                            </a>
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}
