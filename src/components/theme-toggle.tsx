'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ModeToggle({ className }: { className?: string }) {
	const { theme, setTheme } = useTheme();

	const toggleTheme = () => {
		setTheme(theme === 'light' ? 'dark' : 'light');
	};

	return (
		<div className={className}>
			<Button variant="ghost" size="icon" onClick={toggleTheme} className="relative">
				<Sun className="size-4 translate-y-0 rotate-0 scale-100 transition-all duration-1000 dark:translate-y-full dark:rotate-180 dark:scale-0" />
				<Moon className="absolute size-4 -translate-y-full rotate-180 scale-0 transition-all duration-1000 dark:translate-y-0 dark:rotate-0 dark:scale-100" />
				<span className="sr-only">Toggle theme</span>
			</Button>
		</div>
	);
}
