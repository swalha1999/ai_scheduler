'use server';

import { verifyEmailInput } from '@/core/auth/email';
import { verifyPasswordHash } from '@/core/auth/password';
import { RefillingTokenBucket, Throttler } from '@/core/auth/rate-limit';
import { globalPOSTRateLimit } from '@/core/auth/request';
import { createSession, generateSessionToken, setSessionTokenCookie } from '@/core/auth/session';
import { getUserFromEmail, getUserPasswordHash } from '@/core/auth/user';
import { getClientIP } from '@/core/UserIP';

import { ActionResult } from '@/types/actionType';
import type { SessionFlags } from '@/core/auth/session';
import { redirect } from '@/i18n/navigation';
import { goHome } from '@/core/go_home';


const throttler = new Throttler<number>([1, 2, 4, 8, 16, 30, 60, 180, 300]);
const ipBucket = new RefillingTokenBucket<string>(20, 1);

export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
	const { locale } = _prev
	if (!globalPOSTRateLimit()) {
		return {
			message: 'tooManyRequests',
		};
	}
	// Use proper IP utility instead of manual header extraction
	const clientIP = await getClientIP();
	if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
		return {
			message: 'tooManyRequests',
		};
	}

	const email = formData.get('email');
	const password = formData.get('password');
	if (typeof email !== 'string' || typeof password !== 'string') {
		return {
			message: 'loginFieldsRequired',
		};
	}
	if (email === '' || password === '') {
		return {
			message: 'loginFieldsRequired',
		};
	}
	if (!verifyEmailInput(email)) {
		return {
			message: 'invalidCredentials',
		};
	}
	const user = await getUserFromEmail(email);
	if (user === null) {
		return {
			message: 'invalidCredentials',
		};
	}
	if (!throttler.consume(user.id)) {
		return {
			message: 'tooManyRequests',
		};
	}
	const passwordHash = await getUserPasswordHash(user.id);
	const validPassword = await verifyPasswordHash(passwordHash, password);
	if (!validPassword) {
		return {
			message: 'invalidCredentials',
		};
	}
	throttler.reset(user.id);
	const sessionFlags: SessionFlags = {
		twoFactorVerified: false,
	};
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id, sessionFlags);
	await setSessionTokenCookie(sessionToken, session.expiresAt);

	if (!user.email_verified) {
		return redirect({ href: '/verify-email', locale: locale ?? 'he' });
	}

	return goHome();
}
