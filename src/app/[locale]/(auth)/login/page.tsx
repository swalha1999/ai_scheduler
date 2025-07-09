import { GoogleSignInButton } from '@/components/google/GoogleSignInButton';
import { redirect } from 'next/navigation';

import { globalGETRateLimit } from '@/core/auth/request';
import { getCurrentSession } from '@/core/auth/session';
import Link from 'next/link';
import { LoginForm } from './components';
import { RegisterButton } from './components/register-button';

import { Button } from '@/components/ui/button';
import { getTranslations, getLocale } from 'next-intl/server';

export default async function Page() {
	const locale = await getLocale();
	const t = await getTranslations('auth');

	if (!globalGETRateLimit()) {
		return <p className="error">{t('login.too_many_requests')}</p>;
	}
	const { session, user } = await getCurrentSession();

	if (session !== null && user.google_id === null) {
		if (!user.email_verified) {
			return redirect(` /verify-email`);
		}
	}

	if (session !== null) {
		if (user.is_admin) {
			return redirect(` /super`);
		} else {
			return redirect(` /super`);
		}
	}

	return (
		<>
			<h1 className="mb-8 text-center text-2xl font-bold text-primary">{t('login.title')}</h1>
			<div className="space-y-4">
				<LoginForm />
				{/* <div className="my-5 flex justify-center">
					<GoogleSignInButton />
				</div> */}
			</div>

			{/* <div className="mt-6 flex justify-center gap-4 text-center">
				<div>
					<Button variant="link" asChild>
						<Link
							href={` /signup`}
							className="text-sm text-foreground/80 hover:text-foreground hover:underline"
						>
							{t('login.create_account')}
						</Link>
					</Button>
				</div>
				<div>
					<Button
						variant="link"
						asChild
						className="text-primary transition-colors hover:text-primary/80"
					>
						<Link href={` /forgot-password`} className="text-sm hover:underline">
							{t('login.forgot_password')}
						</Link>
					</Button>
				</div>
			</div> */}

			{/* <div className="mt-8 flex justify-center">
				<RegisterButton text={t('call-me-back-button')} href={` /call-me-back`} />
			</div> */}
		</>
	);
}
