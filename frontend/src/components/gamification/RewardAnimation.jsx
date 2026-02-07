import React, { useCallback, useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use'; // Assuming react-use or custom hook exists, otherwise use custom logic

// Simple window size hook if not available
const useWindowSizeCustom = () => {
    const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    useEffect(() => {
        const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return size;
};

export default function RewardAnimation() {
    const { width, height } = useWindowSizeCustom();
    const [showConfetti, setShowConfetti] = useState(false);
    const [rewardType, setRewardType] = useState(null); // 'STREAK', 'LEVEL_UP'

    useEffect(() => {
        const handleReward = (event) => {
            const { type } = event.detail;
            setRewardType(type);
            setShowConfetti(true);

            // Auto hide after 5 seconds
            setTimeout(() => {
                setShowConfetti(false);
                setRewardType(null);
            }, 5000);
        };

        window.addEventListener('trigger-reward', handleReward);
        return () => window.removeEventListener('trigger-reward', handleReward);
    }, []);

    if (!showConfetti) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 11000, pointerEvents: 'none' }}>
            <ReactConfetti
                width={width}
                height={height}
                numberOfPieces={rewardType === 'LEVEL_UP' ? 500 : 200}
                gravity={0.3}
                recycle={false} // Run once then stop
            />
            {rewardType === 'STREAK' && (
                <div className="reward-message-toast">
                    🔥 STREAK EXTENDED!
                </div>
            )}
            {rewardType === 'LEVEL_UP' && (
                <div className="reward-message-toast level-up">
                    🚀 LEVEL UP! LEGENDARY STATUS!
                </div>
            )}
        </div>
    );
}
