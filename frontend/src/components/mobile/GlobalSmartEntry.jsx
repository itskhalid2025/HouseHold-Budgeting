import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartEntry } from '../../context/SmartEntryContext';
import { parseVoiceInput, analyzeImage } from '../../api/api';
import useVoiceInput from '../../hooks/useVoiceInput';
import MobileModal from './MobileModal';
import { Mic, Keyboard, Sparkles, Camera, ArrowLeft } from 'lucide-react';
import { triggerConfetti } from '../../utils/confetti';
import './GlobalSmartEntry.css';

export default function GlobalSmartEntry({ onEntryComplete }) {
    const { isOpen, closeSmartEntry, smartEntryOptions } = useSmartEntry();
    const [mode, setMode] = useState('menu'); // menu, voice, text, image
    const processedRef = useRef(false);
    const [textInput, setTextInput] = useState('');
    const [loading, setLoading] = useState(false);

    const {
        startListening,
        stopListening,
        resetTranscript,
        isListening,
        audioBlob,
        transcript
    } = useVoiceInput();

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            if (smartEntryOptions?.mode) {
                setMode(smartEntryOptions.mode);
            } else {
                setMode('menu');
            }
            if (smartEntryOptions?.files && !processedRef.current) {
                handleImageUpload({ target: { files: smartEntryOptions.files } });
                processedRef.current = true;
            }
        } else {
            processedRef.current = false;
            setTextInput('');
            stopListening();
        }
    }, [isOpen, smartEntryOptions]);

    const handleClose = () => {
        closeSmartEntry();
        setTimeout(() => setMode('menu'), 300); // Reset after close anim
        setTextInput('');
        stopListening();
    };

    const handleBack = () => {
        setMode('menu');
        setTextInput('');
        stopListening();
    };

    const handleSmartSubmit = async (input) => {
        if (!input) return;
        setLoading(true);
        try {
            const result = await parseVoiceInput(input);
            if (result.success || result.isCreated) {
                triggerConfetti();
                if (result.gamification?.streakUpdated) {
                    window.dispatchEvent(new CustomEvent('trigger-reward', { detail: { type: 'STREAK' } }));
                }
                if (onEntryComplete) onEntryComplete(result);
                handleClose();
            } else {
                alert("Could not process entry. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to process: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;
        setLoading(true);
        try {
            const result = await analyzeImage(Array.from(fileList));
            if (result.success || result.isCreated) {
                triggerConfetti();
                if (result.gamification?.streakUpdated) {
                    window.dispatchEvent(new CustomEvent('trigger-reward', { detail: { type: 'STREAK' } }));
                }
                if (onEntryComplete) onEntryComplete(result);
                handleClose();
            } else {
                alert("Could not process image. Please clear details.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to analyze image: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Current Modal Title based on mode
    const getTitle = () => {
        switch (mode) {
            case 'voice': return 'Smart Voice Entry';
            case 'image': return 'Scan Receipt';
            case 'text': return 'Smart Text Entry';
            default: return 'New Entry';
        }
    };

    return (
        <MobileModal
            isOpen={isOpen}
            onClose={handleClose}
            title={getTitle()}
        >
            {/* Show Back button if not in menu */}
            {mode !== 'menu' && (
                <div style={{ marginBottom: '10px' }}>
                    <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>
                        <ArrowLeft size={16} /> Back
                    </button>
                </div>
            )}

            {mode === 'menu' && (
                <div className="smart-menu-grid">
                    <div className="smart-option-btn voice" onClick={() => setMode('voice')}>
                        <div className="option-icon"><Mic size={24} /></div>
                        <span>Voice </span>
                        <span className="option-desc"> Natural Language</span>
                    </div>
                    <div className="smart-option-btn camera" onClick={() => setMode('image')}>
                        <div className="option-icon"><Camera size={24} /></div>
                        <span>Snap </span>
                        <span className="option-desc"> Receipt / Invoice</span>
                    </div>
                    <div className="smart-option-btn text" onClick={() => setMode('text')}>
                        <div className="option-icon"><Keyboard size={24} /></div>
                        <span>Text </span>
                        <span className="option-desc"> Type Manual</span>
                    </div>
                </div>
            )}

            {mode === 'voice' && (
                <div className="voice-interface">
                    <p className="smart-entry-desc">
                        Tap the microphone and speak naturally.
                    </p>
                    <div
                        className={`mic-circle ${isListening ? 'active' : ''}`}
                        onClick={isListening ? stopListening : startListening}
                    >
                        <Mic size={40} />
                    </div>
                    <p className="mic-status">
                        {isListening ? 'Listening...' : (audioBlob ? 'Recording captured' : 'Tap to speak')}
                    </p>

                    {audioBlob && (
                        <div className="voice-actions">
                            <button className="smart-option-btn" style={{ padding: '10px 20px', height: 'auto' }} onClick={resetTranscript}>
                                Retake
                            </button>
                            <button
                                className="smart-option-btn voice"
                                style={{ padding: '10px 20px', height: 'auto', background: 'var(--primary)', color: 'white', border: 'none' }}
                                onClick={() => handleSmartSubmit(audioBlob)}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Process'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {mode === 'text' && (
                <div className="text-interface clean-input">
                    <label className="input-label">Describe your expense or income</label>
                    <textarea
                        className="mobile-textarea clean-textarea"
                        rows={5}
                        placeholder="e.g. 'Spent 500 at Walmart for weekly groceries', 'Got paid 3000 salary'"
                        value={textInput}
                        onChange={e => setTextInput(e.target.value)}
                        autoFocus
                    />
                    <div className="dialog-footer">
                        <button
                            className="process-btn-clean"
                            disabled={!textInput.trim() || loading}
                            onClick={() => handleSmartSubmit(textInput)}
                        >
                            {loading ? 'Processing...' : 'Process Entry'}
                        </button>
                    </div>
                </div>
            )}

            {mode === 'image' && (
                <div className="voice-layout">
                    <p className="smart-entry-desc">
                        Upload or snap a photo of your receipt. We'll extract the details.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <label className="smart-option-btn camera" style={{ height: '120px', justifyContent: 'center' }}>
                            <input type="file" accept="image/*" capture="environment" hidden onChange={handleImageUpload} />
                            <Camera size={28} />
                            <span style={{ marginTop: '8px' }}>Snap Photo</span>
                        </label>
                        <label className="smart-option-btn text" style={{ height: '120px', justifyContent: 'center' }}>
                            <input type="file" accept="image/*,application/pdf" multiple hidden onChange={handleImageUpload} />
                            <Sparkles size={28} />
                            <span style={{ marginTop: '8px' }}>Upload File</span>
                        </label>
                    </div>
                    {loading && <p style={{ textAlign: 'center', marginTop: '10px', color: 'var(--primary)' }}>Analyzing...</p>}
                </div>
            )}
        </MobileModal>
    );
}
