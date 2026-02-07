import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import './ChatbotButton.css';

export default function ChatbotButton() {
    const navigate = useNavigate();

    return (
        <button className="chatbot-fab" onClick={() => navigate('/advisor')}>
            <div className="chatbot-icon-container">
                <Sparkles size={24} color="white" />
            </div>
            <span className="chatbot-label">AI</span>
        </button>
    );
}
