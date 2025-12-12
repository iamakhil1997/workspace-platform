# frontend / pages / auth / login.js
/**
 * Simple login page that posts credentials to the backend and stores the JWT in localStorage.
 */
import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ username: email, password }),
            });
            if (!res.ok) throw new Error("Invalid credentials");
            const data = await res.json();
            localStorage.setItem("access_token", data.access_token);
            router.push("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="rounded bg-white p-8 shadow-md w-80">
                <h2 className="mb-4 text-center text-2xl font-bold">Login</h2>
                {error && <p className="mb-2 text-red-600">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-3 w-full rounded border p-2"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-3 w-full rounded border p-2"
                    required
                />
                <button type="submit" className="w-full rounded bg-indigo-600 p-2 text-white hover:bg-indigo-700">
                    Sign In
                </button>
            </form>
        </div>
    );
}
