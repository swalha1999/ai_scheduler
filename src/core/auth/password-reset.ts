import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

import { db } from '@/data';
import { password_reset_sessions } from '@/data/access-layer-v2/schemas/auth.schema';
import { returnSafeUser } from '@/core/auth/user';
import { generateRandomOTP } from '@/core/auth/utils';

import type { PasswordResetSession, SafeUser, User } from '@/data/access-layer-v2/schemas/auth.schema';

export async function createPasswordResetSession(
	token: string,
	userId: number,
	email: string
): Promise<PasswordResetSession> {
	const ageInHours = 1;
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const session: PasswordResetSession = {
		id: sessionId,
		userId,
		email,
		expiresAt: new Date(Date.now() + ageInHours * 1000 * 60 * 60),
		code: generateRandomOTP(),
		emailVerified: false,
		twoFactorVerified: false,
	};

	await db.insert(password_reset_sessions).values(session);
	return session;
}

// i think there is a bug here
export async function validatePasswordResetSessionToken(
	token: string
): Promise<PasswordResetSessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const result = await db.query.password_reset_sessions.findFirst({
		where: eq(password_reset_sessions.id, sessionId),
		with: {
			user: true,
		},
	});

	if (result === null || result === undefined) {
		return { session: null, user: null };
	}

	const session: PasswordResetSession = result;
	const user: User = result?.user;

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(password_reset_sessions).where(eq(password_reset_sessions.id, session.id));
		return { session: null, user: null };
	}

	return {
		session,
		user: returnSafeUser(user),
	};
}

export async function setPasswordResetSessionAsEmailVerified(sessionId: string): Promise<void> {
	await db
		.update(password_reset_sessions)
		.set({ emailVerified: true })
		.where(eq(password_reset_sessions.id, sessionId));
}

export async function setPasswordResetSessionAs2FAVerified(sessionId: string): Promise<void> {
	await db
		.update(password_reset_sessions)
		.set({ twoFactorVerified: true })
		.where(eq(password_reset_sessions.id, sessionId));
}

export async function invalidateUserPasswordResetSessions(userId: number): Promise<void> {
	await db.delete(password_reset_sessions).where(eq(password_reset_sessions.userId, userId));
}

export async function validatePasswordResetSessionRequest(): Promise<PasswordResetSessionValidationResult> {
	const cookieStore = await cookies();
	const token = cookieStore.get('password_reset_session')?.value ?? null;
	if (token === null) {
		return { session: null, user: null };
	}
	const result = await validatePasswordResetSessionToken(token);
	if (result.session === null) {
		deletePasswordResetSessionTokenCookie();
	}
	return result;
}

export async function setPasswordResetSessionTokenCookie(
	token: string,
	expiresAt: Date
): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set('password_reset_session', token, {
		expires: expiresAt,
		sameSite: 'lax',
		httpOnly: true,
		path: '/',
		secure: process.env.NODE_ENV === 'production',
	});
}

export async function deletePasswordResetSessionTokenCookie(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set('password_reset_session', '', {
		maxAge: 0,
		sameSite: 'lax',
		httpOnly: true,
		path: '/',
		secure: process.env.NODE_ENV === 'production',
	});
}

export type PasswordResetSessionValidationResult =
	| { session: PasswordResetSession; user: SafeUser }
	| { session: null; user: null };
