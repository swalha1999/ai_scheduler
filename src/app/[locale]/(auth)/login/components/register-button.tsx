'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RegisterButtonProps {
	text: string;
	href: string;
}

export function RegisterButton({ text, href }: RegisterButtonProps) {
	return (
		<Button
			variant="outline"
			asChild
			className="rounded-full border-primary bg-primary/10 px-8 py-3 font-medium text-primary shadow-md hover:bg-primary/20 hover:text-primary hover:shadow-lg"
		>
			<Link href={href} className="flex items-center gap-2">
				<span className="relative z-10">{text}</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="relative z-10"
				>
					<path d="M5 12h14"></path>
					<path d="m12 5 7 7-7 7"></path>
				</svg>
			</Link>
		</Button>
	);
}
