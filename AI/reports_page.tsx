import React, { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, Download, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';

// Mock data for demonstration
const mockReportData = {
  title: "Weekly Spending Report (Jan 16-22, 2026)",
  summary: "Your household spent $1,450 this week with a 65% savings rate. Total income was $4,200, and you saved $850 towards your goals.",
  highlight: "Excellent work! You reduced dining expenses by $120 (35%) compared to last week.",
  trend: "Housing remains your largest expense at $800 (55% of total spending), which is within the recommended 30% of income.",
  insight: "If you maintain this savings pace, you'll reach your Emergency Fund goal 6 weeks earlier than planned by March 15, 2026.",
  recommendation: "Consider switching to a lower-cost streaming bundle to save an additional $25/month ($300/year).",
  encouragement: "You're saving more than 82% of similar households! Keep up the fantastic work! 🎉",
  
  charts: [
    {
      type: 'pie',
      title: 'Spending by Type',
      data: [
        { name: 'Needs', value: 950, color: '#ef4444' },
        { name: 'Wants', value: 350, color: '#f59e0b' },
        { name: 'Savings', value: 850, color: '#10b981' }
      ]
    },
    {
      type: 'pie',
      title: 'Top Categories',
      data: [
        { name: 'Housing', value: 800, color: '#ef4444' },
        { name: 'Groceries', value: 350, color: '#ef4444' },
        { name: 'Dining', value: 180, color: '#f59e0b' },
        { name: 'Entertainment', value: 120, color: '#f59e0b' },
        { name: 'Transportation', value: 150, color: '#ef4444' },
        { name: 'Savings', value: 850, color: '#10b981' }
      ]
    },
    {
      type: 'bar',
      title: 'This Week vs Last Week',
      data: [
        { period: 'Last Week', amount: 1680 },
        { period: 'This Week', amount: 1450 }
      ]
    }
  ],
  
  byUser: [
    { name: 'John', spent: 870, percentage: '60.0', topCategory: 'Housing' },
    { name: 'Jane', spent: 580, percentage: '40.0', topCategory: 'Groceries' }
  ],
  
  metadata: {
    dateRange: { start: '2026-01-16', end: '2026-01-22' },
    reportType: 'weekly',
    totalSpent: 1450,
    totalIncome: 4200,
    totalSaved: 850
  }
};

const ReportsPage = () => {
  const [report, setReport] = useState(mockReportData);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('weekly');

  const COLORS = {
    needs: '#ef4444',
    wants: '#f59e0b',
    savings: '#10b981',
    blue: '#3b82f6'
  };

  const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-50`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
              <p className="text-gray-600 mt-1">AI-powered insights into your spending</p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200">
            {['weekly', 'monthly', 'custom'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-2 text-sm font-medium capitalize transition ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={DollarSign}
            label="Total Spent"
            value={`$${report.metadata.totalSpent.toLocaleString()}`}
            trend={-13.7}
            color="red"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Income"
            value={`$${report.metadata.totalIncome.toLocaleString()}`}
            color="green"
          />
          <StatCard
            icon={Users}
            label="Savings Rate"
            value={`${((report.metadata.totalSaved / report.metadata.totalIncome) * 100).toFixed(0)}%`}
            trend={5.2}
            color="blue"
          />
        </div>

        {/* AI Insights Section */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl mb-8 border border-blue-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{report.title}</h2>
              <p className="text-gray-700 mb-4">{report.summary}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-green-100">
              <p className="text-sm font-semibold text-green-700 mb-1">🎉 Highlight</p>
              <p className="text-gray-800">{report.highlight}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <p className="text-sm font-semibold text-blue-700 mb-1">📊 Key Trend</p>
              <p className="text-gray-800">{report.trend}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-purple-100">
              <p className="text-sm font-semibold text-purple-700 mb-1">💡 Insight</p>
              <p className="text-gray-800">{report.insight}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-orange-100">
              <p className="text-sm font-semibold text-orange-700 mb-1">✨ Recommendation</p>
              <p className="text-gray-800">{report.recommendation}</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-white rounded-lg border-2 border-green-200">
            <p className="text-green-800 font-medium">{report.encouragement}</p>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">% of Total</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                </tr>
              </thead>
              <tbody>
                {report.charts[1].data.map((cat, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                        <span className="font-medium text-gray-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-gray-900">
                      ${cat.value.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600">
                      {((cat.value / report.metadata.totalSpent) * 100).toFixed(1)}%
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cat.color === COLORS.needs ? 'bg-red-100 text-red-700' :
                        cat.color === COLORS.wants ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {cat.color === COLORS.needs ? 'Need' : cat.color === COLORS.wants ? 'Want' : 'Savings'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart: Spending by Type */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Spending by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={report.charts[0].data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {report.charts[0].data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart: Top Categories */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Spending Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={report.charts[1].data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {report.charts[1].data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Period Comparison */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Period Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={report.charts[2].data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Bar dataKey="amount" fill={COLORS.blue} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Per User Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Spending by Household Member
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.byUser.map((user, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.percentage}% of household</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${user.spent.toLocaleString()}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all" 
                    style={{ width: `${user.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  Top category: <span className="font-medium text-gray-900">{user.topCategory}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;