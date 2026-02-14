"use client";

import { useState, useMemo } from "react";
import { format, eachDayOfInterval, endOfMonth, min, isSameMonth, parseISO, startOfMonth, getDay, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { X, ChevronLeft, Check, Trophy } from "lucide-react";
import { SmartCard } from "@/components/ui/smart-card";
import { cn } from "@/lib/utils";
import { BibleReadingPlan, UserProgress } from "@/types/bible";

interface YearlyProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    progress: UserProgress[];
    allPlans: BibleReadingPlan[];
    currentDate: string;
}

type ViewMode = 'year' | 'month';

export default function YearlyProgressModal({ isOpen, onClose, progress, allPlans, currentDate }: YearlyProgressModalProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('year');
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(currentDate));

    // Calculate yearly stats
    const yearStats = useMemo(() => {
        const stats = [];
        const yearStart = new Date(new Date(currentDate).getFullYear(), 0, 1);

        for (let i = 0; i < 12; i++) {
            const monthStart = new Date(yearStart.getFullYear(), i, 1);
            const monthEnd = endOfMonth(monthStart);
            const monthPlans = allPlans.filter(p => {
                const pDate = parseISO(p.date);
                return isSameMonth(pDate, monthStart);
            });

            const totalDays = monthPlans.length;
            const completedDays = monthPlans.filter(p =>
                progress.some(prog => prog.plan_id === p.id)
            ).length;

            const percent = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

            stats.push({
                date: monthStart,
                total: totalDays,
                completed: completedDays,
                percent
            });
        }
        return stats;
    }, [allPlans, progress, currentDate]);

    if (!isOpen) return null;

    const handleMonthClick = (monthDate: Date) => {
        setSelectedMonth(monthDate);
        setViewMode('month');
    };

    const handleBackToYear = () => {
        setViewMode('year');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />
            <SmartCard variant="elevated" className="w-[90vw] max-w-[400px] max-h-[85vh] p-0 overflow-hidden shadow-2xl relative z-10 flex flex-col">

                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-muted/40">
                    {viewMode === 'month' ? (
                        <button
                            onClick={handleBackToYear}
                            className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                            <ChevronLeft size={18} />
                            <span className="text-sm font-medium">연간 보기</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Trophy size={18} className="text-primary" />
                            <span className="font-serif font-bold text-lg">연간 읽기 현황</span>
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {viewMode === 'year' ? (
                        <div className="grid grid-cols-3 gap-3">
                            {yearStats.map((stat, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleMonthClick(stat.date)}
                                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all group"
                                >
                                    <div className="relative w-16 h-16 flex items-center justify-center">
                                        {/* Circular Progress */}
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                className="text-muted/30"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            />
                                            <path
                                                className={cn(
                                                    "transition-all duration-1000 ease-out",
                                                    stat.percent === 100 ? "text-primary" : "text-blue-500"
                                                )}
                                                strokeDasharray={`${stat.percent}, 100`}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <span className={cn(
                                            "absolute text-sm font-bold",
                                            stat.percent === 100 ? "text-primary" : "text-foreground"
                                        )}>
                                            {stat.percent}%
                                        </span>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-bold mb-0.5">{format(stat.date, "M월")}</div>
                                        <div className="text-[10px] text-muted-foreground">{stat.completed}/{stat.total}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <MonthCalendar
                            monthDate={selectedMonth}
                            allPlans={allPlans}
                            progress={progress}
                        />
                    )}
                </div>
            </SmartCard>
        </div>
    );
}

function MonthCalendar({ monthDate, allPlans, progress }: { monthDate: Date, allPlans: BibleReadingPlan[], progress: UserProgress[] }) {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate padding
    const startDay = getDay(monthStart); // 0 = Sun

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-serif font-bold text-center mb-6">{format(monthDate, "yyyy년 M월")}</h3>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                    <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`pad-${i}`} />
                ))}

                {days.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const plan = allPlans.find(p => p.date === dateStr);
                    const isCompleted = plan && progress.some(p => p.plan_id === plan.id);
                    const isFuture = day > new Date();

                    return (
                        <div
                            key={dateStr}
                            className={cn(
                                "aspect-square rounded-lg flex flex-col items-center justify-center relative border transition-colors",
                                isCompleted
                                    ? "bg-primary/10 border-primary/20 text-primary"
                                    : "bg-muted/30 border-transparent text-muted-foreground",
                                isFuture && "opacity-30"
                            )}
                        >
                            <span className={cn(
                                "text-sm",
                                isCompleted ? "font-bold" : "font-medium"
                            )}>
                                {format(day, 'd')}
                            </span>
                            {isCompleted && (
                                <div className="absolute bottom-1 right-1">
                                    <div className="bg-primary rounded-full p-0.5">
                                        <Check size={8} className="text-primary-foreground stroke-[3]" />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
