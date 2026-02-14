"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AmenParticlesProps {
    trigger: boolean;
}

export default function AmenParticles({ trigger }: AmenParticlesProps) {
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; delay: number }[]>([]);

    useEffect(() => {
        if (trigger) {
            const particleCount = 20;
            const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
                id: Date.now() + i,
                x: (Math.random() - 0.5) * 200, // Random X spread
                y: (Math.random() - 1) * 200 - 50, // Upward movement mostly
                color: Math.random() > 0.5 ? "bg-accent" : "bg-primary",
                delay: Math.random() * 0.2
            }));
            setParticles(newParticles);

            const timer = setTimeout(() => {
                setParticles([]);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [trigger]);

    if (!trigger && particles.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-50">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className={cn(
                        "absolute w-2 h-2 rounded-full opacity-0 animate-in fade-in zoom-in spin-in-180 duration-1000",
                        p.color
                    )}
                    style={{
                        transform: `translate(${p.x}px, ${p.y}px)`,
                        transition: 'transform 1s cubic-bezier(0, .9, .57, 1), opacity 1s ease-out',
                        opacity: 0,
                        animation: `particle-out 1s ease-out forwards ${p.delay}s`
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes particle-out {
                    0% {
                        opacity: 1;
                        transform: translate(0, 0) scale(0.5);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(1.5);
                    }
                }
            `}</style>
        </div>
    );
}
