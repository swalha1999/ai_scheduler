'use client';

import { Logo } from '@/components/logo';
import { ModeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function Header({ className }: { className?: string }) {
	const { user, logoutUser, loading } = useAuth();
	const t = useTranslations('common');

	return (
		<header className={cn('h-20 w-full border-b-2 border-primary/20 px-4', className)}>
			<div className="flex h-full items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-x-3">
					<Logo />
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden items-center gap-x-4 md:flex">
					<Button asChild variant="ghost" size="lg">
						<Link href="/begrouts">{t('begrouts')}</Link>
					</Button>
					<Button asChild variant="ghost" size="lg">
						<Link href="/games/math-game">{t('games')}</Link>
					</Button>
					<Button asChild variant="ghost" size="lg">
						<Link href="/study-planner">{t('study_planner')}</Link>
					</Button>

					{!user && !loading && (
						<>
							<Button asChild variant="default" size="lg">
								<Link href="/signup">{t('signup')}</Link>
							</Button>
							<Button asChild variant="ghost" size="lg">
								<Link href="/login">{t('login')}</Link>
							</Button>
						</>
					)}

					{loading && (
						<Button asChild variant="ghost" size="lg">
							<Link href="#">{t('loading')}</Link>
						</Button>
					)}

					{user && (
						<Button asChild variant="ghost" size="lg" onClick={logoutUser}>
							<Link href="#">{t('logout')}</Link>
						</Button>
					)}
					<ModeToggle />
				</div>

				{/* Mobile Navigation */}
				<Sheet>
					<div className="flex items-center gap-x-4 md:hidden">
						<ModeToggle />
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon">
								<Menu className="h-6 w-6" />
							</Button>
						</SheetTrigger>
					</div>

					<SheetContent side="left">
						<SheetTitle className="text-center">{t('list')}</SheetTitle>
						<nav className="mt-8 flex flex-col gap-6">
							<Link href="/" className="flex items-center gap-x-3">
								<Logo />
							</Link>
							<Button asChild variant="ghost" size="lg">
								<Link href="/begrouts">{t('begrouts')}</Link>
							</Button>
							<Button asChild variant="ghost" size="lg">
								<Link href="/games/math-game">{t('games')}</Link>
							</Button>
							<Button asChild variant="ghost" size="lg">
								<Link href="/study-planner">{t('study_planner')}</Link>
							</Button>
							{user ? (
								<Button asChild variant="ghost" size="lg" onClick={logoutUser}>
									<Link href="#">{t('logout')}</Link>
								</Button>
							) : (
								<div className="flex flex-col gap-2">
									<Button asChild variant="default" size="lg">
										<Link href="/signup">{t('signup')}</Link>
									</Button>
									<Button asChild variant="ghost" size="lg">
										<Link href="/login">{t('login')}</Link>
									</Button>
								</div>
							)}
						</nav>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}
