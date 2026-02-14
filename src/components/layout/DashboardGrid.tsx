import { cn } from "@/lib/utils";
import React from "react";

interface DashboardGridProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export default function DashboardGrid({ children, className, ...props }: DashboardGridProps) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto pb-32 pt-24 max-w-5xl mx-auto",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// Sub-components for specific grid spans
interface GridCellProps extends React.HTMLAttributes<HTMLDivElement> {
    span?: "1" | "2" | "3" | "full";
}

export function GridCell({ children, className, span = "1", ...props }: GridCellProps) {
    const spanClass = {
        "1": "md:col-span-1",
        "2": "md:col-span-2",
        "3": "md:col-span-3",
        "full": "col-span-full",
    }[span];

    return (
        <div
            className={cn(
                "relative flex flex-col",
                spanClass,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
