import React from "react";
import { motion } from "framer-motion";

export default function TaglineSequential({ isMobile }) {
    // Sentence: "Build habits that Grow with you"
    // 1. "Build" (White)
    // 2. "habits" (White)
    // 3. "that" (White)
    // 4. "Grow" (Cyan)
    // 5. "with" (Cyan)
    // 6. "you" (Cyan)
    // Timing: 1 second per word.

    const words = [
        { text: "Build", highlight: false },
        { text: "habits", highlight: false },
        { text: "that", highlight: false },
        { text: "Grow", highlight: true },
        { text: "with", highlight: true },
        { text: "you", highlight: true }
    ];

    const containerStyle = {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "10px",
        flexWrap: "nowrap",
        whiteSpace: "nowrap",
        gap: isMobile ? "0.3rem" : "0.6rem"
    };

    const textStyle = {
        color: "white",
        fontSize: isMobile ? "1.1rem" : "2.5rem",
        fontWeight: 400,
        fontFamily: "'Inter', -apple-system, sans-serif",
    };

    const highlightStyle = {
        fontFamily: "'Playfair Display', serif",
        fontStyle: "italic",
        fontWeight: 600,
        color: "#4ff3ff",
        textShadow: "0 0 6px #4ff3ff, 0 0 14px #3ad7e8, 0 0 24px #22bcd1",
    };

    return (
        <div style={containerStyle}>
            {words.map((wordObj, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                        delay: index * 1.0,
                        duration: 0.8,
                        ease: "easeOut"
                    }}
                    style={{
                        ...textStyle,
                        ...(wordObj.highlight ? highlightStyle : {})
                    }}
                >
                    {wordObj.text}
                </motion.span>
            ))}
        </div>
    );
}
