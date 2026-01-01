"use client";

import { createClient } from "@/lib/supabase-client";

export async function signInWithGoogle() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    });
    if (error) throw error;
}

export async function signInWithKakao() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });
    if (error) throw error;
}

export async function signInWithPhone(phone: string) {
    const supabase = createClient();
    // 한국 국가번호 +82 처리 (하이픈 제거 및 형식 통일)
    const cleanPhone = phone.replace(/-/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? `+82${cleanPhone.slice(1)}` : cleanPhone;

    const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
            shouldCreateUser: true,
        }
    });
    if (error) throw error;
}

export async function verifyOTP(phone: string, token: string) {
    const supabase = createClient();
    const cleanPhone = phone.replace(/-/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? `+82${cleanPhone.slice(1)}` : cleanPhone;

    const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms',
    });
    if (error) throw error;

    // 로그인 성공 시 메인으로 이동
    window.location.href = '/';
}

export async function signInAsGuest(keepLoggedIn: boolean = true) {
    // 게스트 모드는 쿠키를 사용하여 미들웨어 통과 및 대시보드 표시
    const maxAge = keepLoggedIn ? 365 * 24 * 60 * 60 : 86400; // 1년 또는 24시간
    document.cookie = `guest_mode=true; path=/; max-age=${maxAge}`;
    window.location.href = '/';
}

export async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // 게스트 쿠키도 삭제
    document.cookie = "guest_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = '/login';
}
