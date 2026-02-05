
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isClockedIn, setIsClockedIn] = useState(false);
    const router = useRouter();

    // Check auth on mount
    useEffect(() => {
        checkAuth();
        // Restore clock-in state
        const savedClockIn = localStorage.getItem('is_clocked_in');
        if (savedClockIn === 'true') {
            setIsClockedIn(true);
        }
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                localStorage.removeItem('access_token');
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check failed", error);
        } finally {
            setLoading(false);
        }
    };

    const login = (token) => {
        localStorage.setItem('access_token', token);
        checkAuth(); // Fetch user details immediately
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('is_clocked_in');
        localStorage.removeItem('workspace_timer'); // Clean up timer
        setUser(null);
        setIsClockedIn(false);
        router.push('/auth/login');
    };

    const toggleClockIn = () => {
        const newState = !isClockedIn;
        setIsClockedIn(newState);
        localStorage.setItem('is_clocked_in', newState);

        // If clocking out, maybe reset timer? Users usually expect a "pause" or "stop".
        // For now, we just stop the incrementing in LiveTimer.
    };

    return (
        <GlobalContext.Provider value={{ user, loading, isClockedIn, toggleClockIn, login, logout }}>
            {children}
        </GlobalContext.Provider>
    );
}

export const useGlobal = () => useContext(GlobalContext);
