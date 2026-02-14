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

    // ?뚮옖??諛붾뚯뼱??濡쒖뺄 ?곹깭媛 ?좎??섎뒗 臾몄젣瑜?諛⑹??섍린 ?꾪빐 
    // initialIsCompleted媛 諛붾뚮㈃ ?곹깭瑜??숆린?뷀빀?덈떎.
    useEffect(() => {
        setIsCompleted(initialIsCompleted);
    }, [initialIsCompleted]);

    const handleToggle = async (planId: number) => {
        if (isCompleted) {
            // ?꾨즺 痍⑥냼
            const { error } = await supabase
                .from("user_progress")
                .delete()
                .eq("user_id", userId)
                .eq("plan_id", planId);

            if (!error) {
                setIsCompleted(false);
                router.refresh(); // 遺紐??섏씠吏???듦퀎 ?숆린?붾? ?꾪빐 ?덈줈怨좎묠
            }
        } else {
            // ?꾨즺 泥댄겕
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
