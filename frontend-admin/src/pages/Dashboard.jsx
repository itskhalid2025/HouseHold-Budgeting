
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Users, Home, IndianRupee, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color} bg-opacity-10 text-${color.replace('bg-', '')}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({ users: 0, households: 0, transactions: 0, totalVolume: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/overview');
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    const chartData = [
        { name: 'Jan', revenue: 4000 },
        { name: 'Feb', revenue: 3000 },
        { name: 'Mar', revenue: 2000 },
        { name: 'Apr', revenue: 2780 },
        { name: 'May', revenue: 1890 },
        { name: 'Jun', revenue: 2390 },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.users}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Households"
                    value={stats.households}
                    icon={Home}
                    color="bg-green-500"
                />
                <StatCard
                    title="Transactions"
                    value={stats.transactions}
                    icon={Activity}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Volume (INR)"
                    value={`₹${parseFloat(stats.totalVolume).toLocaleString()}`}
                    icon={IndianRupee}
                    color="bg-yellow-500"
                />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Revenue Trend (Dummy Data)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="revenue" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
