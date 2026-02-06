import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../pages/Landing/LandingPage.css'; // Updated to point to new LandingPage styles

const Footer = ({ isMobile = false }) => {
    const navigate = useNavigate();
    const atBottomOnceRef = React.useRef(false);
    const footerRef = React.useRef(null);

    React.useEffect(() => {
        if (isMobile) return;

        // Helper to check if we are at the bottom
        const checkAtBottom = () => {
            return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 20;
        };

        const handleScroll = () => {
            const footer = footerRef.current;
            if (!footer) return;

            const isAtBottom = checkAtBottom();

            if (!isAtBottom) {
                // If user scrolls up away from bottom, reset and collapse
                atBottomOnceRef.current = false;
                footer.classList.remove("footer-expanded");
                footer.classList.add("footer-collapsed");
            } else {
                // We reached bottom, arm the trigger
                atBottomOnceRef.current = true;
            }
        };

        const handleWheel = (e) => {
            const footer = footerRef.current;
            if (!footer) return;

            const isAtBottom = checkAtBottom();

            // If we are effectively at bottom, armed, and user scrolls DOWN (deltaY > 0)
            if (isAtBottom && atBottomOnceRef.current && e.deltaY > 0) {
                footer.classList.remove("footer-collapsed");
                footer.classList.add("footer-expanded");
            }
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("wheel", handleWheel, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("wheel", handleWheel);
        };
    }, [isMobile]);

    if (isMobile) {
        return (
            <footer className="footer-container" style={{ padding: '10px 15px', fontSize: '0.8rem' }}>
                <p>&copy; 2026 GrowWise. All rights reserved</p>
            </footer>
        );
    }

    return (
        <footer
            ref={footerRef}
            className="footer-container main-footer footer-collapsed"
        >
            <div className="footer-links">
                <span onClick={() => navigate('/features')} className="footer-link">Features</span>
                <span onClick={() => navigate('/contact')} className="footer-link">Contact</span>
                <span onClick={() => navigate('/privacy')} className="footer-link">Privacy Policy</span>
                <span onClick={() => navigate('/terms')} className="footer-link">Terms of Service</span>
            </div>
            <p className="text-gray-400">&copy; 2026 GrowWise. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
