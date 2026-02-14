import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import React from "react";

const glassPanelVariants = cva(
    "relative overflow-hidden border transition-all duration-300",
    {
        variants: {
            intensity: {
                low: "bg-background/60 backdrop-blur-md border-white/20",
                medium: "bg-background/80 backdrop-blur-xl border-white/30",
                high: "bg-background/95 backdrop-blur-3xl border-white/40",
                pure: "bg-white/5 dark:bg-black/20 backdrop-blur-lg border-white/10", // Ultra minimal
            },
            border: {
                none: "border-none",
                subtle: "border-white/20 dark:border-white/10",
                highlight: "border-primary/20 dark:border-primary/40",
            },
            radius: {
                none: "rounded-none",
                sm: "rounded-lg",
                md: "rounded-2xl",
                full: "rounded-full",
            },
            shadow: {
                none: "shadow-none",
                sm: "shadow-sm",
                md: "shadow-lg shadow-black/5 dark:shadow-black/20",
                glow: "shadow-gold",
            }
        },
        defaultVariants: {
            intensity: "medium",
            border: "subtle",
            radius: "md",
            shadow: "sm",
        },
    }
);

export interface GlassPanelProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassPanelVariants> {
    asChild?: boolean;
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
    ({ className, intensity, border, radius, shadow, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(glassPanelVariants({ intensity, border, radius, shadow, className }))}
                {...props}
            />
        );
    }
);
GlassPanel.displayName = "GlassPanel";

export { GlassPanel, glassPanelVariants };
