import React, { useEffect, useState, useRef } from 'react';
import { useTour } from '../../context/TourContext';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import './TourOverlay.css';

/**
 * TourOverlay - Visual overlay component for the guided tour.
 * 
 * Creates a spotlight effect around target elements and displays
 * an informative tooltip with navigation controls.
 */
const TourOverlay = () => {
    const {
        isTourActive,
        currentStep,
        currentStepIndex,
        totalSteps,
        isFirstStep,
        isLastStep,
        nextStep,
        prevStep,
        skipTour,
        endTour
    } = useTour();

    const [targetRect, setTargetRect] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const tooltipRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState(false);

    // Find and track the target element
    useEffect(() => {
        if (!isTourActive || !currentStep) {
            setTargetRect(null);
            return;
        }

        const findElement = () => {
            let element = null;

            // Try by data-tour-id first (preferred)
            if (currentStep.targetId) {
                element = document.querySelector(`[data-tour-id="${currentStep.targetId}"]`);
            }

            // Fallback to CSS selector
            if (!element && currentStep.targetSelector) {
                element = document.querySelector(currentStep.targetSelector);
            }

            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    bottom: rect.bottom,
                    right: rect.right
                });

                // Scroll element into view if needed
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            } else {
                // Element not found - use center of screen
                setTargetRect(null);
            }
        };

        // Initial find
        setIsAnimating(true);
        const timer = setTimeout(() => {
            findElement();
            setIsAnimating(false);
        }, 100);

        // Update on resize
        const handleResize = () => findElement();
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleResize);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleResize);
        };
    }, [isTourActive, currentStep, currentStepIndex]);

    // Calculate tooltip position
    useEffect(() => {
        if (!targetRect || !tooltipRef.current) {
            // Center the tooltip if no target
            setTooltipPosition({
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            });
            return;
        }

        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const padding = 16;
        const arrowSize = 12;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const position = currentStep?.position || 'auto';
        let top, left, transform = '';
        let actualPosition = position;

        // Auto-detect best position
        if (position === 'auto') {
            const spaceTop = targetRect.top;
            const spaceBottom = viewportHeight - targetRect.bottom;
            const spaceLeft = targetRect.left;
            const spaceRight = viewportWidth - targetRect.right;

            // Prefer bottom, then top, then right, then left
            if (spaceBottom >= tooltipRect.height + padding * 2) {
                actualPosition = 'bottom';
            } else if (spaceTop >= tooltipRect.height + padding * 2) {
                actualPosition = 'top';
            } else if (spaceRight >= tooltipRect.width + padding * 2) {
                actualPosition = 'right';
            } else {
                actualPosition = 'left';
            }
        }

        switch (actualPosition) {
            case 'top':
                top = targetRect.top - tooltipRect.height - padding - arrowSize;
                left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
                break;
            case 'bottom':
                top = targetRect.bottom + padding + arrowSize;
                left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
                break;
            case 'left':
                top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
                left = targetRect.left - tooltipRect.width - padding - arrowSize;
                break;
            case 'right':
                top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
                left = targetRect.right + padding + arrowSize;
                break;
            default:
                top = targetRect.bottom + padding;
                left = targetRect.left;
        }

        // Keep tooltip within viewport
        left = Math.max(padding, Math.min(viewportWidth - tooltipRect.width - padding, left));
        top = Math.max(padding, Math.min(viewportHeight - tooltipRect.height - padding, top));

        setTooltipPosition({ top: `${top}px`, left: `${left}px`, transform });
    }, [targetRect, currentStep]);

    if (!isTourActive || !currentStep) return null;

    return (
        <div className="tour-overlay">
            {/* Dark backdrop with spotlight cutout */}
            <svg className="tour-backdrop" viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}>
                <defs>
                    <mask id="spotlight-mask">
                        <rect width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <rect
                                x={targetRect.left - 8}
                                y={targetRect.top - 8}
                                width={targetRect.width + 16}
                                height={targetRect.height + 16}
                                rx="8"
                                fill="black"
                                className={isAnimating ? '' : 'spotlight-animate'}
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.75)"
                    mask="url(#spotlight-mask)"
                />
            </svg>

            {/* Spotlight highlight ring */}
            {targetRect && (
                <div
                    className="tour-spotlight-ring"
                    style={{
                        top: targetRect.top - 8,
                        left: targetRect.left - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16
                    }}
                />
            )}

            {/* Tooltip */}
            <div
                ref={tooltipRef}
                className="tour-tooltip"
                style={tooltipPosition}
            >
                <button className="tour-skip-btn" onClick={skipTour} title="Skip Tour">
                    <X size={18} />
                </button>

                <div className="tour-content">
                    <h3 className="tour-title">{currentStep.title}</h3>
                    <p className="tour-description">{currentStep.description}</p>
                </div>

                <div className="tour-footer">
                    <div className="tour-progress">
                        <span>{currentStepIndex + 1}</span>
                        <span className="tour-progress-separator">/</span>
                        <span>{totalSteps}</span>
                    </div>

                    <div className="tour-nav">
                        {!isFirstStep && (
                            <button className="tour-nav-btn tour-prev" onClick={prevStep}>
                                <ChevronLeft size={18} />
                                <span>Back</span>
                            </button>
                        )}

                        {isLastStep ? (
                            <button className="tour-nav-btn tour-finish" onClick={endTour}>
                                <span>Finish</span>
                                <Check size={18} />
                            </button>
                        ) : (
                            <button className="tour-nav-btn tour-next" onClick={nextStep}>
                                <span>Next</span>
                                <ChevronRight size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress dots */}
                <div className="tour-dots">
                    {Array.from({ length: totalSteps }, (_, i) => (
                        <span
                            key={i}
                            className={`tour-dot ${i === currentStepIndex ? 'active' : ''} ${i < currentStepIndex ? 'completed' : ''}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TourOverlay;
