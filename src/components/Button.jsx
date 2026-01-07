import React, { useState, useRef } from 'react';

export default function Button({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    type = 'button',
    icon,
    iconPosition = 'left'
}) {
    const [ripples, setRipples] = useState([]);
    const [magnetOffset, setMagnetOffset] = useState({ x: 0, y: 0 });
    const buttonRef = useRef(null);

    const baseClasses = 'font-semibold rounded-xl transition-all duration-300 transform relative overflow-hidden';

    const variants = {
        primary: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-glow-md hover:scale-105 active:scale-95',
        secondary: 'glassmorphic text-white hover:bg-white/20 hover:shadow-glass',
        outline: 'border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    const handleClick = (e) => {
        if (disabled) return;

        // Create ripple effect
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const newRipple = {
            x,
            y,
            size,
            id: Date.now()
        };

        setRipples(prev => [...prev, newRipple]);

        // Remove ripple after animation
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 600);

        if (onClick) onClick(e);
    };

    const handleMouseMove = (e) => {
        if (disabled || !buttonRef.current) return;

        const button = buttonRef.current;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Magnetic effect - subtle movement (max 6px)
        const maxOffset = 6;
        const magnetStrength = 0.3;
        setMagnetOffset({
            x: Math.max(-maxOffset, Math.min(maxOffset, x * magnetStrength)),
            y: Math.max(-maxOffset, Math.min(maxOffset, y * magnetStrength))
        });
    };

    const handleMouseLeave = () => {
        setMagnetOffset({ x: 0, y: 0 });
    };

    return (
        <button
            ref={buttonRef}
            type={type}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            className={`
                ${baseClasses}
                ${variants[variant]}
                ${sizes[size]}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
            style={{
                transform: `translate(${magnetOffset.x}px, ${magnetOffset.y}px)`
            }}
        >
            {/* Ripple effects */}
            {ripples.map(ripple => (
                <span
                    key={ripple.id}
                    className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: ripple.size,
                        height: ripple.size,
                    }}
                />
            ))}

            {/* Button content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
                {icon && iconPosition === 'left' && <span>{icon}</span>}
                {children}
                {icon && iconPosition === 'right' && <span>{icon}</span>}
            </span>

        </button>
    );
}
