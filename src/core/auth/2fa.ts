import { and, eq } from 'drizzle-orm';
import { db } from '@/data';
import { users, sessions } from '@/data/access-layer-v2/schemas/auth.schema';
import { decryptString, encryptString } from '@/core/auth/encryption';
import { ExpiringTokenBucket } from '@/core/auth/rate-limit';
import { generateRandomRecoveryCode } from './utils';

export const totpBucket = new ExpiringTokenBucket<number>(5, 60 * 30);
export const recoveryCodeBucket = new ExpiringTokenBucket<number>(3, 60 * 60);

export async function resetUser2FAWithRecoveryCode(
	userId: number,
	recoveryCode: string
): Promise<boolean> {
	// Note: In Postgres, these queries should be done in a transaction using SELECT FOR UPDATE
	const result = await db.transaction(async (tx) => {
		const user = await tx
			.select({ recoveryCode: users.recovery_code })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1)
			.for('update');

		if (user.length === 0) {
			return false;
		}

		const encryptedRecoveryCode = user[0].recoveryCode;
		if (encryptedRecoveryCode === null) {
			throw new Error('Recovery code not found');
		}
		const userRecoveryCode = decryptString(encryptedRecoveryCode);
		if (recoveryCode !== userRecoveryCode) {
			return false;
		}

		const newRecoveryCode = generateRandomRecoveryCode();
		const encryptedNewRecoveryCode = encryptString(newRecoveryCode);

		await tx
			.update(sessions)
			.set({ two_factor_verified: false })
			.where(eq(sessions.userId, userId));

		const updateResult = await tx
			.update(users)
			.set({
				recovery_code: encryptedNewRecoveryCode,
				totp_key: null,
			})
			.where(and(eq(users.id, userId), eq(users.recovery_code, encryptedRecoveryCode)));

		return (updateResult.length ?? 0) > 0;
	});

	return result;
}
