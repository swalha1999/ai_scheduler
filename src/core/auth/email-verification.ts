import { encodeBase32 } from '@oslojs/encoding';
import { and, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

import { db } from '@/data';
import { email_verification_requests } from '@/data/access-layer-v2/schemas/auth.schema';
import { sendEmailVerificationCode } from '@/lib/email/sendEmail';
import { ExpiringTokenBucket } from '@/core/auth/rate-limit';
import { getCurrentSession } from '@/core/auth/session';
import { generateRandomOTP } from '@/core/auth/utils';

export async function getUserEmailVerificationRequest(
	userId: number,
	id: string
): Promise<EmailVerificationRequest | null> {
	const result = await db
		.select()
		.from(email_verification_requests)
		.where(
			and(
				eq(email_verification_requests.id, id),
				eq(email_verification_requests.userId, userId)
			)
		);

	if (result.length < 1) {
		return null;
	}

	return result[0];
}

export async function createEmailVerificationRequest(
	userId: number,
	email: string
): Promise<EmailVerificationRequest> {
	await deleteUserEmailVerificationRequest(userId);
	const idBytes = new Uint8Array(20);
	crypto.getRandomValues(idBytes);
	const id = encodeBase32(idBytes).toLowerCase();
	const code = generateRandomOTP();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

	const result = await db
		.insert(email_verification_requests)
		.values({
			id,
			userId,
			code,
			email,
			expiresAt,
		})
		.returning();

	return result[0];
}

export async function deleteUserEmailVerificationRequest(userId: number): Promise<void> {
	await db
		.delete(email_verification_requests)
		.where(eq(email_verification_requests.userId, userId));
}

export function sendVerificationEmail(email: string, username: string, code: string): void {
	sendEmailVerificationCode(email, username, code);
}

export async function setEmailVerificationRequestCookie(
	request: EmailVerificationRequest
): Promise<void> {
	(await cookies()).set('email_verification', request.id, {
		httpOnly: true,
		path: '/',
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		expires: request.expiresAt,
	});
}

export async function deleteEmailVerificationRequestCookie(): Promise<void> {
	(await cookies()).set('email_verification', '', {
		httpOnly: true,
		path: '/',
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 0,
	});
}

export async function getUserEmailVerificationRequestFromRequest(): Promise<EmailVerificationRequest | null> {
	const { user } = await getCurrentSession();
	if (user === null) {
		return null;
	}
	const id = (await cookies()).get('email_verification')?.value ?? null;
	if (id === null) {
		return null;
	}
	const request = await getUserEmailVerificationRequest(user.id, id);
	if (request === null) {
		deleteEmailVerificationRequestCookie();
	}
	return request;
}

export const sendVerificationEmailBucket = new ExpiringTokenBucket<number>(3, 60 * 10);

export interface EmailVerificationRequest {
	id: string;
	userId: number;
	code: string;
	email: string;
	expiresAt: Date;
}
