// frontend/pages/chat.js
/**
 * Simple chat page that uses the WebSocket endpoint.
 */
import { useEffect, useState } from "react";
import ChatClient from "../components/ChatClient";

export default function ChatPage() {
    const [userId, setUserId] = useState("");
    const [connected, setConnected] = useState(false);

    const handleConnect = () => {
        if (userId) setConnected(true);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-4">Chat Room</h1>
            {!connected ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Your user ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="border rounded p-2"
                    />
                    <button onClick={handleConnect} className="bg-indigo-600 text-white px-4 py-2 rounded">
                        Connect
                    </button>
                </div>
            ) : (
                <ChatClient userId={userId} />
            )}
        </div>
    );
}
