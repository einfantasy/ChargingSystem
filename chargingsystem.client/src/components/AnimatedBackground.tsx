import React, { useEffect, useRef } from 'react';

interface Wave {
    amplitude: number;
    frequency: number;
    speed: number;
    color: string;
    yOffset: number;
}

export const AnimatedBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        const waves: Wave[] = [
            { amplitude: 30, frequency: 0.003, speed: 0.008, color: 'rgba(88, 28, 135, 0.15)', yOffset: 0.55 },
            { amplitude: 25, frequency: 0.004, speed: 0.012, color: 'rgba(88, 28, 135, 0.2)', yOffset: 0.6 },
            { amplitude: 20, frequency: 0.005, speed: 0.015, color: 'rgba(88, 28, 135, 0.25)', yOffset: 0.65 },
            { amplitude: 15, frequency: 0.006, speed: 0.018, color: 'rgba(170, 59, 255, 0.15)', yOffset: 0.7 },
            { amplitude: 35, frequency: 0.002, speed: 0.006, color: 'rgba(170, 59, 255, 0.1)', yOffset: 0.5 },
        ];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const drawWave = (wave: Wave, offsetY: number) => {
            ctx.beginPath();
            const baseY = canvas.height * wave.yOffset + offsetY;

            ctx.moveTo(0, canvas.height);

            for (let x = 0; x <= canvas.width; x += 2) {
                const y = baseY + Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude
                    + Math.sin(x * wave.frequency * 1.5 + time * wave.speed * 0.7) * wave.amplitude * 0.3;
                ctx.lineTo(x, y);
            }

            ctx.lineTo(canvas.width, canvas.height);
            ctx.closePath();
            ctx.fillStyle = wave.color;
            ctx.fill();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            time += 1;

            for (let i = 0; i < waves.length; i++) {
                drawWave(waves[i], Math.sin(time * 0.003 + i) * 5);
            }

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
                className="wave-canvas"
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
                .wave-canvas {
                    position: fixed;
                    bottom: 0;
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