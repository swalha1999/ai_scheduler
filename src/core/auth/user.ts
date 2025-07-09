import { and, eq } from 'drizzle-orm';

import { db } from '@/data';
import { SafeUser, User, users } from '@/data/access-layer-v2/schemas/auth.schema';
import { decryptString, encryptString } from '@/core/auth/encryption';
import { hashPassword } from '@/core/auth/password';
import { generateRandomRecoveryCode } from '@/core/auth/utils';

export function verifyUsernameInput(username: string): boolean {
	return username.length > 3 && username.length < 32 && username.trim() === username;
}

export async function createUser(
	email: string,
	username: string,
	password: string
): Promise<SafeUser> {
	const passwordHash = await hashPassword(password);
	const recoveryCode = generateRandomRecoveryCode();
	const encryptedRecoveryCode = encryptString(recoveryCode);
	let newUser: User;
	try {
		const result = await db
			.insert(users)
			.values({
				email,
				username,
				password_hash: passwordHash,
				recovery_code: encryptedRecoveryCode,
				email_verified: false,
			})
			.returning();

		newUser = result[0];
	} catch (error) {
		console.error(error);
		throw new Error('Failed to create user');
	}

	if (!newUser) {
		throw new Error('Failed to create user');
	}

	return returnSafeUser(newUser);
}

export async function createUserWithGoogleId(
	googleId: string,
	email: string,
	username: string,
	profilePicture: string
): Promise<SafeUser> {
	const result = await db
		.insert(users)
		.values({
			email,
			username,
			google_id: googleId,
			photo_url: profilePicture,
			email_verified: true,
		})
		.returning();

	if (result.length === 0) {
		throw new Error('Failed to create user');
	}

	const newUser = result[0];

	return returnSafeUser(newUser);
}

export async function updateUserPassword(userId: number, password: string): Promise<void> {
	const passwordHash = await hashPassword(password);
	await db.update(users).set({ password_hash: passwordHash }).where(eq(users.id, userId));
}

export async function updateUserEmailAndSetEmailAsVerified(
	userId: number,
	email: string
): Promise<void> {
	await db
		.update(users)
		.set({
			email: email,
			email_verified: true,
		})
		.where(eq(users.id, userId));
}

/**
 * Sets a user's email as verified if the provided email matches their current email
 * @param userId - The ID of the user to verify
 * @param email - The email address to check against
 * @returns True if the email matched and was verified, false if no match found
 */
export async function setUserAsEmailVerifiedIfEmailMatches(
	userId: number,
	email: string
): Promise<boolean> {
	const result = await db.query.users.findFirst({
		where: and(eq(users.id, userId), eq(users.email, email)),
	});
	if (result === null || result === undefined) {
		return false;
	}

	if (result.email_verified) {
		return true;
	}

	await db.update(users).set({ email_verified: true }).where(eq(users.id, userId));

	return true;
}

export async function getUserPasswordHash(userId: number): Promise<string> {
	const result = await db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: {
			password_hash: true,
		},
	});

	if (result === null || result === undefined) {
		throw new Error('Invalid user ID');
	}

	if (result.password_hash === null) {
		throw new Error('Password hash not found');
	}

	return result.password_hash;
}

export async function getUserRecoverCode(userId: number): Promise<string> {
	const result = await db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: {
			recovery_code: true,
		},
	});

	if (result === null || result === undefined) {
		throw new Error('Invalid user ID');
	}

	if (result.recovery_code === null) {
		throw new Error('Recovery code not found');
	}

	return decryptString(result.recovery_code);
}

export async function getUserTOTPString(userId: number): Promise<string | null> {
	const result = await db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: {
			totp_key: true,
		},
	});

	if (result === null || result === undefined) {
		throw new Error('Invalid user ID');
	}

	if (result.totp_key === null) {
		return null;
	}

	return decryptString(result.totp_key);
}

export async function updateUserTOTPKey(userId: number, key: string): Promise<void> {
	const encrypted = encryptString(key);
	await db
		.update(users)
		.set({
			totp_key: encrypted,
			registered_2fa: true,
		})
		.where(eq(users.id, userId));
}

export async function resetUserRecoveryCode(userId: number): Promise<string> {
	const recoveryCode = generateRandomRecoveryCode();
	const encrypted = encryptString(recoveryCode);
	await db.update(users).set({ recovery_code: encrypted }).where(eq(users.id, userId));
	return recoveryCode;
}

export async function getUserFromEmail(email: string): Promise<SafeUser | null> {
	const result = await db.query.users.findFirst({
		where: eq(users.email, email),
	});

	if (result === null || result === undefined) {
		return null;
	}

	return returnSafeUser(result);
}

export async function getUserFromGoogleId(googleId: string): Promise<SafeUser | null> {
	const result = await db.query.users.findFirst({
		where: eq(users.google_id, googleId),
	});

	if (result === null || result === undefined) {
		return null;
	}

	return returnSafeUser(result);
}

export async function deleteUser(userId: number): Promise<void> {
	await db.delete(users).where(eq(users.id, userId));
}

export function returnSafeUser(user: User): SafeUser {
	const safeUser: SafeUser = {
		id: user.id,
		email: user.email,
		username: user.username,
		email_verified: user.email_verified,
		registered_2fa: user.registered_2fa,
		google_id: user.google_id,
		photo_url: user.photo_url,
		is_admin: user.is_admin,
		is_super_admin: user.is_super_admin,
		is_developer: user.is_developer,
	};

	return safeUser;
}
