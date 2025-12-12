// frontend/components/ChatClient.jsx
/**
 * Minimal chat client that connects to the FastAPI WebSocket endpoint.
 * It sends messages typed by the user and displays broadcast messages.
 */
import { useEffect, useRef, useState } from "react";

export default function ChatClient({ userId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const wsRef = useRef(null);

    useEffect(() => {
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"}/ws/${userId}`);
        wsRef.current = ws;
        ws.onmessage = (event) => {
            setMessages((prev) => [...prev, event.data]);
        };
        ws.onclose = () => console.log("WebSocket closed");
        return () => ws.close();
    }, [userId]);

    const sendMessage = () => {
        if (wsRef.current && input.trim()) {
            wsRef.current.send(input.trim());
            setInput("");
        }
    };

    return (
        <div className="w-full max-w-xl border rounded-lg p-4 bg-white/30 backdrop-blur-lg">
            <div className="h-64 overflow-y-auto mb-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className="p-1 text-sm">{msg}</div>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 border rounded p-2"
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage} className="bg-indigo-600 text-white px-4 py-2 rounded">
                    Send
                </button>
            </div>
        </div>
    );
}
