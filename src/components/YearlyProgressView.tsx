"use client";

import { useState, useMemo } from "react";
import { format, endOfMonth, isSameMonth, parseISO, startOfMonth, getDay, eachDayOfInterval } from "date-fns";
import { ChevronLeft, Check, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { BibleReadingPlan, UserProgress } from "@/types/bible";
import { SmartCard } from "@/components/ui/smart-card";

interface YearlyProgressViewProps {
    progress: UserProgress[];
    allPlans: BibleReadingPlan[];
    currentDate: string;
}

type ViewMode = 'year' | 'month';

export default function YearlyProgressView({ progress, allPlans, currentDate }: YearlyProgressViewProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('year');
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(currentDate));

    // Calculate yearly stats
    const yearStats = useMemo(() => {
        const stats = [];
        const yearStart = new Date(new Date(currentDate).getFullYear(), 0, 1);

        for (let i = 0; i < 12; i++) {
            const monthStart = new Date(yearStart.getFullYear(), i, 1);
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

    const handleMonthClick = (monthDate: Date) => {
        setSelectedMonth(monthDate);
        setViewMode('month');
    };

    const handleBackToYear = () => {
        setViewMode('year');
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-6 px-2">
                {viewMode === 'month' ? (
                    <button
                        onClick={handleBackToYear}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <div className="p-2 rounded-full bg-muted/50 group-hover:bg-muted transition-colors">
                            <ChevronLeft size={18} />
                        </div>
                        <span className="text-lg font-bold">연간 보기</span>
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                            <Trophy size={20} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-bold">나의 기록</h2>
                            <p className="text-xs text-muted-foreground">매일의 읽기를 통해 성장하세요</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <SmartCard variant="elevated" className="bg-card/50 backdrop-blur-sm border border-border/50 dark:border-white/15">
                <div className="p-4">
                    {viewMode === 'year' ? (
                        <div className="grid grid-cols-3 gap-3 sm:gap-4">
                            {yearStats.map((stat, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleMonthClick(stat.date)}
                                    className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-border/30 dark:border-white/10 bg-background/50 hover:bg-muted/50 hover:border-primary/20 dark:hover:border-primary/40 transition-all duration-300 group shadow-sm hover:shadow-md"
                                >
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                                        {/* Circular Progress */}
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                className="text-muted/20"
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
                                        <div className="absolute flex flex-col items-center justify-center">
                                            <span className={cn(
                                                "text-sm font-bold leading-none",
                                                stat.percent === 100 ? "text-primary" : "text-foreground"
                                            )}>
                                                {stat.percent}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-display font-bold mb-0.5 group-hover:text-primary transition-colors">{format(stat.date, "M월")}</div>
                                        <div className="text-[10px] text-muted-foreground">{stat.completed}/{stat.total}일</div>
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
            <h3 className="text-2xl font-serif font-bold text-center mb-6 text-foreground">{format(monthDate, "yyyy년 M월")}</h3>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                    <div key={d} className={cn(
                        "text-center text-xs font-semibold py-2",
                        i === 0 ? "text-destructive" : "text-muted-foreground"
                    )}>{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`pad-${i}`} />
                ))}

                {days.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const plan = allPlans.find(p => p.date === dateStr);
                    const isCompleted = plan && progress.some(p => p.plan_id === plan.id);
                    const isFuture = day > new Date();
                    const isToday = isSameDay(day, new Date());


                    function isSameDay(d1: Date, d2: Date) {
                        return d1.getFullYear() === d2.getFullYear() &&
                            d1.getMonth() === d2.getMonth() &&
                            d1.getDate() === d2.getDate();
                    }

                    return (
                        <div
                            key={dateStr}
                            className={cn(
                                "aspect-square rounded-xl flex flex-col items-center justify-center relative border transition-all duration-300",
                                isCompleted
                                    ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                                    : "bg-muted/30 border-transparent text-muted-foreground",
                                isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
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
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                                    <div className="bg-primary/90 rounded-full p-0.5 animate-in zoom-in duration-300 shadow-sm">
                                        <Check size={8} className="text-primary-foreground stroke-[4]" />
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
