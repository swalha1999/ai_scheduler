'use client';

import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export interface FilterOption {
	value: string;
	label: string;
}

interface FilterGroupProps {
	paramName: string;
	options: string[] | FilterOption[];
	selectedValue?: string;
	allLabel?: string;
	title?: string;
	variant?: 'default' | 'rounded';
	dependentParams?: string[];
	className?: string;
}

export function FilterGroup({
	paramName,
	options,
	selectedValue,
	allLabel,
	title,
	variant = 'default',
	dependentParams = [],
	className = '',
}: FilterGroupProps) {
	const searchParams = useSearchParams();

	const createFilterHref = (value: string | null) => {
		const newParams = new URLSearchParams(searchParams.toString());

		if (value) {
			newParams.set(paramName, value);
		} else {
			newParams.delete(paramName);
		}

		// Clear dependent parameters when this filter changes
		dependentParams.forEach((param) => {
			newParams.delete(param);
		});

		// Reset to first page when filtering
		newParams.delete('page');

		return `?${newParams.toString()}`;
	};

	const buttonClassName = variant === 'rounded' ? 'rounded-xl' : '';

	return (
		<div className={`flex flex-col gap-2 ${className}`}>
			{title && <h3 className="text-sm font-medium text-foreground">{title}</h3>}
			<div className="flex flex-wrap gap-2">
				{allLabel && (
					<Link href={createFilterHref(null)} scroll={false}>
						<Button
							variant={!selectedValue ? 'default' : 'outline'}
							className={`${buttonClassName} ${!selectedValue ? 'hover:bg-primary' : ''}`}
						>
							{allLabel}
						</Button>
					</Link>
				)}
				{options.map((option) => {
					const value = typeof option === 'string' ? option : option.value;
					const label = typeof option === 'string' ? option : option.label;
					const isSelected = selectedValue === value;
					return (
						<Link key={value} href={createFilterHref(value)} scroll={false}>
							<Button
								variant={isSelected ? 'default' : 'outline'}
								className={`${buttonClassName} ${isSelected ? 'hover:bg-primary' : ''}`}
							>
								{label}
							</Button>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
