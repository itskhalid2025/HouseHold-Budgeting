import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function TrendLineChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="no-data">
                No trend data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    formatter={(value) => [`$${value}`, 'Spent']}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
                />
                <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#1e293b' }}
                    activeDot={{ r: 6, fill: '#fff' }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
