import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    alpha: number;
    speed: number;
}

export const AnimatedBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let particles: Particle[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            const count = Math.floor((canvas.width * canvas.height) / 15000);
            for (let i = 0; i < count; i++) {
                particles.push(createParticle(true));
            }
        };

        const createParticle = (randomY = false): Particle => {
            return {
                x: Math.random() * canvas.width,
                y: randomY ? Math.random() * canvas.height : canvas.height + 10,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -Math.random() * 0.5 - 0.2,
                radius: Math.random() * 3 + 2,
                alpha: Math.random() * 0.5 + 0.2,
                speed: Math.random() * 0.5 + 0.5
            };
        };

        const drawParticle = (p: Particle) => {
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
            gradient.addColorStop(0, `rgba(170, 59, 255, ${p.alpha})`);
            gradient.addColorStop(1, 'rgba(170, 59, 255, 0)');
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        };

        const updateParticles = () => {
            particles.forEach((p, i) => {
                p.x += p.vx * p.speed;
                p.y += p.vy * p.speed;

                if (p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
                    particles[i] = createParticle();
                }
            });
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            updateParticles();
            particles.forEach(drawParticle);
            animationId = requestAnimationFrame(animate);
        };

        resize();
        window.addEventListener('resize', resize);
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <>
            <div className="animated-gradient" />
            <canvas
                ref={canvasRef}
                className="particles-canvas"
            />
            <style>{`
                .animated-gradient {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        125deg,
                        #0f172a 0%,
                        #581c87 50%,
                        #0f172a 100%
                    );
                    background-size: 200% 200%;
                    animation: gradientShift 40s linear infinite;
                    z-index: -1;
                }

                @keyframes gradientShift {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
                .particles-canvas {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: -1;
                    pointer-events: none;
                }
            `}</style>
        </>
    );
};