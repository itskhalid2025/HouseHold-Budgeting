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
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        // Convert FileList to Array
        const files = Array.from(fileList);

        setLoading(true);
        try {
            const result = await analyzeImage(files);
            console.log('Image Analysis Result:', result);
            if (result.success || result.isCreated) {
                if (onEntryComplete) onEntryComplete(result);
                handleClose();
            } else {
                console.warn("Image processed but returned unsuccessful status", result);
                alert("Could not process image(s). Please try again or check the receipt clarity.");
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
                    <div className="image-options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {/* Option 1: Camera (Scan) */}
                        <div className="upload-container" style={{
                            border: '2px dashed rgba(0, 242, 255, 0.3)',
                            borderRadius: '12px',
                            padding: '20px',
                            background: 'rgba(0, 242, 255, 0.05)'
                        }}>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                id="camera-upload"
                                style={{ display: 'none' }}
                                onChange={handleImageUpload}
                                disabled={loading}
                            />
                            <label htmlFor="camera-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <div style={{
                                    width: '50px', height: '50px',
                                    background: 'rgba(0, 242, 255, 0.1)',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--neon-cyan)'
                                }}>
                                    <Camera size={24} />
                                </div>
                                <span style={{ fontWeight: '600' }}>Snap Photo</span>
                            </label>
                        </div>

                        {/* Option 2: Gallery/Files (Upload) */}
                        <div className="upload-container" style={{
                            border: '2px dashed rgba(255, 255, 255, 0.2)',
                            borderRadius: '12px',
                            padding: '20px',
                            background: 'rgba(255, 255, 255, 0.05)'
                        }}>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                multiple
                                id="file-upload"
                                style={{ display: 'none' }}
                                onChange={handleImageUpload}
                                disabled={loading}
                            />
                            <label htmlFor="file-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <div style={{
                                    width: '50px', height: '50px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff'
                                }}>
                                    <Sparkles size={24} />
                                </div>
                                <span style={{ fontWeight: '600' }}>Upload File(s)</span>
                            </label>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        {loading && (
                            <div className="loading-status">
                                <div className="loading-spinner"></div>
                                <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Analyzing Receipt(s)...</p>
                            </div>
                        )}
                        {!loading && (
                            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '10px' }}>
                                Supports JPG, PNG, HEIC, PDF (Max 25MB)
                            </p>
                        )}
                    </div>
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
