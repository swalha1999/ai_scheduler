'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { Icon } from './icon';

interface LogoProps {
	className?: string;
	color?: string;
	onClick?: () => void;
	animate?: boolean; // New prop to control animation
}

export function Logo({ className, color, onClick, animate = false }: LogoProps) {
	if (!color) color = 'hsl(var(--primary))';
	const iconRef = useRef<HTMLDivElement>(null);

	// Function to start the animation
	const startAnimation = () => {
		if (iconRef.current) {
			iconRef.current.style.transform = 'rotate(180deg)';
			setTimeout(() => {
				if (iconRef.current) {
					iconRef.current.style.transform = 'rotate(0deg)';
				}
			}, 700);
		}
	};

	// Run animation when animate prop changes to true
	useEffect(() => {
		if (animate) {
			startAnimation();
		}
	}, [animate]);

	const handleClick = () => {
		// Only animate on click if it's an authentication action
		// This will be controlled by the parent component
		if (onClick) {
			onClick();
		}
	};

	return (
		<div className={cn('flex items-center gap-1', className)} onClick={handleClick}>
			<div className="ml-1 translate-y-1">
				<div ref={iconRef} className="transition-transform duration-700">
					<Icon name="FaRegCompass" size={27} color={color} />
				</div>
			</div>
			<span className="text-right text-2xl font-bold text-primary">بَوْصَلَة</span>
		</div>
	);
}
