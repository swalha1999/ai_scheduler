import Link from 'next/link';
import { EmailVerificationForm, ResendEmailVerificationCodeForm } from './components';

import { getUserEmailVerificationRequestFromRequest } from '@/core/auth/email-verification';
import { globalGETRateLimit } from '@/core/auth/request';
import { getCurrentSession } from '@/core/auth/session';
import { redirect } from 'next/navigation';

import { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { goHome } from '@/core/go_home';

interface PageProps {
	params: Promise<{ locale: Locale }>;
}

export default async function Page(props: PageProps) {
	const { locale } = await props.params;
	const t = await getTranslations('auth');
	if (!globalGETRateLimit()) {
		return <p className="text-center text-destructive">{t('common.too_many_requests')}</p>;
	}
	const { user } = await getCurrentSession();
	if (user === null) {
		return redirect(` /login`);
	}

	const verificationRequest = await getUserEmailVerificationRequestFromRequest();
	if (verificationRequest === null && user.email_verified) {
		return goHome();
	}
	return (
		<>
			<h1 className="text-center text-3xl font-bold">تحقق من عنوان بريدك الإلكتروني</h1>
			<p className="text-center text-muted-foreground">
				لقد أرسلنا رمزًا 8-رقميًا إلى {verificationRequest?.email ?? user.email}.
			</p>
			<div className="space-y-6 rounded-lg bg-card p-6 text-card-foreground shadow-md">
				<EmailVerificationForm />
				<ResendEmailVerificationCodeForm />
				<div className="text-center">
					<Link href="/settings" className="text-primary hover:underline">
						تغيير بريدك الإلكتروني
					</Link>
				</div>
			</div>
		</>
	);
}
