import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartEntry } from '../../context/SmartEntryContext';
import { parseVoiceInput } from '../../api/api';
import useVoiceInput from '../../hooks/useVoiceInput';
import MobileModal from './MobileModal';
import MobileButton from './MobileButton';
import { Mic, Keyboard, Sparkles } from 'lucide-react';
import './GlobalSmartEntry.css';

export default function GlobalSmartEntry({ onEntryComplete }) {
    const { isOpen, closeSmartEntry } = useSmartEntry();
    const navigate = useNavigate();
    const [mode, setMode] = useState('menu'); // menu, voice, text
    const [textInput, setTextInput] = useState('');
    const [loading, setLoading] = useState(false);

    const {
        startListening,
        stopListening,
        resetTranscript,
        isListening,
        audioBlob
    } = useVoiceInput();

    const handleClose = () => {
        closeSmartEntry();
        setMode('menu');
        setTextInput('');
        stopListening();
    };

    // ... handleSmartSubmit ...

    return (
        <MobileModal
            isOpen={isOpen}
            onClose={handleClose}
            title={mode === 'menu' ? 'Add Transaction' : (mode === 'voice' ? 'Smart Voice' : 'Smart Text')}
        >
            {mode === 'menu' && (
                <div className="smart-menu-grid">
                    <button className="smart-option-btn voice" onClick={() => { setMode('voice'); resetTranscript(); }}>
                        <div className="option-icon"><Mic size={32} /></div>
                        <span>Voice Entry</span>
                        <span className="option-desc">Speak naturally</span>
                    </button>
                    <button className="smart-option-btn text" onClick={() => { setMode('text'); setTextInput(''); }}>
                        <div className="option-icon"><Keyboard size={32} /></div>
                        <span>Text Entry</span>
                        <span className="option-desc">Type naturally</span>
                    </button>
                </div>
            )}

            {/* ... other modes ... */}

            {mode === 'voice' && (
                <div className="voice-interface">
                    <div className={`mic-circle ${isListening ? 'active' : ''}`} onClick={isListening ? stopListening : startListening}>
                        <Mic size={40} />
                    </div>
                    <p className="mic-status">{isListening ? 'Listening...' : (audioBlob ? 'Recording captured' : 'Tap to speak')}</p>

                    {audioBlob && (
                        <div className="voice-actions">
                            <MobileButton variant="secondary" onClick={resetTranscript} size="sm">Retake</MobileButton>
                            <MobileButton variant="primary" onClick={() => handleSmartSubmit(audioBlob)} disabled={loading}>
                                {loading ? 'Processing...' : 'Process'}
                            </MobileButton>
                        </div>
                    )}
                </div>
            )}

            {mode === 'text' && (
                <div className="text-interface">
                    <textarea
                        className="mobile-textarea"
                        rows={4}
                        placeholder="e.g. Spent 50 on groceries at Walmart"
                        value={textInput}
                        onChange={e => setTextInput(e.target.value)}
                        autoFocus
                    />
                    <MobileButton
                        variant="primary"
                        disabled={!textInput.trim() || loading}
                        onClick={() => handleSmartSubmit(textInput)}
                    >
                        {loading ? 'Processing...' : 'Process Entry'}
                    </MobileButton>
                </div>
            )}
        </MobileModal>
    );
}
