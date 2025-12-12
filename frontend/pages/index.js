// pages/index.js
/**
 * Landing page – a simple hero with a call to action.
 * Uses a premium glassmorphism style.
 */
import Head from "next/head";
import Link from "next/link";

export default function Home() {
    return (
        <>
            <Head>
                <title>Workspace Platform – Empower Your Team</title>
                <meta name="description" content="A modern SaaS workspace platform with chat, projects, tasks, and KRA tracking." />
            </Head>
            <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 p-4">
                <section className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center shadow-xl max-w-2xl">
                    <h1 className="text-4xl font-bold text-white mb-4">Welcome to Workspace Platform</h1>
                    <p className="text-lg text-white/80 mb-6">
                        Collaborate, manage projects, track performance – all in one sleek, secure application.
                    </p>
                    <Link href="/auth/login">
                        <a className="inline-block bg-white text-indigo-700 font-semibold px-6 py-3 rounded-full hover:bg-white/90 transition">
                            Get Started
                        </a>
                    </Link>
                </section>
            </main>
        </>
    );
}
