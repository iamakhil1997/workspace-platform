// frontend/components/LiveTimer.js
import { useState, useEffect } from "react";
import { useGlobal } from "../context/GlobalContext";

export default function LiveTimer() {
    const [seconds, setSeconds] = useState(0);
    const { isClockedIn } = useGlobal();

    useEffect(() => {
        // Load initial state
        const savedTime = localStorage.getItem("workspace_timer");
        if (savedTime) setSeconds(parseInt(savedTime, 10));

        const interval = setInterval(() => {
            if (isClockedIn) {
                setSeconds(prev => {
                    const newVal = prev + 1;
                    localStorage.setItem("workspace_timer", newVal);
                    return newVal;
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isClockedIn]);

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center">
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Session Time</div>
            <div className={`text-xl font-mono font-bold ${isClockedIn ? 'text-green-600' : 'text-gray-400'}`}>
                {formatTime(seconds)}
            </div>
            {!isClockedIn && <span className="text-xs text-orange-400">(Clocked Out)</span>}
        </div>
    );
}
