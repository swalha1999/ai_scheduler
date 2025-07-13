'use client';

import { Input } from '@/components/ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDeferredValue, useEffect, useState } from 'react';
import { SearchIcon } from 'lucide-react';

interface TableSearchInputProps {
	placeholder: string;
	searchKey: string;
	className?: string;
}

export function TableSearchInput({ placeholder, searchKey, className }: TableSearchInputProps) {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { push } = useRouter();
	
	const [searchTerm, setSearchTerm] = useState(searchParams.get(searchKey) || '');
	const deferredSearchTerm = useDeferredValue(searchTerm);

	useEffect(() => {
		const params = new URLSearchParams(searchParams);
		
		if (deferredSearchTerm) {
			params.set(searchKey, deferredSearchTerm);
		} else {
			params.delete(searchKey);
		}
		
		// Reset to page 1 when searching
		params.set('page', '1');
		
		push(`${pathname}?${params.toString()}`);
	}, [deferredSearchTerm, searchKey, pathname, push, searchParams]);

	return (
		<div className={`relative ${className}`}>
			<SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				placeholder={placeholder}
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="pl-8 h-8 text-sm"
			/>
		</div>
	);
} 