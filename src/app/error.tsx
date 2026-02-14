"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global error caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
            <div className="max-w-md w-full bg-card border border-destructive/20 rounded-[2rem] p-8 shadow-2xl text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-black tracking-tight">오류가 발생했습니다</h2>
                    <p className="text-sm text-muted-foreground break-keep leading-relaxed">
                        앱을 실행하는 도중 문제가 발생했습니다.<br />
                        잠시 후 다시 시도해주시거나, 문제가 지속되면 관리자에게 문의해주세요.
                    </p>
                    {error.digest && (
                        <p className="text-xs font-mono text-muted-foreground/50 bg-secondary/50 p-2 rounded-lg break-all">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>

                <button
                    onClick={reset}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                    <RefreshCw size={18} />
                    다시 시도하기
                </button>
            </div>
        </div>
    );
}
