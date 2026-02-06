import React from 'react';
import { motion } from 'framer-motion';
import './GrowWiseLogo.css';

const GrowWiseLogo = ({
    className = '',
    size = 'text-7xl',
    animated = true,
    ...props
}) => {
    return (
        <motion.div
            {...props}
            className={`font-bold tracking-tight select-none normal-case flex ${size} ${className}`}
            initial={animated ? { x: -50, opacity: 0 } : { opacity: 1 }}
            animate={animated ? { x: 0, opacity: 1 } : {}}
            transition={{
                duration: 0.8,
                ease: "easeOut"
            }}
        >
            {/* Animated gradient text using hue rotation */}
            <span className="gw-flow-gradient">GrowWise</span>
        </motion.div>
    );
};

export default GrowWiseLogo;