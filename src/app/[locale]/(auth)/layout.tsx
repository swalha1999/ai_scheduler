'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	const t = useTranslations('auth.layout');
	return (
		<div className="flex min-h-screen flex-col">
			<main className="flex flex-1">
				<div className="relative flex flex-1 flex-col lg:flex-row">
					{/* Content area with glass effect */}
					<div className="relative z-20 flex w-full flex-col items-center justify-center px-4 py-6 lg:w-1/2">
						<div className="w-full max-w-sm space-y-6 rounded-3xl border border-primary/10 bg-background/40 p-8 shadow-2xl backdrop-blur-md">
							{children}
							<div className="mt-6 flex justify-center gap-4 text-sm text-muted-foreground">
								<Link
									href="/terms"
									className="transition-colors hover:text-primary"
								>
									{t('terms')}
								</Link>
								<Link
									href="/privacy-policies"
									className="transition-colors hover:text-primary"
								>
									{t('privacy')}
								</Link>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
