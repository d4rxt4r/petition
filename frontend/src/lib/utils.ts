import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Plural forms for russian words
 */
export function pluralize(count: number, words: string[]) {
    const cases = [2, 0, 1, 1, 1, 2];
    return `${words[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]]}`;
}
