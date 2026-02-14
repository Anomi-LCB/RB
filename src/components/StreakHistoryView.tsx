"use client";

import { useMemo } from "react";
import { Flame, TrendingUp, Calendar, Trophy, XCircle, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartCard } from "@/components/ui/smart-card";
import { UserProgress } from "@/types/bible";

interface StreakHistoryViewProps {
    progress: UserProgress[];
    onBack: () => void;
}

interface StreakPeriod {
    type: 'streak' | 'gap';
    startDate: string;
    endDate: string;
    days: number;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateFull(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(dateStr: string, n: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
}

function diffDays(a: string, b: string): number {
    return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export default function StreakHistoryView({ progress, onBack }: StreakHistoryViewProps) {
    const { periods, stats } = useMemo(() => {
        // Extract and sort unique dates
        const dates = Array.from(new Set(
            progress
                .map(p => p.reading_plan?.date)
                .filter((d): d is string => !!d)
        )).sort();

        if (dates.length === 0) {
            return { periods: [] as StreakPeriod[], stats: { current: 0, best: 0, total: 0, avgStreak: 0 } };
        }

        const periods: StreakPeriod[] = [];
        let streakStart = dates[0];
        let prevDate = dates[0];

        for (let i = 1; i < dates.length; i++) {
            const gap = diffDays(prevDate, dates[i]);

            if (gap === 1) {
                // Continue streak
                prevDate = dates[i];
            } else {
                // End current streak
                const streakDays = diffDays(streakStart, prevDate) + 1;
                periods.push({
                    type: 'streak',
                    startDate: streakStart,
                    endDate: prevDate,
                    days: streakDays,
                });

                // Add gap
                if (gap > 1) {
                    periods.push({
                        type: 'gap',
                        startDate: addDays(prevDate, 1),
                        endDate: addDays(dates[i], -1),
                        days: gap - 1,
                    });
                }

                streakStart = dates[i];
                prevDate = dates[i];
            }
        }

        // Final streak
        const finalDays = diffDays(streakStart, prevDate) + 1;
        periods.push({
            type: 'streak',
            startDate: streakStart,
            endDate: prevDate,
            days: finalDays,
        });

        // Calculate stats
        const streakPeriods = periods.filter(p => p.type === 'streak');
        const best = Math.max(...streakPeriods.map(p => p.days));
        const avgStreak = streakPeriods.length > 0
            ? Math.round(streakPeriods.reduce((a, p) => a + p.days, 0) / streakPeriods.length)
            : 0;

        // Current streak (last period must be a streak ending today or yesterday)
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = addDays(today, -1);
        const lastPeriod = periods[periods.length - 1];
        const current = (lastPeriod.type === 'streak' && (lastPeriod.endDate === today || lastPeriod.endDate === yesterday))
            ? lastPeriod.days
            : 0;

        return {
            periods: periods.reverse(), // Most recent first
            stats: { current, best, total: dates.length, avgStreak }
        };
    }, [progress]);

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 px-2">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/10">
                        <Flame size={22} className="text-orange-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-serif font-bold">연속 읽기 기록</h2>
                        <p className="text-xs text-muted-foreground">나의 성경 읽기 여정을 돌아보세요</p>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard icon={Flame} iconColor="text-orange-500" iconBg="bg-orange-500/10" label="현재 연속" value={`${stats.current}일`} />
                <StatCard icon={Trophy} iconColor="text-amber-500" iconBg="bg-amber-500/10" label="최장 연속" value={`${stats.best}일`} highlight />
                <StatCard icon={Calendar} iconColor="text-blue-500" iconBg="bg-blue-500/10" label="총 읽기" value={`${stats.total}일`} />
                <StatCard icon={TrendingUp} iconColor="text-emerald-500" iconBg="bg-emerald-500/10" label="평균 연속" value={`${stats.avgStreak}일`} />
            </div>

            {/* Timeline */}
            <div className="space-y-3">
                <h3 className="px-2 text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> 타임라인
                </h3>

                {periods.length === 0 ? (
                    <SmartCard variant="elevated" className="text-center py-12">
                        <Flame size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">아직 읽기 기록이 없어요</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">오늘부터 시작해 볼까요? 🙏</p>
                    </SmartCard>
                ) : (
                    <div className="space-y-0">
                        {periods.map((period, i) => (
                            <div key={i} className="relative">
                                {/* Timeline connector */}
                                {i < periods.length - 1 && (
                                    <div className="absolute left-[19px] top-[40px] bottom-0 w-[2px] bg-border/50" />
                                )}

                                <div className="flex items-start gap-4 py-2">
                                    {/* Timeline dot */}
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10",
                                        period.type === 'streak'
                                            ? period.days >= 7
                                                ? "bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20"
                                                : "bg-primary/10"
                                            : "bg-muted"
                                    )}>
                                        {period.type === 'streak' ? (
                                            period.days >= 7
                                                ? <Flame size={18} className="text-white" />
                                                : <Flame size={16} className="text-primary" />
                                        ) : (
                                            <XCircle size={16} className="text-muted-foreground/50" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <SmartCard
                                        variant="elevated"
                                        className={cn(
                                            "flex-1 border transition-all",
                                            period.type === 'streak'
                                                ? period.days >= 7
                                                    ? "border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-transparent dark:border-orange-500/30"
                                                    : "border-border/50 dark:border-white/10"
                                                : "border-border/30 bg-muted/20 dark:border-white/5"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                {period.type === 'streak' ? (
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn(
                                                                "text-lg font-display font-bold",
                                                                period.days >= 7 ? "text-orange-500" : "text-foreground"
                                                            )}>
                                                                {period.days}일 연속 🔥
                                                            </span>
                                                            {period.days >= 30 && (
                                                                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-600 rounded-full">
                                                                    대단해요!
                                                                </span>
                                                            )}
                                                            {period.days >= 7 && period.days < 30 && (
                                                                <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-500/10 text-orange-600 rounded-full">
                                                                    좋아요!
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground mt-1">
                                                            {formatDateFull(period.startDate)} → {formatDateFull(period.endDate)}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-sm font-medium text-muted-foreground">
                                                            {period.days}일 쉬었어요
                                                        </span>
                                                        <p className="text-[11px] text-muted-foreground/60 mt-1">
                                                            {formatDateFull(period.startDate)} → {formatDateFull(period.endDate)}
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-muted-foreground/50">
                                                    {formatDate(period.startDate)}~{formatDate(period.endDate)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Streak bar visualization */}
                                        {period.type === 'streak' && (
                                            <div className="mt-3 flex gap-[2px]">
                                                {Array.from({ length: Math.min(period.days, 60) }).map((_, j) => (
                                                    <div
                                                        key={j}
                                                        className={cn(
                                                            "h-2 flex-1 rounded-sm transition-all",
                                                            period.days >= 7
                                                                ? "bg-gradient-to-t from-orange-500 to-amber-400"
                                                                : "bg-primary/40"
                                                        )}
                                                        style={{ animationDelay: `${j * 20}ms` }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </SmartCard>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="pb-20" />
        </div>
    );
}

function StatCard({ icon: Icon, iconColor, iconBg, label, value, highlight }: {
    icon: any; iconColor: string; iconBg: string; label: string; value: string; highlight?: boolean;
}) {
    return (
        <SmartCard variant="elevated" className={cn(
            "border dark:border-white/10",
            highlight && "border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent dark:border-amber-500/30"
        )}>
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl", iconBg)}>
                    <Icon size={16} className={iconColor} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
                    <p className="text-xl font-display font-bold">{value}</p>
                </div>
            </div>
        </SmartCard>
    );
}
