// frontend/pages/projects.js
/**
 * Simple Projects page – fetches list of projects from the backend.
 */
import { useEffect, useState } from "react";

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/projects/`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load projects");
                return res.json();
            })
            .then(setProjects)
            .catch(setError);
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-500 to-teal-600 p-4">
            <h1 className="text-3xl font-bold text-white mb-4">Projects</h1>
            {error && <p className="text-red-200">{error.message}</p>}
            <ul className="bg-white/30 backdrop-blur-lg rounded-xl p-4 w-full max-w-2xl">
                {projects.map((proj) => (
                    <li key={proj.id} className="border-b border-white/20 py-2">
                        <strong>{proj.name}</strong> – {proj.description || "(no description)"}
                    </li>
                ))}
            </ul>
        </div>
    );
}
