'use client';

import { Button } from '@/components/ui/button';
import { signupAction } from './actions';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

const initialState = {
	message: '',
	locale: 'he',
};

export function SignupForm() {
	const locale = useLocale();
	const [, action, isPending] = useActionState(signupAction, { ...initialState, locale: locale ?? 'he' });
	const t = useTranslations('auth');

	return (
		<>
			<form action={action} className="flex w-full flex-col">
				<div className="flex flex-col gap-5">
					<div className="w-full">
						<label htmlFor="form-signup.username" className="sr-only">
							{t('signup.username')}
						</label>
						<Input
							type="text"
							id="form-signup.username"
							name="username"
							autoComplete="username"
							required
							className="h-12 w-full"
							placeholder={t('signup.username')}
						/>
					</div>
					<div className="w-full">
						<label htmlFor="form-signup.email" className="sr-only">
							{t('signup.email')}
						</label>
						<Input
							type="email"
							id="form-signup.email"
							name="email"
							autoComplete="email"
							required
							className="h-12 w-full"
							placeholder={t('signup.email_placeholder')}
						/>
					</div>
					<div className="w-full">
						<label htmlFor="form-signup.password" className="sr-only">
							{t('signup.password')}
						</label>
						<Input
							type="password"
							id="form-signup.password"
							name="password"
							autoComplete="new-password"
							required
							className="h-12 w-full"
							placeholder={t('signup.password_placeholder')}
						/>
					</div>
				</div>

				<div className="mt-2.5 w-full">
					<Button type="submit" className="mt-2.5 h-12 w-full" disabled={isPending}>
						{isPending ? t('loading') : t('signup.submit')}
					</Button>
				</div>
			</form>
			<div className="text-center">
				<Link href="/login" className="text-foreground/80 hover:text-foreground">
					{t('signup.have_account')}
				</Link>
			</div>
		</>
	);
}

export function SignupFormSkeleton() {
	return (
		<div className="flex w-full flex-col gap-5">
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-12 w-full" />
			<Skeleton className="mt-2.5 h-12 w-full" />
		</div>
	);
}
