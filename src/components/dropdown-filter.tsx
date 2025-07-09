'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

export interface DropdownFilterOption {
	value: string;
	label: string;
}

interface DropdownFilterProps {
	paramName: string;
	options: string[] | DropdownFilterOption[];
	selectedValue?: string;
	allLabel?: string;
	title?: string;
	placeholder?: string;
	dependentParams?: string[];
	className?: string;
	width?: string;
}

export function DropdownFilter({
	paramName,
	options,
	selectedValue,
	allLabel = 'All',
	title,
	placeholder,
	dependentParams = [],
	className = '',
	width = 'w-[200px]',
}: DropdownFilterProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const createFilterHref = (value: string) => {
		const newParams = new URLSearchParams(searchParams.toString());

		if (value === 'all') {
			newParams.delete(paramName);
		} else {
			newParams.set(paramName, value);
		}

		// Clear dependent parameters when this filter changes
		dependentParams.forEach((param) => {
			newParams.delete(param);
		});

		// Reset to first page when filtering
		newParams.delete('page');

		return `?${newParams.toString()}`;
	};

	const handleValueChange = (value: string) => {
		const href = createFilterHref(value);
		router.push(href, { scroll: false });
	};

	return (
		<div className={`flex flex-col gap-2 ${className}`}>
			{title && <label className="text-sm font-medium">{title}</label>}
			<Select
				value={selectedValue || 'all'}
				onValueChange={handleValueChange}
			>
				<SelectTrigger className={width}>
					<SelectValue placeholder={placeholder || allLabel} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">{allLabel}</SelectItem>
					{options.map((option) => {
						const value = typeof option === 'string' ? option : option.value;
						const label = typeof option === 'string' ? option : option.label;
						return (
							<SelectItem key={value} value={value}>
								{label}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
		</div>
	);
} 