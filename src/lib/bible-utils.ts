import { BIBLE_BOOKS, BibleCategory, CHAPTER_KEYWORDS } from "./bible-metadata";

/**
 * 성경 구절 목록(verses)으로부터 공식 분류를 추출합니다.
 */
export function getOfficialCategory(verses: string[]): string {
    if (!verses || verses.length === 0) return "분류 정보 없음";

    const categories = new Set<string>();

    verses.forEach(v => {
        // "창세기 1장" 형식에서 책 이름 추출
        const bookName = v.split(' ')[0];
        const book = BIBLE_BOOKS.find(b => b.name === bookName);
        if (book) {
            categories.add(book.subCategory);
        }
    });

    return Array.from(categories).join(' / ');
}

/**
 * 성경 구절로부터 요약 키워드(해시태그)를 장별(Chapter) 핵심 내용 기반으로 생성합니다.
 */
export function generateKeywords(verses: string[]): string {
    if (!verses || verses.length === 0) return "#말씀 #묵상";

    const keywords = new Set<string>();

    verses.forEach(v => {
        const parts = v.split(' ');
        if (parts.length < 2) return;

        const bookName = parts[0];
        const chapterPart = parts[1].replace('장', '');

        // 장 번호 추출 (범위일 경우 첫 장 기준)
        const chapterNum = parseInt(chapterPart.split('-')[0]);

        // 1. 장별 정밀 키워드 확인
        const chapterData = CHAPTER_KEYWORDS[bookName]?.[chapterNum];
        if (chapterData) {
            chapterData.forEach(k => keywords.add(k));
        } else {
            // 2. 장별 데이터 없을 시 책 단위 키워드 폴백
            const book = BIBLE_BOOKS.find(b => b.name === bookName);
            if (book) {
                book.keywords.forEach(k => keywords.add(k));
            }
        }
    });

    // 최종 해시태그 생성
    return Array.from(keywords).slice(0, 6).map(k => `#${k}`).join(' ');
}

/**
 * 성경 구절 분량을 계산하여 1분 단위 초정밀 시간을 산출합니다.
 * 권별 분량 가중치를 적용하여 형평성 있는 시간을 제공합니다.
 */
export function calculateReadingTime(verses: string[]): string {
    if (!verses || verses.length === 0) return "오늘의 읽기, 약 1분 소요";

    let totalMinutes = 0;

    verses.forEach(v => {
        const parts = v.split(' ');
        if (parts.length < 2) return;

        const bookName = parts[0];
        const book = BIBLE_BOOKS.find(b => b.name === bookName);
        const weight = book?.readingWeight || 1.0;

        const chapterPart = parts[1].replace('장', '');
        let count = 1;

        if (chapterPart.includes('-')) {
            const [start, end] = chapterPart.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end)) {
                count = end - start + 1;
            }
        }

        // 장당 기준 시간(3.2분) * 권별 가중치 * 장 수
        totalMinutes += (3.2 * weight * count);
    });

    const finalMinutes = Math.max(1, Math.round(totalMinutes));
    return `오늘의 읽기, 약 ${finalMinutes}분 소요`;
}
