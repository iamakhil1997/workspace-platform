// frontend/pages/tickets/index.js
import Layout from '../../components/Layout';

export default function Tickets() {
    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Helpdesk Tickets</h2>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">+ Raise Ticket</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Subject</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">#T-1001</td>
                            <td className="px-6 py-4">Laptop screen flickering</td>
                            <td className="px-6 py-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Open</span></td>
                            <td className="px-6 py-4">Oct 24, 2025</td>
                        </tr>
                        <tr className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">#T-1002</td>
                            <td className="px-6 py-4">Need access to AWS</td>
                            <td className="px-6 py-4"><span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Closed</span></td>
                            <td className="px-6 py-4">Oct 20, 2025</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}
