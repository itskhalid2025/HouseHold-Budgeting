import React from 'react';
import { motion } from 'framer-motion';
import './GrowWiseLogo.css';

const GrowWiseLogo = ({ className = '', size = 'text-7xl', animated = true, ...props }) => {
    return (
        <motion.div
            {...props}
            className={`font-bold tracking-tight select-none normal-case flex ${size} ${className} gw-flow-gradient`}
            initial={animated ? { x: -50, opacity: 0 } : { opacity: 1 }}
            animate={animated ? {
                x: 0,
                opacity: 1,
            } : {}}
            transition={{
                duration: 0.8,
                ease: "easeOut"
            }}
        >
            {/* Unified Text with Flowing Gradient */}
            <span style={{ marginRight: '0.05em' }}>Grow</span>
            <span>Wise</span>
        </motion.div>
    );
};

export default GrowWiseLogo;
