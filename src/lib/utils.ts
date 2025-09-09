
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getNextMatchTime(timeZone: string, targetDay: number, targetHour: number) {
    const now = new Date();
    const nowInTimeZone = new Date(now.toLocaleString('en-US', { timeZone }));

    const dayOfWeek = nowInTimeZone.getDay(); // 0 = Sunday, 1 = Monday, ...
    const hour = nowInTimeZone.getHours();

    let daysUntilTarget = targetDay - dayOfWeek;
    
    const isTodayTheDay = daysUntilTarget === 0;
    const isPastTheHour = hour >= targetHour;

    if (daysUntilTarget < 0 || (isTodayTheDay && isPastTheHour)) {
        daysUntilTarget += 7; // It's past the match time this week, so schedule for next week.
    }

    const nextMatchDate = new Date(nowInTimeZone);
    nextMatchDate.setDate(nowInTimeZone.getDate() + daysUntilTarget);
    nextMatchDate.setHours(targetHour, 0, 0, 0);

    // Match day is only true if today is Monday and it's before 12 PM.
    const isMatchDay = isTodayTheDay && !isPastTheHour;

    return {
        nextMatchDate,
        timeZone: timeZone,
        isMatchDay,
    };
}
