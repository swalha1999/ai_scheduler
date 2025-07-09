'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	labels: {
		page: string;
		of: string;
		firstPage: string;
		previousPage: string;
		nextPage: string;
		lastPage: string;
	};
}

export function Pagination({ currentPage, totalPages, labels }: PaginationProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const changePage = (page: number) => {
		const newParams = new URLSearchParams(searchParams.toString());
		if (page === 1) {
			newParams.delete('page');
		} else {
			newParams.set('page', page.toString());
		}
		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	if (totalPages <= 1) return null;

	return (
		<div className="flex items-center justify-center gap-2">
			<Button
				variant="outline"
				size="sm"
				onClick={() => changePage(1)}
				disabled={currentPage <= 1}
				title={labels.firstPage}
			>
				<ChevronsRight className="h-4 w-4" />
			</Button>

			<Button
				variant="outline"
				size="sm"
				onClick={() => changePage(currentPage - 1)}
				disabled={currentPage <= 1}
				title={labels.previousPage}
			>
				<ChevronRight className="h-4 w-4" />
			</Button>

			<span className="px-2 text-sm text-muted-foreground">
				{labels.page} {currentPage} {labels.of} {totalPages}
			</span>

			<Button
				variant="outline"
				size="sm"
				onClick={() => changePage(currentPage + 1)}
				disabled={currentPage >= totalPages}
				title={labels.nextPage}
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>

			<Button
				variant="outline"
				size="sm"
				onClick={() => changePage(totalPages)}
				disabled={currentPage >= totalPages}
				title={labels.lastPage}
			>
				<ChevronsLeft className="h-4 w-4" />
			</Button>
		</div>
	);
}
