import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import React from "react";

const smartCardVariants = cva(
    "relative group transition-all duration-300 ease-out border overflow-hidden",
    {
        variants: {
            variant: {
                default: "bg-card text-card-foreground border-border/50",
                elevated: "bg-card shadow-soft hover:shadow-lg border-border/30 hover:-translate-y-1",
                ghost: "bg-transparent border-transparent hover:bg-secondary/30",
                outline: "bg-transparent border-border hover:bg-secondary/10",
                active: "bg-primary/5 border-primary/20",
            },
            padding: {
                none: "p-0",
                sm: "p-4",
                md: "p-6",
                lg: "p-8",
            },
            radius: {
                none: "rounded-none",
                md: "rounded-xl",
                lg: "rounded-2xl",
                xl: "rounded-3xl",
            }
        },
        defaultVariants: {
            variant: "default",
            padding: "md",
            radius: "lg",
        },
    }
);

export interface SmartCardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof smartCardVariants> {
    loading?: boolean;
    interactive?: boolean;
}

const SmartCard = React.forwardRef<HTMLDivElement, SmartCardProps>(
    ({ className, variant, padding, radius, loading, interactive, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    smartCardVariants({ variant, padding, radius, className }),
                    interactive && "cursor-pointer hover:border-primary/30 active:scale-[0.98]",
                    loading && "opacity-70 pointer-events-none"
                )}
                {...props}
            >
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[2px] z-20">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                )}
                <div className={cn("relative z-10", loading && "blur-[1px]")}>{children}</div>

                {/* Shine effect for interactive cards */}
                {interactive && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-5 transition-opacity duration-500 pointer-events-none bg-gradient-to-tr from-white via-transparent to-transparent" />
                )}
            </div>
        );
    }
);
SmartCard.displayName = "SmartCard";

export { SmartCard, smartCardVariants };
