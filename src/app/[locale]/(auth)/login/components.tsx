'use client';

import SubmitButton from '@/components/submit-button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Form from 'next/form';
import { loginAction } from './actions';
import { useParams } from 'next/navigation';

const initialState = {
	message: '',
	locale: 'he',
};

export function LoginFormSkeleton() {
	return (
		<div className="flex w-full flex-col gap-5">
			<Skeleton className="h-12 w-full rounded-lg" />
			<Skeleton className="h-12 w-full rounded-lg" />
			<Skeleton className="mt-4 h-12 w-full rounded-lg" />
		</div>
	);
}

export function LoginForm() {
	const locale = useLocale();
	const [, action] = useActionState(loginAction, { ...initialState, locale: locale ?? 'he' });
	const t = useTranslations('auth');

	return (
		<Form action={action} className="flex w-full flex-col">
			<div className="flex flex-col gap-4">
				<div className="w-full">
					<label
						htmlFor="form-login.email"
						className="mb-1.5 block text-sm font-medium text-foreground/80"
					>
						{t('login.email')}
					</label>
					<Input
						type="email"
						id="form-login.email"
						name="email"
						autoComplete="username"
						required
						className="h-11 w-full rounded-xl border-primary/20 bg-background/50 transition-all duration-300 focus:border-primary focus:ring-primary/20"
						placeholder={t('login.email')}
					/>
				</div>

				<div className="w-full">
					<label
						htmlFor="form-login.password"
						className="mb-1.5 block text-sm font-medium text-foreground/80"
					>
						{t('login.password')}
					</label>
					<Input
						type="password"
						id="form-login.password"
						name="password"
						autoComplete="current-password"
						required
						className="h-11 w-full rounded-xl border-primary/20 bg-background/50 transition-all duration-300 focus:border-primary focus:ring-primary/20"
						placeholder={t('login.password')}
					/>
				</div>

				<div className="mt-2 w-full">
					<SubmitButton className="h-11 w-full rounded-xl bg-primary font-medium text-white shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl">
						{t('login.submit')}
					</SubmitButton>
				</div>
			</div>
		</Form>
	);
}
