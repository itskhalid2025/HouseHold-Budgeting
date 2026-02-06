import React from "react";
import { motion } from "framer-motion";

export default function Tagline() {
    const words = ["Grow ", "with ", "you ! "];

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "left",
                marginTop: "10px",
            }}
        >
            <h2
                style={{
                    color: "white",
                    fontSize: "2.5rem",
                    fontWeight: 400,
                    fontFamily: "Inter, sans-serif",
                    display: "flex",
                    gap: "10px",
                    whiteSpace: "nowrap",
                    flexWrap: "nowrap",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                Build a habit that{" "}
                {words.map((word, index) => (
                    <motion.span
                        key={word}
                        initial={{ opacity: 0, filter: "blur(.4 px)" }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            filter: ["blur(.2px)", "blur(.2px)", "blur(.2px)", "blur(.2px)"],
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
                                "0 0 6px #4ff3ff, 0 0 14px #3ad7e8, 0 0 24px #22bcd1",
                        }}
                    >
                        {word}
                    </motion.span>
                ))}
            </h2>
        </div>
    );
}
