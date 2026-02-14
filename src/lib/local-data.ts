import planData from '../../plan.json';
import { BibleReadingPlan } from '@/types/bible';
import { getOfficialCategory, generateKeywords, calculateReadingTime } from '@/lib/bible-utils';

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Get all reading plans with generated dates for the current year
export const getAllReadingPlans = (): BibleReadingPlan[] => {
    const currentYear = new Date().getFullYear();
    const baseDate = new Date(currentYear, 0, 1); // Jan 1st

    return (planData as any[]).map((item) => {
        // Calculate date based on day number (1-based)
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() + (item.day - 1));

        // Generate derived fields that might be missing in JSON
        const category = getOfficialCategory(item.verses);
        const summary = generateKeywords(item.verses);
        const reading_time = calculateReadingTime(item.verses);

        return {
            id: item.day, // Use day as ID
            day_of_year: item.day,
            title: item.title,
            verses: item.verses,
            date: formatDate(date),
            category,
            summary,
            reading_time
        };
    });
};

export const getReadingPlanByDate = (dateStr: string): BibleReadingPlan | undefined => {
    const plans = getAllReadingPlans();
    return plans.find(p => p.date === dateStr);
};
