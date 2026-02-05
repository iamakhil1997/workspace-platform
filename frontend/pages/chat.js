// frontend/pages/chat.js
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useGlobal } from '../context/GlobalContext';
import { Send, Search, UserPlus, Check, X, Users, MessageSquare } from 'lucide-react';

export default function Chat() {
    const { user, loading } = useGlobal();
    const [activeTab, setActiveTab] = useState('chats'); // chats, requests, find
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Chat State
    const [activeChat, setActiveChat] = useState(null); // { id, full_name, type: 'dm' }
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    // Initial Data Fetch
    useEffect(() => {
        if (user) {
            fetchFriends();
            fetchRequests();
        }
    }, [user, activeTab]);

    // WebSocket Connection
    useEffect(() => {
        if (!activeChat || !user) return;

        // Determine room ID
        // For DM: dm_{min}_{max}
        const sortedIds = [user.id, activeChat.id].sort((a, b) => a - b);
        const roomId = `dm_${sortedIds[0]}_${sortedIds[1]}`;

        // Fetch history first
        fetchHistory(roomId);

        // Connect WS
        const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/api/v1/chat/ws?user_id=${user.id}&room=${roomId}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onmessage = (event) => {
            // Assuming simplified text format for now based on backend: "User X: message"
            // We should parse it if possible, but backend sends text.
            // Let's just append.
            //Ideally backend sends JSON. The current backend sends "User X: text". 
            // We'll treat it as a new message.
            const content = event.data;
            const isMe = content.startsWith(`User ${user.id}:`); // Fragile parsing
            // Better: parse if possible, or just display.

            // To make it nicer, we'll try to parse or just push a simple object
            setMessages(prev => [...prev, {
                id: Date.now(),
                content: content.includes(':') ? content.split(':').slice(1).join(':') : content,
                isMine: isMe,
                sender: isMe ? 'You' : activeChat.full_name // Approximation
            }]);
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [activeChat, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const api = (path, method = 'GET', body = null) => {
        const token = localStorage.getItem('access_token');
        const headers = { 'Authorization': `Bearer ${token}` };
        if (body) headers['Content-Type'] = 'application/json';
        return fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        }).then(res => res.json());
    };

    const fetchFriends = () => {
        api('/friends/my-friends').then(data => setFriends(Array.isArray(data) ? data : []));
    };

    const fetchRequests = () => {
        api('/friends/requests/pending-details').then(data => setRequests(Array.isArray(data) ? data : []));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        api(`/friends/search?q=${searchQuery}`).then(data => setSearchResults(Array.isArray(data) ? data : []));
    };

    const sendRequest = async (userId) => {
        const res = await api(`/friends/request/${userId}`, 'POST');
        alert(res.detail || res.message); // Simple feedback
        // Refresh?
    };

    const acceptRequest = async (reqId) => {
        await api(`/friends/accept/${reqId}`, 'POST');
        fetchRequests();
        fetchFriends();
    };

    const rejectRequest = async (reqId) => {
        await api(`/friends/reject/${reqId}`, 'POST');
        fetchRequests();
    };

    const fetchHistory = (room) => {
        api(`/chat/history?room=${room}`).then(data => {
            if (Array.isArray(data)) {
                // Map to UI format
                // Backend returns: content, sender_id, etc.
                const formatted = data.map(m => ({
                    id: m.id,
                    content: m.content,
                    isMine: m.sender_id === user.id,
                    sender: m.sender_id === user.id ? 'You' : activeChat.full_name
                })).reverse(); // Assuming backend returns newest first? usually desc.
                // If backend returns newest first, we reverse. If asc, don't.
                // Standard limit=50 usually implies newest.
                setMessages(formatted);
            }
        });
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !ws.current) return;
        ws.current.send(inputText);
        setInputText('');
    };

    return (
        <Layout>
            <Head><title>Chat - Workspace</title></Head>
            <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50">
                    <div className="p-4 bg-white border-b border-gray-100 flex justify-around">
                        <button onClick={() => setActiveTab('chats')} className={`p-2 rounded-lg ${activeTab === 'chats' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <MessageSquare size={20} />
                        </button>
                        <button onClick={() => setActiveTab('requests')} className={`p-2 rounded-lg relative ${activeTab === 'requests' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <UserPlus size={20} />
                            {requests.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                        </button>
                        <button onClick={() => setActiveTab('find')} className={`p-2 rounded-lg ${activeTab === 'find' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <Search size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {activeTab === 'chats' && (
                            <>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Direct Messages</h3>
                                {friends.length === 0 ? <p className="text-sm text-gray-400 px-4 text-center mt-4">No connections yet.</p> : null}
                                {friends.map(friend => (
                                    <div key={friend.id}
                                        onClick={() => setActiveChat(friend)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${activeChat?.id === friend.id ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white hover:shadow-sm'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${activeChat?.id === friend.id ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600'}`}>
                                            {friend.full_name?.[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{friend.full_name}</p>
                                            <p className={`text-xs truncate ${activeChat?.id === friend.id ? 'text-indigo-200' : 'text-gray-400'}`}>{friend.email}</p>
                                        </div>
                                    </div>
                                ))}
                                <button className="mt-4 w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-500 text-sm hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition flex items-center justify-center gap-2">
                                    <Users size={16} /> Create Group
                                </button>
                            </>
                        )}

                        {activeTab === 'requests' && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">Pending Requests</h3>
                                {requests.length === 0 ? <p className="text-sm text-gray-400 px-4 text-center mt-4">No pending requests.</p> : null}
                                {requests.map(req => (
                                    <div key={req.request_id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">
                                                {req.sender.full_name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{req.sender.full_name}</p>
                                                <p className="text-xs text-gray-400">{req.sender.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => acceptRequest(req.request_id)} className="flex-1 bg-indigo-600 text-white py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700">Accept</button>
                                            <button onClick={() => rejectRequest(req.request_id)} className="flex-1 bg-gray-100 text-gray-600 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200">Reject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'find' && (
                            <div className="p-2">
                                <form onSubmit={handleSearch} className="mb-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Find people..."
                                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </form>
                                <div className="space-y-2">
                                    {searchResults.map(u => (
                                        <div key={u.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                                    {u.full_name?.[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate w-24">{u.full_name}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => sendRequest(u.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Add Friend">
                                                <UserPlus size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {activeChat ? (
                        <>
                            {/* Header */}
                            <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                                        {activeChat.full_name?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{activeChat.full_name}</h3>
                                        <p className="text-xs text-green-500 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                                        </p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <Users size={20} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-md px-4 py-3 rounded-2xl shadow-sm text-sm ${msg.isMine ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                                            <p>{msg.content}</p>
                                            {/* <p className={`text-[10px] mt-1 ${msg.isMine ? 'text-indigo-200' : 'text-gray-400'}`}>10:00 AM</p> */}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 bg-white border-t border-gray-100">
                                <form onSubmit={sendMessage} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Message..."
                                        className="flex-1 bg-gray-100 border-0 rounded-xl px-4 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition"
                                    />
                                    <button type="submit" className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                            <MessageSquare size={64} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium text-gray-400">Select a friend to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
