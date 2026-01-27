/**
 * @fileoverview useVoiceInput Hook
 *
 * Interfaces with the Web Speech API to provide voice recognition capabilities.
 * Handles microphone permissions, transcript generation, and error reporting.
 *
 * @module hooks/useVoiceInput
 * @requires react
 */

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

    const [interimTranscript, setInterimTranscript] = useState('');

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
                let interim = '';
                let final = '';

                // Re-build transcript from ALL results in the current session
                // This prevents duplication issues on mobile/Android where 'isFinal' behavior varies
                for (let i = 0; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final += event.results[i][0].transcript + ' ';
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }

                setTranscript(final.trim());
                setInterimTranscript(interim);
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
                setInterimTranscript('');
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
        setInterimTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
        error,
        isSupported
    };
}

export default useVoiceInput;
