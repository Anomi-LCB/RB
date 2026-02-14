"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Calendar, Settings, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "../ThemeToggle";

interface MobileAppShellProps {
    children: React.ReactNode;
    currentDate: string;
}

type Tab = "read" | "calendar" | "stats" | "settings";

export default function MobileAppShell({ children, currentDate }: MobileAppShellProps) {
    const [activeTab, setActiveTab] = useState<Tab>("read");
    const [scrolled, setScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Header logic
            setScrolled(currentScrollY > 10);

            // Bottom Nav logic
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false); // Scrolling down - hide
            } else {
                setIsVisible(true);  // Scrolling up - show
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const NavItem = ({ tab, icon: Icon, label }: { tab: Tab; icon: any; label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300",
                activeTab === tab
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground active:scale-95"
            )}
        >
            <div className={cn(
                "p-1.5 rounded-2xl transition-all duration-300",
                activeTab === tab ? "bg-primary/10 translate-y-[-2px]" : "bg-transparent"
            )}>
                <Icon
                    size={22}
                    strokeWidth={activeTab === tab ? 2.5 : 2}
                    className={cn("transition-transform duration-300", activeTab === tab ? "scale-110" : "")}
                />
            </div>
            <span className={cn(
                "text-[10px] font-bold tracking-tight transition-all duration-300",
                activeTab === tab ? "opacity-100 translate-y-[-2px]" : "opacity-70"
            )}>
                {label}
            </span>
        </button>
    );

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">

            {/* Top Bar - Dynamic Glassmorphism */}
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-500 will-change-transform border-b",
                    scrolled
                        ? "bg-background/80 backdrop-blur-xl border-border/40 py-3 shadow-soft"
                        : "bg-background/0 border-transparent py-5"
                )}
            >
                <div className="max-w-md mx-auto px-6 flex items-center justify-between">
                    <div className="flex flex-col">
                        <h1 className={cn(
                            "font-serif font-black text-foreground transition-all duration-500",
                            scrolled ? "text-lg tracking-tight" : "text-2xl tracking-tighter"
                        )}>
                            성경 365
                        </h1>
                        <p className={cn(
                            "text-xs font-bold text-muted-foreground overflow-hidden transition-all duration-500",
                            scrolled ? "h-0 opacity-0" : "h-auto opacity-100 mt-1"
                        )}>
                            {currentDate}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow pt-24 pb-32 px-6 max-w-md mx-auto w-full overflow-x-hidden">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation - scroll aware */}
            <nav
                className={cn(
                    "fixed bottom-6 left-6 right-6 z-50 transition-all duration-500 ease-in-out transform",
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-[200%] opacity-0"
                )}
            >
                <div className="max-w-md mx-auto h-16 bg-background/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2rem] shadow-2xl flex items-center justify-around px-2 relative overflow-hidden">
                    {/* Glass Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />

                    <NavItem tab="read" icon={BookOpen} label="Read" />
                    <NavItem tab="calendar" icon={Calendar} label="Plan" />
                    <NavItem tab="stats" icon={BarChart2} label="Stats" />
                    <NavItem tab="settings" icon={Settings} label="Menu" />
                </div>
            </nav>

            {/* Safe Area Spacer for Bottom Nav */}
            <div className="h-6 w-full" />
        </div>
    );
}
