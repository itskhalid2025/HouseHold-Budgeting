import React from 'react';
import './MobileButton.css';

export default function MobileButton({
    children,
    onClick,
    variant = 'primary', // primary, secondary, danger, ghost
    size = 'md', // sm, md, lg
    icon: Icon,
    className = '',
    disabled = false,
    type = 'button'
}) {
    return (
        <button
            type={type}
            className={`mobile-btn mobile-btn-${variant} mobile-btn-${size} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {Icon && <Icon size={20} className="btn-icon" />}
            {children}
        </button>
    );
}
