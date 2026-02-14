"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Moon, Sun, Trash2, Download, Upload, BookOpen,
    ChevronRight, Youtube, Clock, Type,
    Bell, Share2, Award, Heart, Sparkles,
    Volume2, Settings as SettingsIcon, AlertTriangle, FileJson
} from "lucide-react";
import { useTheme } from "next-themes";
import { SmartCard } from "@/components/ui/smart-card";
import { cn } from "@/lib/utils";

// --- Toggle Switch ---
function ToggleSwitch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (c: boolean) => void }) {
    return (
        <button
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "w-12 h-7 rounded-full transition-all duration-300 relative shadow-inner",
                checked
                    ? "bg-gradient-to-r from-primary to-primary/80"
                    : "bg-muted dark:bg-muted/50"
            )}
        >
            <div className={cn(
                "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center",
                checked ? "left-[22px]" : "left-0.5"
            )}>
                {checked ? <Sun size={12} className="text-primary" /> : <Moon size={12} className="text-muted-foreground" />}
            </div>
        </button>
    );
}

// --- Option Selector ---
function OptionSelector({ options, value, onChange }: {
    options: { id: string; label: string; icon?: React.ReactNode }[];
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex gap-1.5 p-1 bg-muted/30 rounded-xl">
            {options.map(opt => (
                <button
                    key={opt.id}
                    onClick={() => onChange(opt.id)}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300",
                        value === opt.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                >
                    {opt.icon}
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

export default function SettingsView() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);
    const [fontSize, setFontSize] = useState(() =>
        typeof window !== 'undefined' ? localStorage.getItem('bible_font_size') || 'medium' : 'medium'
    );
    const [autoPlay, setAutoPlay] = useState(() =>
        typeof window !== 'undefined' ? localStorage.getItem('bible_autoplay') === 'true' : false
    );
    const [dailyVerse, setDailyVerse] = useState(() =>
        typeof window !== 'undefined' ? localStorage.getItem('bible_daily_verse') !== 'false' : true
    );
    const [autoBackup, setAutoBackup] = useState(() =>
        typeof window !== 'undefined' ? localStorage.getItem('bible_auto_backup') !== 'false' : true
    );

    useEffect(() => setMounted(true), []);

    // Stats from localStorage
    const stats = useMemo(() => {
        if (typeof window === 'undefined') return { total: 0, streak: 0, startDate: '' };
        try {
            const data = localStorage.getItem('guest_bible_progress');
            const parsed = data ? JSON.parse(data) : [];
            const total = Array.isArray(parsed) ? parsed.length : 0;
            return { total, streak: 0, startDate: '2026.01.01' };
        } catch {
            return { total: 0, streak: 0, startDate: '' };
        }
    }, []);

    const handleFontSizeChange = (size: string) => {
        setFontSize(size);
        localStorage.setItem('bible_font_size', size);
    };

    const handleAutoPlayChange = (val: boolean) => {
        setAutoPlay(val);
        localStorage.setItem('bible_autoplay', String(val));
    };

    const handleDailyVerseChange = (val: boolean) => {
        setDailyVerse(val);
        localStorage.setItem('bible_daily_verse', String(val));
    };

    const handleAutoBackupChange = (val: boolean) => {
        setAutoBackup(val);
        localStorage.setItem('bible_auto_backup', String(val));
    };

    const handleReset = () => {
        if (confirmReset) {
            localStorage.removeItem('guest_bible_progress');
            window.location.reload();
        } else {
            setConfirmReset(true);
            setTimeout(() => setConfirmReset(false), 3000);
        }
    };

    const handleExport = () => {
        const data = localStorage.getItem('guest_bible_progress');
        if (!data) return;
        const blob = new Blob([JSON.stringify({ progress: JSON.parse(data), exportDate: new Date().toISOString(), version: "1.2.0" }, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `성경365-백업-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        document.getElementById('import-file')?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (json.progress && Array.isArray(json.progress)) {
                    if (confirm(`📅 ${json.exportDate?.slice(0, 10) || '불명'}의 데이터로 복원하시겠습니까?\n총 ${json.progress.length}일의 읽기 기록이 있습니다.`)) {
                        localStorage.setItem('guest_bible_progress', JSON.stringify(json.progress));
                        alert("✅ 복원이 완료되었습니다.");
                        window.location.reload();
                    }
                } else {
                    alert("❌ 올바른 백업 파일이 아닙니다.");
                }
            } catch (err) {
                alert("❌ 파일 읽기 실패: " + err);
            }
        };
        reader.readAsText(file);
    };

    const handleShare = async () => {
        const text = `📖 성경 365 읽기 진행률: ${stats.total}일 완료! 함께 성경을 읽어요 🙏`;
        if (navigator.share) {
            await navigator.share({ title: '성경 365', text });
        } else {
            await navigator.clipboard.writeText(text);
            alert('📋 클립보드에 복사되었습니다!');
        }
    };

    if (!mounted) return null;

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3 px-2">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                    <SettingsIcon size={22} className="text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-serif font-bold">설정</h2>
                    <p className="text-xs text-muted-foreground">나만의 읽기 환경을 만드세요</p>
                </div>
            </div>

            {/* === My Journey Stats Banner === */}
            <SmartCard variant="elevated" className="bg-gradient-to-br from-primary/5 via-background to-primary/5 border border-primary/10 dark:border-primary/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Award size={24} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">나의 여정</p>
                            <p className="text-xs text-muted-foreground">{stats.startDate}부터 시작</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-display font-bold text-primary">{stats.total}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">일 완료</p>
                    </div>
                </div>
            </SmartCard>

            {/* === Appearance === */}
            <Section title="화면 설정" icon={<Sparkles size={14} />}>
                <SettingRow
                    icon={resolvedTheme === 'dark' ? Moon : Sun}
                    iconColor="text-amber-500"
                    iconBg="bg-amber-500/10"
                    label="다크 모드"
                    description="눈의 피로를 줄여줍니다"
                    action={
                        <ToggleSwitch
                            checked={resolvedTheme === 'dark'}
                            onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')}
                        />
                    }
                />
                <div className="px-4 pb-4">
                    <p className="text-xs font-bold text-muted-foreground mb-2.5 flex items-center gap-1.5">
                        <Type size={12} /> 글씨 크기
                    </p>
                    <OptionSelector
                        options={[
                            { id: 'small', label: '작게' },
                            { id: 'medium', label: '보통' },
                            { id: 'large', label: '크게' },
                        ]}
                        value={fontSize}
                        onChange={handleFontSizeChange}
                    />
                </div>
            </Section>

            {/* === Reading Experience === */}
            <Section title="읽기 환경" icon={<BookOpen size={14} />}>
                <SettingRow
                    icon={Volume2}
                    iconColor="text-violet-500"
                    iconBg="bg-violet-500/10"
                    label="영상 자동 재생"
                    description="오늘의 읽기에서 영상을 자동 재생합니다"
                    action={
                        <ToggleSwitch checked={autoPlay} onCheckedChange={handleAutoPlayChange} />
                    }
                />
                <SettingRow
                    icon={Heart}
                    iconColor="text-rose-500"
                    iconBg="bg-rose-500/10"
                    label="격려 메시지"
                    description="매일 새로운 격려의 말씀을 표시합니다"
                    action={
                        <ToggleSwitch checked={dailyVerse} onCheckedChange={handleDailyVerseChange} />
                    }
                />
            </Section>

            {/* === Share & Community === */}
            <Section title="공유 및 연결" icon={<Share2 size={14} />}>
                <SettingRow
                    icon={Share2}
                    iconColor="text-blue-500"
                    iconBg="bg-blue-500/10"
                    label="진행률 공유하기"
                    description="나의 성경 읽기 여정을 공유합니다"
                    onClick={handleShare}
                />
                <SettingRow
                    icon={Youtube}
                    iconColor="text-red-500"
                    iconBg="bg-red-500/10"
                    label="공동체 성경 읽기 (구약)"
                    description="유튜브 채널로 이동합니다"
                    externalLink="https://www.youtube.com/playlist?list=PLVcVykBcFZTRw1ZxIhIQ9uuAU6lU_PvDB"
                />
                <SettingRow
                    icon={Youtube}
                    iconColor="text-red-500"
                    iconBg="bg-red-500/10"
                    label="공동체 성경 읽기 (신약)"
                    description="유튜브 채널로 이동합니다"
                    externalLink="https://www.youtube.com/playlist?list=PLVcVykBcFZTSM0ueQRAzrlRw42mmaUL6U"
                />
            </Section>

            {/* === Data & Management === */}
            <Section title="데이터 관리" icon={<Download size={14} />}>
                <SettingRow
                    icon={Download}
                    iconColor="text-emerald-500"
                    iconBg="bg-emerald-500/10"
                    label="데이터 백업"
                    description="진행 상황을 파일로 저장합니다"
                    onClick={handleExport}
                />
                <SettingRow
                    icon={Upload}
                    iconColor="text-blue-500"
                    iconBg="bg-blue-500/10"
                    label="데이터 복원"
                    description="저장된 파일을 불러옵니다"
                    onClick={handleImportClick}
                />
                <input
                    type="file"
                    id="import-file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <SettingRow
                    icon={Bell}
                    iconColor="text-orange-500"
                    iconBg="bg-orange-500/10"
                    label="자동 백업 알림"
                    description="30일마다 백업을 알립니다"
                    action={
                        <ToggleSwitch checked={autoBackup} onCheckedChange={handleAutoBackupChange} />
                    }
                />
                <SettingRow
                    icon={Trash2}
                    iconColor="text-destructive"
                    iconBg="bg-destructive/10"
                    label="데이터 초기화"
                    description="모든 읽기 기록이 삭제됩니다"
                    destructive
                    action={
                        <button
                            onClick={handleReset}
                            className={cn(
                                "px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300",
                                confirmReset
                                    ? "bg-destructive text-destructive-foreground animate-pulse shadow-lg shadow-destructive/30"
                                    : "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            )}
                        >
                            {confirmReset ? "⚠ 정말 삭제?" : "초기화"}
                        </button>
                    }
                />
            </Section>

            {/* === Footer === */}
            <div className="text-center pb-8 space-y-2">
                <p className="text-xs text-muted-foreground/60 font-medium">성경 365 · v1.2.0</p>
                <p className="text-[10px] text-muted-foreground/40">Premium Edition</p>
                <p className="text-[10px] text-muted-foreground/30 italic">
                    "모든 성경은 하나님의 감동으로 된 것으로" — 딤후 3:16
                </p>
            </div>
        </div>
    );
}

// --- Section Component ---
function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h3 className="px-2 text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                {icon} {title}
            </h3>
            <SmartCard
                variant="elevated"
                padding="none"
                className="bg-card/50 backdrop-blur-sm border border-border/50 dark:border-white/10 overflow-hidden divide-y divide-border/30 dark:divide-white/5"
            >
                {children}
            </SmartCard>
        </div>
    );
}

// --- Setting Row Component ---
function SettingRow({
    icon: Icon,
    iconColor = "text-primary",
    iconBg = "bg-primary/10",
    label,
    description,
    action,
    onClick,
    externalLink,
    destructive
}: {
    icon: any;
    iconColor?: string;
    iconBg?: string;
    label: string;
    description?: string;
    action?: React.ReactNode;
    onClick?: () => void;
    externalLink?: string;
    destructive?: boolean;
}) {
    const isClickable = onClick || externalLink;

    return (
        <div
            className={cn(
                "flex items-center justify-between px-4 py-3.5 transition-colors",
                isClickable && "hover:bg-muted/30 cursor-pointer active:bg-muted/50"
            )}
            onClick={() => {
                if (onClick) onClick();
                if (externalLink) window.open(externalLink, '_blank');
            }}
        >
            <div className="flex items-center gap-3.5 min-w-0">
                <div className={cn("p-2 rounded-xl shrink-0", iconBg)}>
                    <Icon size={16} className={iconColor} />
                </div>
                <div className="min-w-0">
                    <p className={cn(
                        "text-sm font-semibold truncate",
                        destructive ? "text-destructive" : "text-foreground"
                    )}>{label}</p>
                    {description && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{description}</p>
                    )}
                </div>
            </div>
            <div className="shrink-0 ml-3">
                {action || (isClickable && <ChevronRight size={16} className="text-muted-foreground/50" />)}
            </div>
        </div>
    );
}
