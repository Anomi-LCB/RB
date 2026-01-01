import { BibleReadingPlan } from "@/types/bible";

export const SAMPLE_PLAN: BibleReadingPlan[] = [
    {
        id: 0,
        date: "2025-12-31",
        title: "성경 읽기 시작 준비",
        verses: ["준비 구절"],
        day_of_year: 0,
        category: "안내",
        summary: "#성경읽기 #새로운시작 #준비 #기대",
        reading_time: "오늘의 읽기, 약 1분 소요",
    },
    {
        id: 1,
        date: "2026-01-01",
        title: "창세기 1-3장, 마태복음 1장",
        verses: ["창세기 1장", "창세기 2장", "창세기 3장", "마태복음 1장"],
        day_of_year: 1,
        category: "모세오경 / 복음서",
        summary: "#천지창조 #에덴동산 #아담과하와 #예수님의계보 #임마누엘",
        reading_time: "오늘의 읽기, 약 13분 소요",
    },
    {
        id: 2,
        date: "2026-01-02",
        title: "창세기 4-6장, 마태복음 2장",
        verses: ["창세기 4장", "창세기 5장", "창세기 6장", "마태복음 2장"],
        day_of_year: 2,
        category: "모세오경 / 복음서",
        summary: "#가인과아벨 #족보 #노아의방주 #동방박사 #애굽피신",
        reading_time: "오늘의 읽기, 약 11분 소요",
    },
    {
        id: 3,
        date: "2026-01-03",
        title: "창세기 7-9장, 마태복음 3장",
        verses: ["창세기 7장", "창세기 8장", "창세기 9장", "마태복음 3장"],
        day_of_year: 3,
        category: "모세오경 / 복음서",
        summary: "#대홍수 #무지개언약 #노아의실수 #세례요한 #회개",
        reading_time: "오늘의 읽기, 약 12분 소요",
    },
];
