import React from "react";
import { motion } from "framer-motion";

export default function TaglineAnimatedMobile() {
    const words = ["grow ", "with ", "you  "];

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-start", // Left align for mobile
            }}
        >
            <h2
                style={{
                    color: "white",
                    fontSize: "0.95rem", // Slightly smaller to ensure single line fit
                    fontWeight: 400,
                    fontFamily: "Inter, sans-serif",
                    display: "flex",
                    flexWrap: "nowrap", // Force single line
                    alignItems: "baseline",
                    gap: "4px",
                    width: "100%",
                    overflow: "hidden", // In case of overflow
                }}
            >
                <span style={{ whiteSpace: "nowrap", color: "#d1d5db", fontWeight: 300 }}>
                    Build a habit that
                </span>

                <div style={{ display: "flex" }}>
                    {words.map((word, index) => (
                        <motion.span
                            key={word} // Using word as key as in user's example
                            initial={{ opacity: 0, filter: "blur(0px)" }}
                            animate={{
                                opacity: [0, 1, 1, 0],
                                filter: ["blur(0px)", "blur(0px)", "blur(0px)", "blur(0px)"],
                            }}
                            transition={{
                                duration: 2.2,
                                delay: index * 0.5,
                                repeat: Infinity,
                                repeatDelay: 1.5,
                            }}
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                fontStyle: "italic",
                                fontWeight: 600,
                                color: "#4ff3ff",
                                textShadow:
                                    "0 0 4px #4ff3ff, 0 0 10px #3ad7e8", // Reduced shadow
                                display: "inline-block",
                                marginRight: "4px",
                            }}
                        >
                            {word}
                        </motion.span>
                    ))}
                </div>
            </h2>
        </div>
    );
}
