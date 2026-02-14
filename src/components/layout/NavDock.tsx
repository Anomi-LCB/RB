"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Calendar, Settings, Home, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "home" | "bible" | "streak" | "calendar" | "menu";

interface NavDockProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

const BUTTON_SIZE = 52; // px, fixed for all buttons
const PADDING = 6; // p-1.5 = 6px

export default function NavDock({ activeTab, onTabChange }: NavDockProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const tabs: { id: Tab; icon: any; label: string }[] = [
        { id: "home", icon: Home, label: "투데이" },
        { id: "streak", icon: Flame, label: "연속" },
        { id: "bible", icon: BookOpen, label: "성경" },
        { id: "calendar", icon: Calendar, label: "달력" },
        { id: "menu", icon: Settings, label: "설정" },
    ];

    const activeIndex = tabs.findIndex(t => t.id === activeTab);

    // Scroll detection
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    // Pill position: each button is BUTTON_SIZE wide, offset by PADDING
    const pillLeft = PADDING + activeIndex * BUTTON_SIZE;

    return (
        <div className={cn(
            "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out will-change-transform",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-[200%] opacity-0"
        )}>
            {/* Glass Container - Pill Shape */}
            <div className="relative flex items-center p-1.5 rounded-[999px] bg-white/80 dark:bg-black/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl">

                {/* Sliding Pill Indicator - perfectly centered */}
                <div
                    className="absolute rounded-[999px] bg-primary shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    style={{
                        top: `${PADDING}px`,
                        bottom: `${PADDING}px`,
                        left: `${pillLeft}px`,
                        width: `${BUTTON_SIZE}px`,
                    }}
                />

                {/* Tab Items - all same fixed width */}
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "relative z-10 flex flex-col items-center justify-center gap-0.5 rounded-[999px] transition-all duration-300 group select-none",
                                isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                            style={{ width: `${BUTTON_SIZE}px`, height: `${BUTTON_SIZE}px` }}
                        >
                            <Icon
                                size={isActive ? 18 : 20}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={cn(
                                    "transition-all duration-300",
                                    isActive ? "scale-100 -translate-y-0.5" : "group-hover:scale-105"
                                )}
                            />
                            {isActive && (
                                <span className="text-[8px] font-bold tracking-tight animate-in fade-in zoom-in duration-300 leading-none">
                                    {tab.label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
