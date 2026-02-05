import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, Sparkles, TrendingUp, DollarSign, Target, ArrowUp, X } from 'lucide-react';
import { chatWithAdvisor } from '../../api/api';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

import MobileCard from '../../components/mobile/MobileCard';
import useAutoTour from '../../hooks/useAutoTour';
import { advisorTourMobile } from '../../tourConfigs';
import './AdvisorMobile.css';

// Vibrant Modern Palette
const COLORS = [
    '#10B981', // Emerald (Success/Savings)
    '#F43F5E', // Rose (Needs/Expenses)
    '#3B82F6', // Blue (Wants)
    '#F59E0B', // Amber (Warnings)
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#6366F1'  // Indigo
];

const MessageChart = ({ chart }) => {
    if (!chart || !chart.data) return null;
    const height = 350; // Increased height for better visibility

    // Normalize data keys
    const normalizedData = chart.data.map(d => ({
        ...d,
        name: d.name || d.period || d.label || 'Unknown',
        value: Number(d.value || d.amount || 0)
    }));

    // Common Tooltip Style
    const tooltipStyle = {
        backgroundColor: 'rgba(30, 30, 40, 0.95)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        padding: '6px 10px',
        color: '#fff',
        fontSize: '11px',
        maxWidth: '150px'
    };

    if (chart.type === 'pie') {
        return (
            <div style={{ width: '100%', height, marginTop: 16, minHeight: height }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={normalizedData}
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                        >
                            {normalizedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={tooltipStyle}
                            itemStyle={{ color: '#fff', fontSize: '11px' }}
                            formatter={(value) => `$${value}`}
                            position={{ y: -10 }}
                            offset={10}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={70}
                            wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: '#cbd5e1' }}
                            width="100%"
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
    }

    if (chart.type === 'bar') {
        return (
            <div style={{ width: '100%', height, marginTop: 12, minHeight: height }}>
                <ResponsiveContainer>
                    <BarChart data={normalizedData} margin={{ top: 10, right: 15, left: 0, bottom: 35 }}>
                        <XAxis
                            dataKey="name"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: 'var(--text-secondary)' }}
                            angle={-15}
                            textAnchor="end"
                            height={40}
                        />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} tick={{ fill: 'var(--text-secondary)' }} />
                        <Tooltip
                            cursor={{ fill: 'var(--bg-hover)' }}
                            contentStyle={tooltipStyle}
                            position="top"
                            offset={5}
                        />
                        <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                            {normalizedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    if (chart.type === 'line') {
        return (
            <div style={{ width: '100%', height, marginTop: 12, minHeight: height }}>
                <ResponsiveContainer>
                    <LineChart data={normalizedData} margin={{ top: 10, right: 15, left: 0, bottom: 35 }}>
                        <XAxis
                            dataKey="name"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: 'var(--text-secondary)' }}
                            angle={-15}
                            textAnchor="end"
                            height={40}
                        />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} tick={{ fill: 'var(--text-secondary)' }} />
                        <Tooltip
                            contentStyle={tooltipStyle}
                            position="top"
                            offset={5}
                        />
                        <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    }

    return null;
};

export default function AdvisorMobile() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm your AI financial advisor. How can I help you today?",
            chart: null,
            timestamp: new Date().toISOString()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);

    const quickActions = [
        { icon: DollarSign, text: "How can I save more?" },
        { icon: TrendingUp, text: "Analyze spending trends" },
        { icon: Target, text: "Help me reach goals" }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages, loading]);

    // Auto-trigger tour for first-time users
    useAutoTour('advisor-mobile', advisorTourMobile, loading);

    const handleSendMessage = async (customMsg = null) => {
        const msgText = customMsg || input;
        if (!msgText.trim()) return;

        if (!customMsg) setInput('');

        // User Message
        setMessages(prev => [...prev, {
            role: 'user', content: msgText, timestamp: new Date().toISOString()
        }]);
        setLoading(true);

        try {
            const data = await chatWithAdvisor(msgText, conversationId);

            if (data.success) {
                if (!conversationId && data.conversationId) setConversationId(data.conversationId);

                const content = data.response;
                const chartData = data.chartData || null; // Fix: Get from API directly

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content,
                    chart: chartData,
                    timestamp: data.timestamp
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant', content: "Connection error. Please try again.", isError: true, timestamp: new Date().toISOString()
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant', content: "Something went wrong.", isError: true, timestamp: new Date().toISOString()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (text) => {
        handleSendMessage(text);
    };

    const formatTime = (iso) => {
        try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
        catch { return ''; }
    };

    return (
        <div className="mobile-page advisor-mobile">
            {/* Header */}
            <div className="advisor-header-fixed">
                <button className="icon-btn-close" onClick={() => navigate(-1)}>
                    <X size={24} color="var(--text-primary)" />
                </button>
                <div className="header-icon">
                    <Sparkles size={18} color="white" />
                </div>
                <h3>AI Advisor</h3>
            </div>

            {/* Chat Area */}
            <div className="chat-area" data-tour-id="advisor-chat-mobile">
                {messages.map((msg, i) => (
                    <div key={i} className={`msg-row ${msg.role}`}>
                        {msg.role === 'assistant' && (
                            <div className="avatar bot">
                                <Bot size={16} color="white" />
                            </div>
                        )}
                        <div className={`msg-bubble ${msg.role} ${msg.isError ? 'error' : ''}`}>
                            <div className="msg-text" dangerouslySetInnerHTML={{ __html: msg.content }} />
                            {msg.chart && <MessageChart chart={msg.chart} />}
                            <span className="msg-time">{formatTime(msg.timestamp)}</span>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="msg-row assistant">
                        <div className="avatar bot"><Bot size={16} color="white" /></div>
                        <div className="msg-bubble assistant typing">
                            <span>•••</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} style={{ minHeight: '60px' }} />
            </div>

            {/* Input & Quick Actions */}
            <div className="input-container-fixed">
                {messages.length < 3 && !loading && (
                    <div className="quick-chips" data-tour-id="advisor-suggestions-mobile">
                        {quickActions.map((qa, i) => (
                            <button key={i} className="chip-btn" onClick={() => handleQuickAction(qa.text)}>
                                {qa.text}
                            </button>
                        ))}
                    </div>
                )}

                <div className="input-box" data-tour-id="advisor-input-mobile">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about your finances..."
                        disabled={loading}
                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                        className="send-circle"
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim() || loading}
                    >
                        <ArrowUp size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
