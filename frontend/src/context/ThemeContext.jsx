import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Enforce 'dark' theme for all users
    const theme = 'dark';

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        // We no longer need to save to localStorage as it's enforced
    }, []);

    const toggleTheme = () => {
        // Theme toggling is disabled
        console.warn('Theme toggling is disabled');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
