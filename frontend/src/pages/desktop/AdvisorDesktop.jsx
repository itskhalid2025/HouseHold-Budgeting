/**
 * @fileoverview AI Advisor Page
 *
 * Implements a chat interface for the AI financial advisor.
 * Features:
 * - Real-time chat with AI
 * - Context-aware advice based on household finances
 * - Enhanced chart rendering with dynamic colors
 * - HTML content rendering with proper styling
 * - Clean, dark-themed UI
 *
 * PRODUCTION VERSION - Enhanced for new backend features
 *
 * @module pages/Advisor
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    Send, Bot, User, Sparkles, TrendingUp,
    DollarSign, Target
} from 'lucide-react';
import {
    PieChart, Pie, BarChart, Bar, LineChart, Line, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { chatWithAdvisor } from '../../api/api';
import './AdvisorDesktop.css';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];

/**
 * Enhanced Chart Component with support for pie, bar, and line charts
 * Now supports dynamic colors from backend and better formatting
 */
const ChatChart = ({ data }) => {
    if (!data || !data.data || data.data.length === 0) return null;

    const { type, title, data: chartData } = data;

    // Format currency for tooltips
    const formatCurrency = (value) => {
        // Try to detect currency from the data or use a default
        return `₹${value.toFixed(2)}`;
    };

    // Custom tooltip for better data display
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px'
                }}>
                    <p style={{ margin: 0, fontWeight: 600, marginBottom: '4px' }}>{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ margin: 0, color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="advisor-chart-container" data-tour-id="advisor-charts" style={{
            marginTop: '1rem',
            width: '100%',
            height: '350px',
            minHeight: '350px'
        }}>
            {title && (
                <h4 style={{
                    margin: '0 0 10px 0',
                    fontSize: '0.95rem',
                    opacity: 0.9,
                    fontWeight: '600'
                }}>
                    {title}
                </h4>
            )}
            <ResponsiveContainer width="100%" height="100%">
                {type === 'pie' ? (
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color || COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            iconType="circle"
                            wrapperStyle={{ fontSize: '12px' }}
                            formatter={(value, entry) => (
                                <span style={{ color: '#94a3b8' }}>{value}</span>
                            )}
                        />
                    </PieChart>
                ) : type === 'line' ? (
                    <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 20, left: 5, bottom: 30 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="period"
                            stroke="#94a3b8"
                            fontSize={13}
                            tick={{ fontWeight: 'bold' }}
                            tickLine={false}
                            angle={-15}
                            textAnchor="end"
                            height={50}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ fill: '#10b981', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                ) : (
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 20, left: 5, bottom: 30 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#334155"
                        />
                        <XAxis
                            dataKey="period"
                            stroke="#94a3b8"
                            fontSize={13}
                            tick={{ fontWeight: 'bold' }}
                            tickLine={false}
                            angle={-15}
                            textAnchor="end"
                            height={50}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="amount"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};

export default function Advisor() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm your AI financial advisor. I can help you save money, reach your goals faster, and make smarter spending decisions. What would you like help with today?",
            timestamp: new Date().toISOString()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);

    const quickActions = [
        {
            icon: DollarSign,
            text: "How can I save more money?",
            color: "green"
        },
        {
            icon: TrendingUp,
            text: "Analyze my spending trends",
            color: "blue"
        },
        {
            icon: Target,
            text: "Help me reach my goals faster",
            color: "purple"
        }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');

        // Add user message immediately
        const userMessageObj = {
            role: 'user',
            content: userMsg,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessageObj]);
        setLoading(true);

        try {
            const data = await chatWithAdvisor(userMsg, conversationId);

            if (data.success) {
                // Update conversation ID if new
                if (!conversationId && data.conversationId) {
                    setConversationId(data.conversationId);
                }

                // Use structured data directly from API
                const content = data.response;
                const chartData = data.chartData || null;
                const metadata = data.metadata || null;

                const aiMessageObj = {
                    role: 'assistant',
                    content: content,
                    chartData: chartData,
                    metadata: metadata,
                    timestamp: data.timestamp
                };
                setMessages(prev => [...prev, aiMessageObj]);
            } else {
                // Add error message
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "I'm having trouble connecting right now. Please try again.",
                    timestamp: new Date().toISOString(),
                    isError: true
                }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I encountered an error. Please try again later.",
                timestamp: new Date().toISOString(),
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (text) => {
        setInput(text);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (isoString) => {
        try {
            return new Date(isoString).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="container advisor-container">
            {/* Header */}
            <div className="advisor-header">
                <div className="advisor-icon-wrapper">
                    <Sparkles color="white" size={24} />
                </div>
                <div>
                    <h1 className="advisor-title">AI Financial Advisor</h1>
                    <p className="advisor-subtitle">Personalized insights for your household</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="chat-window">
                <div className="chat-messages" data-tour-id="advisor-chat-history">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`message-row ${msg.role === 'user' ? 'user' : 'assistant'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="avatar bot">
                                    <Bot size={20} color="white" />
                                </div>
                            )}
                            {msg.role === 'user' && (
                                <div className="avatar user">
                                    <User size={20} />
                                </div>
                            )}

                            <div
                                className={`message-bubble ${msg.role === 'user' ? 'user' : 'bot'} ${msg.isError ? 'error' : ''}`}
                            >
                                {msg.role === 'assistant' ? (
                                    <div
                                        className="message-content"
                                        dangerouslySetInnerHTML={{ __html: msg.content }}
                                    />
                                ) : (
                                    <div className="message-content">{msg.content}</div>
                                )}

                                {msg.chartData && (
                                    <ChatChart data={msg.chartData} />
                                )}

                                <div className="message-time">
                                    {formatTime(msg.timestamp)}
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="message-row assistant">
                            <div className="avatar bot">
                                <Bot size={20} color="white" />
                            </div>
                            <div className="message-bubble bot">
                                <div className="typing-indicator">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Quick Actions (Only show if few messages) */}
            {messages.length < 3 && !loading && (
                <div className="quick-actions">
                    <p className="qa-label">Suggested Questions</p>
                    <div className="qa-buttons" data-tour-id="advisor-suggestions">
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuickAction(action.text)}
                                className="qa-btn"
                            >
                                <action.icon size={16} />
                                {action.text}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="input-area">
                <div className="input-wrapper">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask for advice, savings tips, or analysis..."
                        className="chat-input"
                        data-tour-id="advisor-chat-input"
                        disabled={loading}
                        autoFocus
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={loading || !input.trim()}
                        className="send-btn"
                    >
                        <Send size={18} />
                        <span style={{
                            display: 'none',
                            '@media (min-width: 640px)': { display: 'inline' }
                        }}>
                            Send
                        </span>
                    </button>
                </div>
                <p className="disclaimer">
                    AI can make mistakes. Please verify important financial information.
                </p>
            </div>
        </div>
    );
}
