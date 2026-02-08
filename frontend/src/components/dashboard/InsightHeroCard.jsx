/**
 * @fileoverview InsightHeroCard Component
 * 
 * A premium, hero-style card that displays smart financial insights
 * with adaptive themes and animations.
 * 
 * @module components/dashboard/InsightHeroCard
 */

import React, { useState, useEffect } from 'react';
import {
    AlertTriangle,
    TrendingDown,
    ThumbsUp,
    ShoppingCart,
    ChevronRight,
    Sparkles,
    Zap,
    CheckCircle,
    Lightbulb
} from 'lucide-react';
import './InsightHeroCard.css';

const THEME_CONFIG = {
    danger: {
        icon: AlertTriangle,
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.2)',
        glow: 'rgba(239, 68, 68, 0.4)',
        badge: 'Alert'
    },
    warning: {
        icon: TrendingDown,
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.2)',
        glow: 'rgba(245, 158, 11, 0.4)',
        badge: 'Prediction'
    },
    success: {
        icon: ThumbsUp,
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.2)',
        glow: 'rgba(16, 185, 129, 0.4)',
        badge: 'Success'
    },
    info: {
        icon: ShoppingCart,
        color: '#3b82f6',
        bg: 'rgba(59, 130, 246, 0.1)',
        border: 'rgba(59, 130, 246, 0.2)',
        glow: 'rgba(59, 130, 246, 0.4)',
        badge: 'Tip'
    }
};

const ICON_MAP = {
    'alert-triangle': AlertTriangle,
    'trending-down': TrendingDown,
    'thumbs-up': ThumbsUp,
    'shopping-cart': ShoppingCart,
    'zap': Zap,
    'check-circle': CheckCircle,
    'lightbulb': Lightbulb
};

export default function InsightHeroCard({ insight, loading, onAction }) {
    const [activeSlide, setActiveSlide] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (insight && !loading) {
            setIsVisible(true);
        }
    }, [insight, loading]);

    if (loading) {
        return (
            <div className="insight-hero-skeleton">
                <div className="skeleton-line large"></div>
                <div className="skeleton-line medium"></div>
                <div className="skeleton-line small"></div>
            </div>
        );
    }

    if (!insight || !insight.insights || insight.insights.length === 0) {
        return null; // Don't render if no insights
    }

    const currentInsight = insight.insights[activeSlide];
    const theme = THEME_CONFIG[currentInsight.theme] || THEME_CONFIG.info;
    const Icon = ICON_MAP[currentInsight.icon] || theme.icon;

    const handleNext = () => {
        setActiveSlide((prev) => (prev + 1) % insight.insights.length);
    };

    return (
        <div
            className={`insight-hero-container ${isVisible ? 'fade-in' : ''}`}
            style={{
                '--card-theme-color': theme.color,
                '--card-theme-bg': theme.bg,
                '--card-theme-border': theme.border,
                '--card-theme-glow': theme.glow
            }}
        >
            <div className="insight-hero-glass">
                {/* Particle/Glow Effect */}
                <div className="insight-glow-mesh"></div>

                <div className="insight-hero-header">
                    <div className="insight-badge">
                        <Sparkles size={14} className="sparkle-icon" />
                        <span>Smart Insight</span>
                    </div>
                    <div className="insight-pagination">
                        {insight.insights.map((_, idx) => (
                            <div
                                key={idx}
                                className={`pagination-dot ${idx === activeSlide ? 'active' : ''}`}
                                onClick={() => setActiveSlide(idx)}
                            />
                        ))}
                    </div>
                </div>

                <div className="insight-hero-content">
                    <div className="insight-icon-container">
                        <div className="insight-icon-blob"></div>
                        <Icon size={32} className="insight-main-icon" />
                    </div>

                    <div className="insight-text-area">
                        <div className="insight-category-badge" style={{ color: theme.color }}>
                            {currentInsight.type}
                        </div>
                        <h2 className="insight-message">{currentInsight.message}</h2>
                        <p className="insight-details">{currentInsight.details}</p>
                    </div>
                </div>

                <div className="insight-hero-footer">
                    <div className="insight-hero-summary">
                        {insight.heroMessage}
                    </div>
                    <button className="insight-action-btn" onClick={handleNext}>
                        <span>Next Insight</span>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
