"use client";

import { useState, useEffect } from "react";
import BibleCard from "./BibleCard";
import { BibleReadingPlan } from "@/types/bible";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

interface BibleCardWrapperProps {
    initialPlan: BibleReadingPlan;
    initialIsCompleted: boolean;
    userId: string;
}

export default function BibleCardWrapper({
    initialPlan,
    initialIsCompleted,
    userId,
}: BibleCardWrapperProps) {
    const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
    const supabase = createClient();
    const router = useRouter();

    // 플랜이 바뀌어도 로컬 상태가 유지되는 문제를 방지하기 위해 
    // initialIsCompleted가 바뀌면 상태를 동기화합니다.
    useEffect(() => {
        setIsCompleted(initialIsCompleted);
    }, [initialIsCompleted]);

    const handleToggle = async (planId: number) => {
        if (isCompleted) {
            // 완료 취소
            const { error } = await supabase
                .from("user_progress")
                .delete()
                .eq("user_id", userId)
                .eq("plan_id", planId);

            if (!error) {
                setIsCompleted(false);
                router.refresh(); // 부모 페이지의 통계 동기화를 위해 새로고침
            }
        } else {
            // 완료 체크
            const { error } = await supabase
                .from("user_progress")
                .insert({
                    user_id: userId,
                    plan_id: planId,
                    is_completed: true,
                });

            if (!error) {
                setIsCompleted(true);
                router.refresh();
            }
        }
    };

    return (
        <BibleCard
            plan={initialPlan}
            isCompleted={isCompleted}
            onToggle={handleToggle}
        />
    );
}
