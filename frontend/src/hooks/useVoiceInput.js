import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useVoiceInput Hook
 * Handles speech recognition using the Web Speech API
 * 
 * @returns {Object} - { 
 *   isListening: boolean, 
 *   transcript: string, 
 *   startListening: Function, 
 *   stopListening: Function, 
 *   resetTranscript: Function,
 *   error: string,
 *   isSupported: boolean
 * }
 */
export function useVoiceInput() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState('');
    const [isSupported, setIsSupported] = useState(false);

    const recognitionRef = useRef(null);

    useEffect(() => {
        // Check for browser support
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSupported(true);

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();

            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setError('');
            };

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    setTranscript(prev => {
                        const newTranscript = prev ? `${prev} ${finalTranscript}` : finalTranscript;
                        return newTranscript.trim();
                    });
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed') {
                    setError('Microphone access denied');
                } else if (event.error === 'no-speech') {
                    setError('No speech detected');
                } else {
                    setError(`Error: ${event.error}`);
                }
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

        } else {
            setIsSupported(false);
            setError('Browser does not support voice input');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (err) {
                console.error('Failed to start recognition:', err);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        error,
        isSupported
    };
}

export default useVoiceInput;
