import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// This utility function combines multiple class names into a single string
// It uses:
// - clsx: to handle conditional classes, arrays, and objects
// - tailwind-merge: to smartly merge Tailwind CSS classes and remove conflicts
// Example:
// cn('p-4', 'bg-red-500', {'hidden': isHidden}, 'p-6') -> "p-6 bg-red-500 hidden"
// The p-6 overrides p-4 since it comes later in the arguments
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency,
	}).format(amount);
}
