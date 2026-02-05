// frontend/pages/mail/index.js
import Layout from '../../components/Layout';
import { Mail, Star, Send, Trash, Inbox } from 'lucide-react';

export default function MailPage() {
    return (
        <Layout>
            <div className="flex h-[calc(100vh-10rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Mail Sidebar */}
                <div className="w-64 border-r border-gray-100 p-4 bg-gray-50">
                    <button className="w-full bg-indigo-600 text-white rounded-lg py-3 font-semibold mb-6 flex items-center justify-center gap-2">
                        <Mail size={18} /> Compose
                    </button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg cursor-pointer">
                            <Inbox size={18} /> <span className="font-medium">Inbox</span> <span className="ml-auto bg-indigo-200 px-2 rounded-full text-xs">4</span>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
                            <Star size={18} /> <span>Starred</span>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
                            <Send size={18} /> <span>Sent</span>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
                            <Trash size={18} /> <span>Trash</span>
                        </div>
                    </div>
                </div>

                {/* Mail List */}
                <div className="flex-1 overflow-y-auto">
                    {[
                        { sender: 'Google Security', subject: 'Security alert', time: '10:45 AM', preview: 'New sign-in detected on your account...' },
                        { sender: 'HR Dept', subject: 'Policy Update', time: 'Yesterday', preview: 'Please review the attached updated policy regarding...' },
                        { sender: 'Sarah Connor', subject: 'Project Terminator', time: 'Oct 24', preview: 'The deadline is approaching fast, we need to...' },
                    ].map((mail, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold">
                                {mail.sender[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between mb-1">
                                    <h4 className="font-semibold text-gray-900 truncate">{mail.sender}</h4>
                                    <span className="text-xs text-gray-400">{mail.time}</span>
                                </div>
                                <p className="text-sm font-medium text-gray-700 truncate">{mail.subject}</p>
                                <p className="text-sm text-gray-500 truncate">{mail.preview}</p>
                            </div>
                        </div>
                    ))}

                    <div className="p-8 text-center text-gray-400">
                        <p>End of interactions. Connect Gmail to see real emails.</p>
                        <button className="mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Connect Google Account</button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
