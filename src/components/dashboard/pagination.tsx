'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
	totalCount: number;
	pageSize: number;
	t: any;
}

export function Pagination({
	currentPage,
	totalPages,
	hasNextPage,
	hasPrevPage,
	totalCount,
	pageSize,
	t
}: PaginationProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const createPageURL = (page: number) => {
		const params = new URLSearchParams(searchParams);
		params.set('page', page.toString());
		return `${pathname}?${params.toString()}`;
	};

	const startItem = (currentPage - 1) * pageSize + 1;
	const endItem = Math.min(currentPage * pageSize, totalCount);

	// Calculate page numbers to show
	const getPageNumbers = () => {
		const delta = 2; // Show 2 pages before and after current page
		const range = [];
		const rangeWithDots = [];

		for (
			let i = Math.max(2, currentPage - delta);
			i <= Math.min(totalPages - 1, currentPage + delta);
			i++
		) {
			range.push(i);
		}

		if (currentPage - delta > 2) {
			rangeWithDots.push(1, '...');
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push('...', totalPages);
		} else {
			if (totalPages > 1) {
				rangeWithDots.push(totalPages);
			}
		}

		return rangeWithDots;
	};

	const pageNumbers = getPageNumbers();

	if (totalPages <= 1) return null;

	return (
		<div className="flex items-center justify-between px-2">
			<div className="flex-1 text-sm text-muted-foreground">
				{t('pagination.showing')} {startItem} {t('pagination.to')} {endItem} {t('pagination.of')} {totalCount} {t('pagination.results')}
			</div>
			
			<div className="flex items-center space-x-2">
				{/* First page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => router.push(createPageURL(1))}
					disabled={!hasPrevPage}
					className="h-8 w-8 p-0"
				>
					<ChevronsLeft className="h-4 w-4" />
				</Button>

				{/* Previous page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => router.push(createPageURL(currentPage - 1))}
					disabled={!hasPrevPage}
					className="h-8 w-8 p-0"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				{/* Page numbers */}
				{pageNumbers.map((page, index) => (
					<Button
						key={index}
						variant={page === currentPage ? "default" : "outline"}
						size="sm"
						onClick={() => typeof page === 'number' ? router.push(createPageURL(page)) : undefined}
						disabled={page === '...'}
						className="h-8 min-w-8"
					>
						{page}
					</Button>
				))}

				{/* Next page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => router.push(createPageURL(currentPage + 1))}
					disabled={!hasNextPage}
					className="h-8 w-8 p-0"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>

				{/* Last page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => router.push(createPageURL(totalPages))}
					disabled={!hasNextPage}
					className="h-8 w-8 p-0"
				>
					<ChevronsRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
} 