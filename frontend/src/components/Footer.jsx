import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../pages/Landing.css'; // Assuming styles are here or move to Footer.css

const Footer = ({ isMobile = false }) => {
    const navigate = useNavigate();

    if (isMobile) {
        return (
            <footer className="footer-container" style={{ padding: '30px 15px', fontSize: '0.9rem' }}>
                <p>&copy; 2026 HouseHold Budgeting</p>
            </footer>
        );
    }

    return (
        <footer className="footer-container main-footer">
            <div className="footer-links">
                {/* Use spans with onClick for consistent behavior if outside router context issues arise, but NavLink is safer for accessibility if styled right. 
                    However, original LandingDesktop used navigate. Let's stick to NavLink but styled classes. 
                    Wait, if we use NavLink inside LandingPage which is a route, it works.
                */}
                <span onClick={() => navigate('/features')} className="footer-link">Features</span>
                <span onClick={() => navigate('/contact')} className="footer-link">Contact</span>
                <span onClick={() => navigate('/privacy')} className="footer-link">Privacy Policy</span>
                <span onClick={() => navigate('/terms')} className="footer-link">Terms of Service</span>
            </div>
            <p>&copy; 2026 HouseHold Budgeting. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
