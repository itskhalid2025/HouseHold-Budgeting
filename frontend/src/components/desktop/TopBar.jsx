import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTour } from '../../context/TourContext';
import { Sun, Moon, HelpCircle } from 'lucide-react';
import RankBadge from '../gamification/RankBadge';
import GamificationHubDesktop from '../gamification/GamificationHubDesktop';
import RewardAnimation from '../gamification/RewardAnimation';
import GlobalSmartEntry from '../mobile/GlobalSmartEntry';
import GrowWiseLogo from '../GrowWiseLogo';
import TaglineAnimated from '../TaglineAnimated';
import {
    sidebarTourDesktop,
    dashboardTourDesktop,
    transactionsTourDesktop,
    incomeTourDesktop,
    savingsTourDesktop,
    householdTourDesktop,
    reportsTourDesktop,
    advisorTourDesktop,
    settingsTourDesktop
} from '../../tourConfigs';
import './TopBar.css';

const TopBar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { startTour } = useTour();
    const location = useLocation();
    const [showMenu, setShowMenu] = useState(false);
    const [showGamification, setShowGamification] = useState(false);
    const navigate = useNavigate();

    // Get the tour config for the current page
    const getPageTour = () => {
        const path = location.pathname;
        const tourMap = {
            '/': { id: 'dashboard-desktop', steps: dashboardTourDesktop },
            '/transactions': { id: 'transactions-desktop', steps: transactionsTourDesktop },
            '/income': { id: 'income-desktop', steps: incomeTourDesktop },
            '/savings': { id: 'savings-desktop', steps: savingsTourDesktop },
            '/household': { id: 'household-desktop', steps: householdTourDesktop },
            '/reports': { id: 'reports-desktop', steps: reportsTourDesktop },
            '/advisor': { id: 'advisor-desktop', steps: advisorTourDesktop },
            '/settings': { id: 'settings-desktop', steps: settingsTourDesktop }
        };
        return tourMap[path] || { id: 'navigation-desktop', steps: sidebarTourDesktop };
    };

    const handleTriggerGuide = () => {
        const tour = getPageTour();
        startTour(tour.id, tour.steps);
    };

    const handleNavigate = (tab) => {
        setShowMenu(false);
        navigate('/settings', { state: { tab } });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.user-menu-container')) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="top-bar">
            <div className="top-bar-content">
                {/* BRANDING - LEFT SIDE */}
                <div className="top-bar-branding" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <GrowWiseLogo size="" style={{ fontSize: '2rem' }} animated={true} />
                    <TaglineAnimated />
                </div>

                {/* Spacer to push content to the right */}
                <div className="spacer"></div>

                <div className="top-bar-actions">
                    {isAuthenticated ? (
                        <>
                            {/* Gamification Badge */}
                            <div className="gamification-section">
                                <RewardAnimation />
                                <RankBadge onClick={() => setShowGamification(true)} />
                            </div>

                            <button
                                className="theme-toggle-btn"
                                onClick={toggleTheme}
                                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                                data-tour-id="settings-theme"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            <button
                                className="theme-toggle-btn"
                                onClick={handleTriggerGuide}
                                title="Page Guide"
                            >
                                <HelpCircle size={20} />
                            </button>

                            <div className="user-menu-container">
                                <div
                                    className="user-menu-trigger"
                                    onClick={() => setShowMenu(!showMenu)}
                                >
                                    <div className="user-avatar-circle">
                                        {(user?.firstName?.[0] || 'U').toUpperCase()}
                                    </div>
                                </div>

                                {showMenu && (
                                    <div className="dropdown-menu">
                                        <div className="dropdown-header">
                                            <div className="dropdown-user-name">{user?.firstName} {user?.lastName}</div>
                                            <div className="dropdown-user-email">{user?.email}</div>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <button onClick={() => handleNavigate('profile')} className="dropdown-item">
                                            Profile settings
                                        </button>
                                        <button onClick={() => handleNavigate('household')} className="dropdown-item">
                                            Household management
                                        </button>
                                        
                                        <button onClick={() => handleNavigate('household')} className="dropdown-item">
                                            Currency settings
                                        </button>
                                        <div className="dropdown-divider"></div>
                                        <button onClick={logout} className="dropdown-item danger">
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* GUEST STATE */
                        <>
                            <button
                                className="theme-toggle-btn"
                                onClick={toggleTheme}
                                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <nav className="auth-nav">
                                <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Login</NavLink>
                                <NavLink to="/register" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Register</NavLink>
                            </nav>
                        </>
                    )}
                </div>

                {isAuthenticated && (
                    <GamificationHubDesktop
                        isOpen={showGamification}
                        onClose={() => setShowGamification(false)}
                    />
                )}
            </div>
        </header>
    );
};

export default TopBar;
