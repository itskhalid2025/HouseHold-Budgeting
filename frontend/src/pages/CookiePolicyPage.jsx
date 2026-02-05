import React, { useState, useEffect } from 'react';
import { useMedia } from 'react-use';
import CookiePolicyDesktop from './desktop/CookiePolicyDesktop';
import CookiePolicyMobile from './mobile/CookiePolicyMobile';

const CookiePolicyPage = () => {
    const isDesktop = useMedia('(min-width: 768px)');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return isDesktop
        ? <CookiePolicyDesktop theme={theme} toggleTheme={toggleTheme} />
        : <CookiePolicyMobile theme={theme} toggleTheme={toggleTheme} />;
};

export default CookiePolicyPage;
