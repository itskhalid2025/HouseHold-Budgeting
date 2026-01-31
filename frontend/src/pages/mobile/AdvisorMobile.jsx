
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, TrendingUp, DollarSign, Target, ArrowUp, X } from 'lucide-react';
import { chatWithAdvisor } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import MobileCard from '../../components/mobile/MobileCard';
import './AdvisorMobile.css';

export default function AdvisorMobile() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm your AI financial advisor. How can I help you today?",
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
                try {
                    if (content.trim().startsWith('{')) {
                        const parsed = JSON.parse(content);
                        if (parsed.text) content = parsed.text;
                    }
                } catch (e) { /* ignore */ }

                setMessages(prev => [...prev, {
                    role: 'assistant', content, timestamp: data.timestamp
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
