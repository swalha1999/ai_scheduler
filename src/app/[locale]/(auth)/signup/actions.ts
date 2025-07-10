'use server';

import { ActionResult } from '@/types/actionType';
import { checkEmailAvailability, verifyEmailInput } from '@/core/auth/email';
import {
	createEmailVerificationRequest,
	sendVerificationEmail,
	setEmailVerificationRequestCookie,
} from '@/core/auth/email-verification';
import { verifyPasswordStrength } from '@/core/auth/password';
import { RefillingTokenBucket } from '@/core/auth/rate-limit';
import { globalPOSTRateLimit } from '@/core/auth/request';
import { createSession, generateSessionToken, setSessionTokenCookie } from '@/core/auth/session';
import { createUser, verifyUsernameInput } from '@/core/auth/user';
import { getClientIP } from '@/core/UserIP';

import type { SessionFlags } from '@/core/auth/session';
import { redirect } from '@/i18n/navigation';

const ipBucket = new RefillingTokenBucket<string>(10, 1);

export async function signupAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
	const { locale } = _prev;
	if (!globalPOSTRateLimit()) {
		return {
			message: 'tooManyRequests',
		};
	}

	// Use proper IP utility instead of manual header extraction
	const clientIP = await getClientIP();
	if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
		return {
			message: 'tooManyRequests',
		};
	}

	const email = formData.get('email');
	const username = formData.get('username');
	const password = formData.get('password');
	if (typeof email !== 'string' || typeof username !== 'string' || typeof password !== 'string') {
		return {
			message: 'invalidFields',
		};
	}
	if (email === '' || password === '' || username === '') {
		return {
			message: 'missingFields',
		};
	}
	if (!verifyEmailInput(email)) {
		return {
			message: 'invalidEmail',
		};
	}
	if (!verifyUsernameInput(username)) {
		return {
			message: 'invalidUsername',
		};
	}
	if (!verifyPasswordStrength(password)) {
		return {
			message: 'weakPassword',
		};
	}
	if (!(await checkEmailAvailability(email))) {
		return {
			message: 'emailInUse',
		};
	}
	const user = await createUser(email, username, password);
	const sessionToken = generateSessionToken();
	const sessionFlags: SessionFlags = {
		twoFactorVerified: false,
	};
	const session = await createSession(sessionToken, user.id, sessionFlags);
	await setSessionTokenCookie(sessionToken, session.expiresAt);

	const verificationRequest = await createEmailVerificationRequest(user.id, email);
	await sendVerificationEmail(email, username, verificationRequest.code);
	setEmailVerificationRequestCookie(verificationRequest);

	return redirect({ href: '/verify-email', locale: locale ?? 'he' });
}
