"use client";

import { BibleReadingPlan } from "@/types/bible";
import { CheckCircle2, Circle, Calendar, Check } from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BibleCardProps {
    plan: BibleReadingPlan;
    isCompleted: boolean;
    onToggle: (id: number) => void;
}

export default function BibleCard({ plan, isCompleted, onToggle }: BibleCardProps) {
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        await onToggle(plan.id);
        setLoading(false);
    };

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-[2.5rem] p-6 transition-all duration-500",
                "border bg-white shadow-xl shadow-slate-200/30",
                isCompleted ? "border-emerald-100/50 shadow-none" : "border-slate-100"
            )}
        >
            <div className="flex flex-col gap-5 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                        <Calendar size={10} className="text-[#4E56D1]/60" strokeWidth={2.5} />
                        <span className="text-[9px] font-bold text-[#4E56D1] uppercase tracking-wider">Plan Day {plan.day_of_year}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className={cn(
                        "text-2xl font-bold tracking-tight leading-snug transition-all duration-500",
                        isCompleted ? "text-slate-300 line-through decoration-slate-200 decoration-1" : "text-slate-800"
                    )}>
                        {plan.title}
                    </h2>
                    <div className="space-y-3 pt-4 border-t border-slate-50">
                        {/* 1번째 줄: 분류 */}
                        {plan.category ? (
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-[10px] font-bold text-[#4E56D1] border border-indigo-100/50">
                                    {plan.category}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-400 border border-slate-100">
                                    성경 분류 정보 준비 중
                                </span>
                            </div>
                        )}

                        {/* 2번째 줄: 요약 */}
                        <div className="flex gap-2">
                            <span className="text-[12px] mt-0.5">💡</span>
                            <p className={cn(
                                "text-[12px] font-bold leading-relaxed tracking-tight flex flex-wrap gap-x-1.5",
                                isCompleted ? "text-slate-300" : "text-[#4E56D1]"
                            )}>
                                {plan.summary ?
                                    plan.summary.split(' ').map((tag, i) => (
                                        <span key={i} className={isCompleted ? "" : "hover:text-[#3B41C5] transition-colors"}>
                                            {tag}
                                        </span>
                                    ))
                                    : "#키워드 #요약 #준비중"
                                }
                            </p>
                        </div>

                        {/* 3번째 줄: 소요시간 */}
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-[12px]">⏳</span>
                            <p className="text-[11px] font-semibold tracking-wide">
                                {plan.reading_time || "오늘의 읽기, 약 10분 소요 예정"}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleToggle}
                    disabled={loading}
                    className={cn(
                        "mt-1 flex items-center justify-center gap-3 w-full py-4.5 rounded-[1.4rem] font-bold text-[13.5px] transition-all duration-300 active:scale-[0.97] disabled:opacity-50 group",
                        isCompleted
                            ? "bg-[#3DAA9C] text-white hover:bg-[#34968a] shadow-lg shadow-teal-50"
                            : "bg-[#4E56D1] text-white hover:bg-[#3B41C5] shadow-xl shadow-indigo-100/40"
                    )}
                >
                    {loading ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : isCompleted ? (
                        <>
                            <Check size={16} strokeWidth={3} />
                            <span>기록 완료</span>
                        </>
                    ) : (
                        <>
                            <Circle size={16} strokeWidth={2.5} />
                            <span>성경 읽기 완료</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
