import React, { useState, useRef } from 'react';

export default function GlassCard({ children, className = '', hover = true, onClick, tilt = true }) {
    const [tiltStyle, setTiltStyle] = useState({});
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!hover || !tilt) return;

        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8; // Max 8deg tilt
        const rotateY = ((x - centerX) / centerX) * 8;

        setTiltStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
        });
    };

    const handleMouseLeave = () => {
        setTiltStyle({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        });
    };

    return (
        <div
            ref={cardRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={tiltStyle}
            className={`
                glassmorphic rounded-2xl p-6
                ${hover ? 'transition-all duration-300 hover:shadow-glow-md cursor-pointer' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
}
