import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartEntry } from '../../context/SmartEntryContext';
import { parseVoiceInput, analyzeImage } from '../../api/api';
import useVoiceInput from '../../hooks/useVoiceInput';
import MobileModal from './MobileModal';
import MobileButton from './MobileButton';
import { Mic, Keyboard, Sparkles, Camera } from 'lucide-react';
import './GlobalSmartEntry.css';

export default function GlobalSmartEntry({ onEntryComplete }) {
    const { isOpen, closeSmartEntry } = useSmartEntry();
    const navigate = useNavigate();
    const [mode, setMode] = useState('menu'); // menu, voice, text, image
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

    const handleSmartSubmit = async (input) => {
        if (!input) return;
        setLoading(true);
        try {
            const result = await parseVoiceInput(input);
            console.log('Smart Entry Result:', result);

            if (result.success || result.isCreated) {
                if (onEntryComplete) onEntryComplete(result);
                handleClose();
            } else {
                console.warn("Smart entry processed but returned unsuccessful status", result);
                alert("Could not process entry. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to process smart entry: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const result = await analyzeImage(file);
            console.log('Image Analysis Result:', result);
            if (result.success || result.isCreated) {
                if (onEntryComplete) onEntryComplete(result);
                handleClose();
            } else {
                console.warn("Image processed but returned unsuccessful status", result);
                alert("Could not process image. Please try again or check the receipt clarity.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to analyze image: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileModal
            isOpen={isOpen}
            onClose={handleClose}
            title={mode === 'menu' ? 'Add Transaction' : (mode === 'voice' ? 'Smart Voice' : mode === 'image' ? 'Scan Receipt' : 'Smart Text')}
        >
            {mode === 'menu' && (
                <div className="smart-menu-grid">
                    <button className="smart-option-btn voice" onClick={() => { setMode('voice'); resetTranscript(); }}>
                        <div className="option-icon"><Mic size={32} /></div>
                        <span>Voice Entry</span>
                        <span className="option-desc">Speak naturally</span>
                    </button>
                    <button className="smart-option-btn camera" onClick={() => setMode('image')}>
                        <div className="option-icon"><Camera size={32} /></div>
                        <span>Scan Receipt</span>
                        <span className="option-desc">Upload or take photo</span>
                    </button>
                    <button className="smart-option-btn text" onClick={() => { setMode('text'); setTextInput(''); }}>
                        <div className="option-icon"><Keyboard size={32} /></div>
                        <span>Text Entry</span>
                        <span className="option-desc">Type naturally</span>
                    </button>
                </div>
            )}

            {mode === 'image' && (
                <div className="image-interface" style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="upload-container" style={{
                        border: '2px dashed rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        padding: '40px 20px',
                        marginBottom: '20px'
                    }}>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            id="receipt-upload"
                            style={{ display: 'none' }}
                            onChange={handleImageUpload}
                            disabled={loading}
                        />
                        <label htmlFor="receipt-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
                            <div style={{
                                width: '80px', height: '80px',
                                background: 'rgba(0, 242, 255, 0.1)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--neon-cyan)'
                            }}>
                                <Camera size={40} />
                            </div>
                            <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                {loading ? 'Analyzing Receipt...' : 'Tap to Capture'}
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                                {loading ? 'Extracting items & prices...' : 'Upload a receipt or bill'}
                            </span>
                        </label>
                    </div>
                    {loading && <div className="loading-spinner"></div>}
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
