import { globalGETRateLimit } from '@/core/auth/request';
import { getCurrentSession } from '@/core/auth/session';
import { redirect } from 'next/navigation';

import { getTranslations } from 'next-intl/server';
import { SignupForm } from './components';
import { goHome } from '@/core/go_home';

export default async function Page() {
	const t = await getTranslations('auth');

	const { session, user } = await getCurrentSession();
	if (session !== null) {
		if (!user.email_verified) {
			return redirect(` /verify-email`);
		}
		return goHome();
	}

	return (
		<>
			<div>
				<h1 className="text-center text-3xl font-bold">{t('signup.title')}</h1>
			</div>
			<p className="text-center text-muted-foreground">{t('signup.requirements')}</p>
			<SignupForm />
		</>
	);
}
