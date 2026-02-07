import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
    Sun, Moon, Sparkles, BarChart3, Brain, Mic, Image, Type, Upload,
    TrendingUp, Shield, Users, CheckCircle, Zap, Globe, DollarSign,
    ChevronDown
} from 'lucide-react';
import GrowWiseLogo from '../components/GrowWiseLogo';
import TaglineSequential from '../components/TaglineSequential';
import './LandingPage.css';

// Logo Intro Component with Enhanced Animation
function LogoIntro({ onComplete, isMobile }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 9000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            className="logo-intro-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5 } }}
        >
            {/* Animated Starfield Background */}
            <div className="starfield-intro">
                {[...Array(50)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="star"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            scale: 0,
                            opacity: 0
                        }}
                        animate={{
                            scale: [0, 1, 1],
                            opacity: [0, 1, 0.8],
                        }}
                        transition={{
                            duration: 2,
                            delay: Math.random() * 2,
                            repeat: Infinity,
                            repeatDelay: Math.random() * 3
                        }}
                    />
                ))}
            </div>

            <div className="logo-intro-container">
                {/* Logo Animation */}
                <motion.div
                    className="logo-intro-logo"
                    initial={{ scale: 0.3, opacity: 0, rotateY: -180 }}
                    animate={{
                        scale: [0.3, 1.2, 1],
                        opacity: 1,
                        rotateY: 0
                    }}
                    transition={{
                        duration: 1.5,
                        ease: [0.34, 1.56, 0.64, 1]
                    }}
                >
                    <GrowWiseLogo
                        size={isMobile ? "text-7xl" : "text-9xl"}
                        style={{ fontSize: isMobile ? '5rem' : '10rem' }}
                        animated={true}
                    />
                </motion.div>

                {/* Tagline Animation */}
                <motion.div
                    className="logo-intro-tagline"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8, duration: 0.8 }}
                >
                    <TaglineSequential isMobile={isMobile} />
                </motion.div>

                {/* Pulsing Glow Effect */}
                <motion.div
                    className="intro-glow"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>
        </motion.div>
    );
}

// Parallax Stars Component
function ParallaxStars() {
    return (
        <div className="parallax-stars">
            <div className="stars-layer stars-slow"></div>
            <div className="stars-layer stars-medium"></div>
            <div className="stars-layer stars-fast"></div>
        </div>
    );
}

// Scroll Indicator
function ScrollIndicator() {
    return (
        <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 1 }}
        >
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                <ChevronDown size={32} />
            </motion.div>
        </motion.div>
    );
}

function LandingPage() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [showIntro, setShowIntro] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="landing-page">
            {/* Starry Background */}
            <div className="starry-background" />
            <ParallaxStars />

            {/* Intro Animation */}
            <AnimatePresence>
                {showIntro && (
                    <LogoIntro
                        onComplete={() => setShowIntro(false)}
                        isMobile={isMobile}
                    />
                )}
            </AnimatePresence>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showIntro ? 0 : 1 }}
                transition={{ duration: 0.8 }}
            >
                {/* Theme Toggle */}
                <motion.div 
                    className="landing-theme-toggle" 
                    onClick={toggleTheme}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </motion.div>

                {/* Hero Section */}
                <section className="landing-hero">
                    <div className="landing-hero-content">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 1 }}
                        >
                            <h1>
                                Take control of your money
                                <span className="hero-highlight"> — effortlessly</span>
                            </h1>
                        </motion.div>

                        <motion.p
                            className="subtitle"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 1 }}
                        >
                            {isMobile
                                ? "The world's smartest AI-powered household budgeting platform"
                                : "Welcome to the world's smartest AI-powered household budgeting platform, designed to understand your finances the way you do."
                            }
                        </motion.p>

                        <motion.p
                            className="description"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9, duration: 1 }}
                        >
                            From income tracking and smart categorization to deep financial insights,
                            this platform does everything automatically {!isMobile && "— so you can focus on living"}.
                        </motion.p>

                        <motion.div
                            className="landing-hero-features"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                        >
                            <motion.span
                                whileHover={{ scale: 1.1, y: -5 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                <TrendingUp size={isMobile ? 18 : 20} /> Track
                            </motion.span>
                            <motion.span
                                whileHover={{ scale: 1.1, y: -5 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                <BarChart3 size={isMobile ? 18 : 20} /> Analyze
                            </motion.span>
                            <motion.span
                                whileHover={{ scale: 1.1, y: -5 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                <Brain size={isMobile ? 18 : 20} /> Improve
                            </motion.span>
                        </motion.div>

                        <motion.p
                            className="description"
                            style={{ 
                                fontSize: isMobile ? '1rem' : '1.1rem', 
                                marginBottom: isMobile ? '40px' : '50px' 
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5, duration: 0.8 }}
                        >
                            {!isMobile && "All in one place. "}
                            <span className="gradient-text">Powered by next-generation AI.</span>
                        </motion.p>

                        <motion.button
                            className="landing-cta-primary"
                            onClick={() => navigate('/login')}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ 
                                delay: 1.8, 
                                duration: 0.5,
                                type: "spring",
                                stiffness: 200
                            }}
                            whileHover={{ 
                                scale: 1.08,
                                boxShadow: "0 15px 40px rgba(99, 102, 241, 0.4)"
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Join Now <Sparkles size={isMobile ? 20 : 24} />
                        </motion.button>

                        {/* Mobile App Preview - Floating */}
                        {!isMobile && (
                            <motion.div
                                className="hero-mobile-preview"
                                initial={{ opacity: 0, x: 100, rotate: 15 }}
                                animate={{ opacity: 1, x: 0, rotate: 0 }}
                                transition={{ delay: 2, duration: 1 }}
                                style={{
                                    transform: `translateY(${scrollY * 0.1}px)`
                                }}
                            >
                                <img 
                                    src="/assets/landing/mobile-land.png" 
                                    alt="GrowWise Mobile App"
                                />
                            </motion.div>
                        )}
                    </div>

                    <ScrollIndicator />
                </section>

                {/* Why Use Section */}
                <section className="landing-section why-section">
                    <motion.h2
                        className="landing-section-title"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        Why Use GrowWise?
                    </motion.h2>
                    <motion.p
                        className="landing-section-subtitle"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        {isMobile
                            ? "Our system thinks with you. It understands spending behavior, detects patterns, and guides you with actual decision-making intelligence."
                            : "Unlike traditional apps that only store numbers, our system thinks with you. It understands spending behavior, detects patterns, and guides you with actual decision-making intelligence."
                        }
                    </motion.p>

                    <div className="landing-benefits-grid">
                        {[
                            { icon: "🤖", title: "Fully Automated", desc: isMobile ? "AI categorizes everything perfectly." : "AI instantly categorizes everything into Needs, Wants, and Savings — perfectly." },
                            { icon: "🏠", title: isMobile ? "Trusted Home" : "Trusted Home", desc: isMobile ? "All your financial data in one place." : "A single place to store and manage all your financial data securely." },
                            { icon: "📊", title: "Smart Insights", desc: isMobile ? "Know where your money goes." : "Understand your habits clearly and know where your money actually goes." },
                            { icon: "👨‍👩‍👧‍👦", title: isMobile ? "For Families" : "For Families", desc: isMobile ? "Track together, grow together." : "Share expenses, track together, grow together." }
                        ].map((benefit, index) => (
                            <motion.div
                                key={index}
                                className="landing-benefit-item"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ delay: index * 0.15, duration: 0.6 }}
                                whileHover={{ 
                                    y: -10,
                                    transition: { type: "spring", stiffness: 300 }
                                }}
                            >
                                <motion.div 
                                    className="icon"
                                    whileHover={{ scale: 1.2, rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    {benefit.icon}
                                </motion.div>
                                <h4>{benefit.title}</h4>
                                <p>{benefit.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* AI Power Section */}
                <section className="landing-section landing-ai-section">
                    <motion.h2
                        className="landing-section-title"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6 }}
                    >
                        {isMobile ? "The AI Power" : "The AI Power Behind The Platform"}
                    </motion.h2>
                    <motion.p
                        className="landing-section-subtitle"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        {isMobile
                            ? "Three powerful AI systems working together"
                            : "Your budget is supported by three powerful AI systems working together"
                        }
                    </motion.p>

                    <div className="landing-features-grid">
                        {/* Smart Categorization AI */}
                        <motion.div
                            className="landing-feature-card"
                            initial={{ opacity: 0, y: 80 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ delay: 0.1, duration: 0.8 }}
                            whileHover={{ 
                                y: -15,
                                transition: { type: "spring", stiffness: 200 }
                            }}
                        >
                            <motion.div 
                                className="landing-feature-icon"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Sparkles size={isMobile ? 28 : 32} color="white" />
                            </motion.div>
                            <h3>🔥 Smart Categorization {!isMobile && "AI"}</h3>
                            <p>
                                Automatically detects where each expense belongs{isMobile ? " and categorizes it perfectly." : ", whether it's a Need, Want, or Saving, and what subcategory it falls under."}
                            </p>
                            <ul className="landing-feature-list">
                                <li><Mic size={isMobile ? 14 : 16} /> Voice input{!isMobile && " support"}</li>
                                <li><Image size={isMobile ? 14 : 16} /> Image scanning{!isMobile && " (bills, receipts, payslips)"}</li>
                                <li><Type size={isMobile ? 14 : 16} /> Text entry{!isMobile && " (any language)"}</li>
                                <li><Upload size={isMobile ? 14 : 16} /> Bulk {isMobile ? "uploads" : "data uploads"}</li>
                            </ul>
                            {!isMobile && (
                                <p className="feature-tagline">
                                    Just upload or speak — the AI does the rest.
                                </p>
                            )}
                        </motion.div>

                        {/* AI Report Generator */}
                        <motion.div
                            className="landing-feature-card featured-card"
                            initial={{ opacity: 0, y: 80 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            whileHover={{ 
                                y: -15,
                                transition: { type: "spring", stiffness: 200 }
                            }}
                        >
                            <motion.div 
                                className="landing-feature-icon"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.8 }}
                            >
                                <BarChart3 size={isMobile ? 28 : 32} color="white" />
                            </motion.div>
                            <h3>📊 {isMobile ? "Report Generator" : "AI Report Generator"}</h3>
                            <p>
                                Generates comprehensive financial reports automatically{!isMobile && " based on your real data"}.
                            </p>
                            <ul className="landing-feature-list">
                                <li>Weekly {isMobile ? "summaries" : "financial summaries"}</li>
                                <li>Monthly {isMobile ? "reports" : "spending reports"}</li>
                                <li>Custom {isMobile ? "analysis" : "date range analysis"}</li>
                                <li>Beautiful charts{!isMobile && " and visualizations"}</li>
                                <li>Spending heatmaps</li>
                                {!isMobile && <li>Category breakdowns</li>}
                            </ul>

                            {/* IMAGE: Report Screenshot */}
                            <motion.div
                                className="feature-card-image"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                whileHover={{ 
                                    scale: 1.05,
                                    transition: { duration: 0.3 }
                                }}
                            >
                                <img
                                    src="/assets/landing/report-land.png"
                                    alt="AI-generated weekly financial report showing spending breakdown and insights"
                                    loading="lazy"
                                />
                                <div className="image-overlay">
                                    <span>View Sample Report</span>
                                </div>
                            </motion.div>

                            {!isMobile && (
                                <p className="feature-tagline">
                                    All automatically, no manual work required.
                                </p>
                            )}
                        </motion.div>

                        {/* RAG-Powered Financial Advisor */}
                        <motion.div
                            className="landing-feature-card"
                            initial={{ opacity: 0, y: 80 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            whileHover={{ 
                                y: -15,
                                transition: { type: "spring", stiffness: 200 }
                            }}
                        >
                            <motion.div 
                                className="landing-feature-icon"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Brain size={isMobile ? 28 : 32} color="white" />
                            </motion.div>
                            <h3>🧠 {isMobile ? "Financial Advisor" : "RAG-Powered Financial Advisor AI"}</h3>
                            <p>
                                {isMobile
                                    ? "Your personal AI financial coach with advanced intelligence."
                                    : "This is the brain of your financial system. It uses advanced AI to provide personalized guidance."
                                }
                            </p>
                            <ul className="landing-feature-list">
                                <li>Chat memory & context</li>
                                <li>Uses advanced RAG technology</li>
                                <li>{isMobile ? "Pie charts & bar graphs" : "Generates interactive pie charts & bar graphs"}</li>
                                <li>Finds cheap {isMobile ? "groceries nearby" : "grocery places near you"}</li>
                                <li>Analyzes {isMobile ? "spending patterns" : "actual spending patterns"}</li>
                                {!isMobile && <li>Compares time periods</li>}
                                <li>Highlights {isMobile ? "risks" : "financial risks"}</li>
                                {!isMobile && <li>Shows wasteful spending</li>}
                            </ul>

                            {/* IMAGE: AI Advisor Screenshot */}
                            <motion.div
                                className="feature-card-image"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                whileHover={{ 
                                    scale: 1.05,
                                    transition: { duration: 0.3 }
                                }}
                            >
                                <img
                                    src="/assets/landing/ai-advisor-land.png"
                                    alt="AI Financial Advisor chat interface with spending analysis and recommendations"
                                    loading="lazy"
                                />
                                <div className="image-overlay">
                                    <span>Try AI Advisor</span>
                                </div>
                            </motion.div>

                            {!isMobile && (
                                <p className="feature-tagline">
                                    Like a personal financial coach, not a chatbot.
                                </p>
                            )}
                        </motion.div>
                    </div>
                </section>

                {/* How It Helps Section */}
                <section className="landing-section how-helps-section">
                    <motion.h2
                        className="landing-section-title"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        {isMobile ? "How It Helps You" : "How This Budgeting System Helps You"}
                    </motion.h2>

                    <div className="landing-benefits-grid">
                        {[
                            { icon: "💼", title: isMobile ? "One Platform" : "One Platform for Everything", desc: isMobile ? "Everything in one place." : "No spreadsheets. No manual work. Everything in one place." },
                            { icon: "🔍", title: isMobile ? "Clear Insights" : "Understand Your Habits", desc: isMobile ? "Understand your habits." : "Know where your money actually goes with clear insights." },
                            { icon: "⚠️", title: isMobile ? "Smart Warnings" : "Detect Luxury Spending", desc: isMobile ? "Detect luxury spending early." : "The system warns you with color-coded insights before it's a problem." },
                            { icon: "🔔", title: "AI Alerts", desc: isMobile ? "Stay informed automatically." : "Stay informed without checking manually with weekly summaries." }
                        ].map((benefit, index) => (
                            <motion.div
                                key={index}
                                className="landing-benefit-item"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ delay: index * 0.15, duration: 0.6 }}
                                whileHover={{ 
                                    y: -10,
                                    transition: { type: "spring", stiffness: 300 }
                                }}
                            >
                                <motion.div 
                                    className="icon"
                                    whileHover={{ scale: 1.2, rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    {benefit.icon}
                                </motion.div>
                                <h4>{benefit.title}</h4>
                                <p>{benefit.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Mobile Showcase - Mobile Only */}
                    {isMobile && (
                        <motion.div
                            className="mobile-showcase-mobile"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            <img
                                src="/assets/landing/mobile-land.png"
                                alt="GrowWise mobile dashboard showing monthly overview and weekly spending"
                                loading="lazy"
                            />
                            <h3>Designed for Mobile</h3>
                            <p>Access your finances anywhere, anytime.</p>
                        </motion.div>
                    )}
                </section>

                {/* Household Section */}
                <section className="landing-section landing-household-section">
                    <motion.h2
                        className="landing-section-title"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        {isMobile ? "Create or Join a Household" : "Join or Create a Household"}
                    </motion.h2>
                    <motion.p
                        className="landing-section-subtitle"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        {isMobile
                            ? "Perfect for families, couples, roommates, or teams."
                            : "After logging in, you can create a new household for your family, couple, roommates, or team — or join an existing one using a code or invite."
                        }
                    </motion.p>

                    <div className="landing-household-grid">
                        <motion.div
                            className="landing-benefit-item household-card"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            whileHover={{ 
                                y: -10,
                                transition: { type: "spring", stiffness: 300 }
                            }}
                        >
                            <motion.div 
                                className="icon"
                                whileHover={{ scale: 1.2, rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Users size={isMobile ? 40 : 48} />
                            </motion.div>
                            <h4>{isMobile ? "Create New" : "Create a New Household"}</h4>
                            <p>{isMobile ? "Start tracking finances together." : "Perfect for families, couples, roommates, or teams who want to track finances together."}</p>
                        </motion.div>
                        
                        <motion.div
                            className="landing-benefit-item household-card"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            whileHover={{ 
                                y: -10,
                                transition: { type: "spring", stiffness: 300 }
                            }}
                        >
                            <motion.div 
                                className="icon"
                                whileHover={{ scale: 1.2, rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Shield size={isMobile ? 40 : 48} />
                            </motion.div>
                            <h4>{isMobile ? "Join Existing" : "Join an Existing Household"}</h4>
                            <p>{isMobile ? "Use a code to join a household." : "Use a code or invite to join a household and start collaborating on budgets."}</p>
                        </motion.div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="landing-cta-section">
                    <motion.div
                        className="cta-content"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            {isMobile ? "🌟 Start Today" : "🌟 Start your financial transformation today"}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            Your money deserves a smarter home{!isMobile && ", and you deserve clarity"}.
                        </motion.p>

                        <motion.div
                            className="landing-cta-buttons"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            <motion.button
                                className="landing-cta-button primary"
                                onClick={() => navigate('/login')}
                                whileHover={{ 
                                    scale: 1.08,
                                    boxShadow: "0 15px 40px rgba(255, 255, 255, 0.3)"
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Login
                            </motion.button>
                            <motion.button
                                className="landing-cta-button secondary"
                                onClick={() => navigate('/register')}
                                whileHover={{ 
                                    scale: 1.08,
                                    boxShadow: "0 15px 40px rgba(255, 255, 255, 0.2)"
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Register
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Footer */}
                <footer className="footer-container">
                    <div className="footer-links">
                        <motion.span 
                            className="footer-link" 
                            onClick={() => navigate('/features')}
                            whileHover={{ scale: 1.05 }}
                        >
                            Features
                        </motion.span>
                        <motion.span 
                            className="footer-link" 
                            onClick={() => navigate('/contact')}
                            whileHover={{ scale: 1.05 }}
                        >
                            Contact
                        </motion.span>
                        <motion.span 
                            className="footer-link" 
                            onClick={() => navigate('/privacy')}
                            whileHover={{ scale: 1.05 }}
                        >
                            Privacy Policy
                        </motion.span>
                        <motion.span 
                            className="footer-link" 
                            onClick={() => navigate('/terms')}
                            whileHover={{ scale: 1.05 }}
                        >
                            Terms of Service
                        </motion.span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>&copy; 2025 GrowWise. All rights reserved.</p>
                </footer>
            </motion.div>
        </div>
    );
}

export default LandingPage;
