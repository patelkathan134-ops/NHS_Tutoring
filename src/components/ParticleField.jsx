import React, { useEffect, useRef } from 'react';

const ParticleField = ({ density = 50 }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;

        // Set canvas size
        const setCanvasSize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        setCanvasSize();

        // Particle class
        class Particle {
            constructor() {
                this.reset();
                this.y = Math.random() * height; // Start at random position
            }

            reset() {
                this.x = Math.random() * width;
                this.y = -10;
                this.size = Math.random() * 3 + 1;
                this.speedY = Math.random() * 0.5 + 0.2;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.5 + 0.3;
                this.hue = Math.random() * 60 + 260; // Purple to pink range
            }

            update() {
                // Move particle
                this.y += this.speedY;
                this.x += this.speedX;

                // Mouse interaction - subtle attraction
                const dx = mouseRef.current.x - this.x;
                const dy = mouseRef.current.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    const force = (150 - distance) / 150;
                    this.x += (dx / distance) * force * 0.5;
                    this.y += (dy / distance) * force * 0.5;
                }

                // Reset if out of bounds
                if (this.y > height + 10 || this.x < -10 || this.x > width + 10) {
                    this.reset();
                }
            }

            draw(ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${this.opacity})`;
                ctx.fill();

                // Glow effect
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size * 3
                );
                gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, ${this.opacity * 0.5})`);
                gradient.addColorStop(1, `hsla(${this.hue}, 70%, 60%, 0)`);
                ctx.fillStyle = gradient;
                ctx.fillRect(
                    this.x - this.size * 3,
                    this.y - this.size * 3,
                    this.size * 6,
                    this.size * 6
                );
            }
        }

        // Initialize particles
        particlesRef.current = Array.from({ length: density }, () => new Particle());

        // Mouse move handler
        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            particlesRef.current.forEach((particle) => {
                particle.update();
                particle.draw(ctx);
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        // Event listeners
        window.addEventListener('resize', setCanvasSize);
        window.addEventListener('mousemove', handleMouseMove);

        // Start animation
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', setCanvasSize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [density]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.6 }}
        />
    );
};

export default ParticleField;
