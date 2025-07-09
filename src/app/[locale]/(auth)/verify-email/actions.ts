'use server';

import {
	createEmailVerificationRequest,
	deleteEmailVerificationRequestCookie,
	deleteUserEmailVerificationRequest,
	getUserEmailVerificationRequestFromRequest,
	sendVerificationEmail,
	sendVerificationEmailBucket,
	setEmailVerificationRequestCookie,
} from '@/core/auth/email-verification';
import { ExpiringTokenBucket } from '@/core/auth/rate-limit';
import { globalPOSTRateLimit } from '@/core/auth/request';
import { getCurrentSession } from '@/core/auth/session';
import { updateUserEmailAndSetEmailAsVerified } from '@/core/auth/user';
import { goHome } from '@/core/go_home';
import { ActionResult } from '@/types/actionType';

const bucket = new ExpiringTokenBucket<number>(5, 60 * 30);

export async function verifyEmailAction(
	_prev: ActionResult,
	formData: FormData
): Promise<ActionResult> {
	if (!globalPOSTRateLimit()) {
		return {
			message: 'tooManyRequests',
		};
	}

	const { session, user } = await getCurrentSession();
	if (session === null) {
		return {
			message: 'loginRequired',
		};
	}
	if (user.registered_2fa && !session.two_factor_verified) {
		return {
			message: 'twoFactorRequired',
		};
	}
	if (!bucket.consume(user.id, 1)) {
		return {
			message: 'tooManyRequests',
		};
	}

	const verificationRequest = await getUserEmailVerificationRequestFromRequest();
	if (verificationRequest === null) {
		return {
			message: 'verificationRequired',
		};
	}
	const code = formData.get('code');
	if (typeof code !== 'string') {
		return {
			message: 'missingCode',
		};
	}
	if (code === '') {
		return {
			message: 'missingCode',
		};
	}
	if (code !== verificationRequest.code) {
		return {
			message: 'invalidCode',
		};
	}

	await updateUserEmailAndSetEmailAsVerified(user.id, verificationRequest.email);
	await deleteUserEmailVerificationRequest(user.id);
	deleteEmailVerificationRequestCookie();

	return goHome();
}

export async function resendEmailVerificationCodeAction(): Promise<ActionResult> {
	if (!globalPOSTRateLimit()) {
		return {
			message: 'tooManyRequests',
		};
	}

	const { session, user } = await getCurrentSession();
	if (session === null) {
		return {
			message: 'loginRequired',
		};
	}
	if (user.registered_2fa && !session.two_factor_verified) {
		return {
			message: 'twoFactorRequired',
		};
	}
	if (!sendVerificationEmailBucket.check(user.id, 1)) {
		return {
			message: 'tooManyRequests',
		};
	}
	let verificationRequest = await getUserEmailVerificationRequestFromRequest();
	if (verificationRequest === null) {
		if (user.email_verified) {
			return {
				message: 'emailAlreadyVerified',
			};
		}
		if (!sendVerificationEmailBucket.consume(user.id, 1)) {
			return {
				message: 'tooManyRequests',
			};
		}
		verificationRequest = await createEmailVerificationRequest(user.id, user.email);
	} else {
		if (!sendVerificationEmailBucket.consume(user.id, 1)) {
			return {
				message: 'tooManyRequests',
			};
		}
		verificationRequest = await createEmailVerificationRequest(
			user.id,
			verificationRequest.email
		);
	}
	sendVerificationEmail(verificationRequest.email, user.username, verificationRequest.code);
	setEmailVerificationRequestCookie(verificationRequest);
	return {
		message: 'verificationCodeSent',
	};
}
