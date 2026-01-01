export function calculateStreak(completedDates: string[]): number {
    if (completedDates.length === 0) return 0;

    // 중복 제거 및 날짜순 정렬 (sv-SE format: YYYY-MM-DD)
    const uniqueDates = Array.from(new Set(completedDates)).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const latestDateStr = uniqueDates[0];
    const latestDate = new Date(latestDateStr);
    latestDate.setHours(0, 0, 0, 0);

    // 가장 최근 완료일이 오늘이나 어제가 아니면 스트릭 끊김
    if (latestDate < yesterday && latestDate.getTime() !== today.getTime()) {
        return 0;
    }

    let streak = 0;
    let currentDate = latestDate;

    for (let i = 0; i < uniqueDates.length; i++) {
        const dateStr = uniqueDates[i];
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);

        if (i === 0) {
            streak = 1;
        } else {
            const prevDate = new Date(uniqueDates[i - 1]);
            prevDate.setHours(0, 0, 0, 0);
            prevDate.setDate(prevDate.getDate() - 1);

            if (date.getTime() === prevDate.getTime()) {
                streak++;
            } else {
                break;
            }
        }
    }

    return streak;
}
