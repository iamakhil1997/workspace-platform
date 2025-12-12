// frontend/components/ChatClient.jsx
/**
 * Minimal chat client that connects to the FastAPI WebSocket endpoint.
 * It sends messages typed by the user and displays broadcast messages.
 */
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function ChatClient({ userId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const wsRef = useRef(null);

    // Fetch history on mount
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/chat/history?room=general`;
                const res = await axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                // Map history to simple string format or object format. 
                // Let's use object format for state: { id, sender_id, content }
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to fetch history:", err);
            }
        };
        fetchHistory();
    }, []);

    // Connect WebSocket
    useEffect(() => {
        // Updated URL format: /ws?user_id=...&room=...
        const baseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
        // Ensure we strip any trailing slash or 'ws' from baseUrl if auto-constructed poorly, 
        // essentially just make sure we hit the /api/v1/chat/ws endpoint or just /ws if mounted at root?
        // In main.py: app.include_router(chat.router, prefix="/api/v1/chat")
        // So endpoint is /api/v1/chat/ws

        // Wait, NEXT_PUBLIC_WS_URL usually is base domain. 
        // Let's assume it points to host:port.
        const wsUrl = `${baseUrl}/api/v1/chat/ws?user_id=${userId}&room=general`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => console.log("WS Connected");

        ws.onmessage = (event) => {
            // For now, the backend broadcasts simple strings: "User X: message"
            // We'll wrap it in a pseudo-object to match history structure or just render text.
            // Let's handle both.
            const content = event.data;
            setMessages((prev) => [...prev, { id: Date.now(), content }]);
        };

        ws.onclose = () => console.log("WebSocket closed");
        ws.onerror = (e) => console.error("WS Error", e);

        return () => ws.close();
    }, [userId]);

    const sendMessage = () => {
        if (wsRef.current && input.trim()) {
            wsRef.current.send(input.trim());
            setInput("");
        }
    };

    return (
        <div className="w-full max-w-xl border rounded-lg p-4 bg-white/30 backdrop-blur-lg flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto mb-4 space-y-2 p-2 scrollbar-thin scrollbar-thumb-gray-300">
                {messages.map((msg, idx) => {
                    const text = msg.content || msg; // handle object or string
                    const isMe = text.startsWith(`User ${userId}:`);
                    // This is a naive check since backend sends "User ID: msg". 
                    // Ideally backend sends JSON. For MVP this is fine.

                    return (
                        <div key={idx} className={`p-2 rounded-lg max-w-[80%] break-words ${isMe ? 'bg-indigo-500 text-white self-end ml-auto' : 'bg-white/80 text-gray-800 self-start'}`}>
                            {text}
                        </div>
                    );
                })}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50 placeholder-gray-500"
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage} className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-6 py-2 rounded-full font-medium shadow-md">
                    Send
                </button>
            </div>
        </div>
    );
}
