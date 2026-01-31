import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, Sparkles, TrendingUp, DollarSign, Target, ArrowUp, X } from 'lucide-react';
import { chatWithAdvisor } from '../../api/api';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

import MobileCard from '../../components/mobile/MobileCard';
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

// Helper Component for Charts
const MessageChart = ({ chart }) => {
    if (!chart || !chart.data) return null;
    const height = 280; // Slightly taller for legend space

    // Normalize data keys
    const normalizedData = chart.data.map(d => ({
        ...d,
        name: d.name || d.period || d.label || 'Unknown',
        value: Number(d.value || d.amount || 0)
    }));

    // Common Tooltip Style
    const tooltipStyle = {
        backgroundColor: 'rgba(30, 30, 40, 0.95)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        padding: '8px 12px',
        color: '#fff'
    };

    if (chart.type === 'pie') {
        return (
            <div style={{ width: '100%', height, marginTop: 16 }}>
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
                        <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#fff' }} formatter={(value) => `$${value}`} />
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
            <div style={{ width: '100%', height, marginTop: 12 }}>
                <ResponsiveContainer>
                    <BarChart data={normalizedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} tick={{ fill: 'var(--text-secondary)' }} />
                        <Tooltip cursor={{ fill: 'var(--bg-hover)' }} contentStyle={tooltipStyle} />
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
            <div style={{ width: '100%', height, marginTop: 12 }}>
                <ResponsiveContainer>
                    <LineChart data={normalizedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} tick={{ fill: 'var(--text-secondary)' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
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

                let content = data.response;
                let chartData = null;

                try {
                    // Check for JSON response (often used for charts)
                    const jsonStart = content.indexOf('{');
                    const jsonEnd = content.lastIndexOf('}');

                    if (jsonStart !== -1 && jsonEnd !== -1) {
                        const potentialJson = content.substring(jsonStart, jsonEnd + 1);
                        const parsed = JSON.parse(potentialJson);

                        // If the JSON contains 'text' or 'chartData' properties, extract them
                        if (parsed.text || parsed.chartData) {
                            if (parsed.text) content = parsed.text;
                            if (parsed.chartData) chartData = parsed.chartData;
                        }
                    }
                } catch (e) {
                    // Fallback: Use standard Markdown parsing if JSON fails
                    console.log("Not a strictly valid JSON response, rendering as text.");
                }

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
            <div className="chat-area">
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
                    <div className="quick-chips">
                        {quickActions.map((qa, i) => (
                            <button key={i} className="chip-btn" onClick={() => handleQuickAction(qa.text)}>
                                {qa.text}
                            </button>
                        ))}
                    </div>
                )}

                <div className="input-box">
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
