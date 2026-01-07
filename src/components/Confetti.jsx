import React, { useEffect, useState } from 'react';

const Confetti = ({ duration = 2500, particleCount = 50 }) => {
    const [particles, setParticles] = useState([]);

    const getRandomColor = () => {
        const colors = [
            'from-purple-500 to-pink-500',
            'from-blue-500 to-teal-500',
            'from-yellow-500 to-orange-500',
            'from-green-500 to-emerald-500',
            'from-pink-500 to-rose-500',
            'from-indigo-500 to-purple-500',
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    useEffect(() => {
        // Generate random confetti particles
        const newParticles = Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            x: Math.random() * 100, // Percentage from left
            delay: Math.random() * 200, // Stagger animation
            duration: 2000 + Math.random() * 1000, // Random fall duration
            rotation: Math.random() * 360, // Initial rotation
            size: 8 + Math.random() * 6, // Size variation
            color: getRandomColor(),
        }));

        setParticles(newParticles);

        // Auto cleanup
        const timer = setTimeout(() => {
            setParticles([]);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, particleCount]);

    if (particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className={`absolute top-0 bg-gradient-to-br ${particle.color} rounded-sm`}
                    style={{
                        left: `${particle.x}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        animation: `confettiFall ${particle.duration}ms ease-in forwards`,
                        animationDelay: `${particle.delay}ms`,
                        transform: `rotate(${particle.rotation}deg)`,
                    }}
                />
            ))}

        </div>
    );
};

export default Confetti;
