import React from 'react';
import './MobileInput.css';

export default function MobileInput({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    name,
    icon: Icon,
    error,
    required = false
}) {
    return (
        <div className="mobile-input-group">
            {label && <label className="mobile-input-label">{label} {required && '*'}</label>}
            <div className={`mobile-input-wrapper ${error ? 'error' : ''}`}>
                {Icon && <Icon className="mobile-input-icon" size={18} />}
                <input
                    className="mobile-input-field"
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    name={name}
                />
            </div>
            {error && <span className="mobile-input-error">{error}</span>}
        </div>
    );
}
