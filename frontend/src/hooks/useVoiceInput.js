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
    const [transcript, setTranscript] = useState(''); // Keep for compatibility, though emptiness implies "processing audio"
    const [error, setError] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    useEffect(() => {
        // Check for browser support
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            setIsSupported(true);
        } else {
            setIsSupported(false);
            setError('Browser does not support audio recording');
        }

        return () => {
            if (mediaRecorderRef.current && isListening) {
                mediaRecorderRef.current.stop();
            }
        };
    }, [isListening]);

    const startListening = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsListening(true);
            setError('');
            setAudioBlob(null); // Clear previous
        } catch (err) {
            console.error('Failed to start recording:', err);
            setError('Microphone access denied or error');
            setIsListening(false);
        }
    }, []);

    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setAudioBlob(null);
    }, []);

    return {
        isListening,
        transcript, // Will be empty in this new mode until we process it, or we can use it for status
        audioBlob,  // The actual audio file
        startListening,
        stopListening,
        resetTranscript,
        error,
        isSupported
    };
}

export default useVoiceInput;
