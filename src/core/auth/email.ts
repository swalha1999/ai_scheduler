import { eq, count } from 'drizzle-orm';

import { db } from '@/data';
import { users } from '@/data/access-layer-v2/schemas/auth.schema';

export function verifyEmailInput(email: string): boolean {
	return /^.+@.+\..+$/.test(email) && email.length < 256;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
	const result = await db.select({ count: count() }).from(users).where(eq(users.email, email));
	return result.length === 0 || result[0].count === 0;
}
