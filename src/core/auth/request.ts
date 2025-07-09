import { RefillingTokenBucket } from '@/core/auth/rate-limit';
import { getClientIP } from '@/core/UserIP';

export const globalBucket = new RefillingTokenBucket<string>(100, 1);

export async function globalGETRateLimit(): Promise<boolean> {
	const clientIP = await getClientIP();
	if (clientIP === null) {
		return true;
	}
	return globalBucket.consume(clientIP, 1);
}

export async function globalPOSTRateLimit(): Promise<boolean> {
	const clientIP = await getClientIP();
	if (clientIP === null) {
		return true;
	}
	return globalBucket.consume(clientIP, 3);
}
