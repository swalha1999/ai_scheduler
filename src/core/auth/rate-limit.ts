/**
 * A token bucket that refills over time. Useful for rate limiting with recovery.
 * Each bucket has a maximum capacity and refills at a fixed interval.
 * @template _Key The type of the key used to identify different buckets
 */
export class RefillingTokenBucket<_Key> {
	public max: number;
	public refillIntervalSeconds: number;

	/**
	 * @param max Maximum number of tokens each bucket can hold
	 * @param refillIntervalSeconds How often (in seconds) tokens are refilled
	 */
	constructor(max: number, refillIntervalSeconds: number) {
		this.max = max;
		this.refillIntervalSeconds = refillIntervalSeconds;
	}

	private storage = new Map<_Key, RefillBucket>();

	/**
	 * Check if a bucket has enough tokens without consuming them
	 * @param key The bucket identifier
	 * @param cost Number of tokens to check for
	 * @returns True if the bucket has enough tokens, false otherwise
	 */
	public check(key: _Key, cost: number): boolean {
		const bucket = this.storage.get(key) ?? null;
		if (bucket === null) {
			return true;
		}
		const now = Date.now();
		const refill = Math.floor((now - bucket.refilledAt) / (this.refillIntervalSeconds * 1000));
		if (refill > 0) {
			return Math.min(bucket.count + refill, this.max) >= cost;
		}
		return bucket.count >= cost;
	}

	/**
	 * Attempt to consume tokens from a bucket
	 * @param key The bucket identifier
	 * @param cost Number of tokens to consume
	 * @returns True if tokens were consumed, false if not enough tokens
	 */
	public consume(key: _Key, cost: number): boolean {
		let bucket = this.storage.get(key) ?? null;
		const now = Date.now();
		if (bucket === null) {
			bucket = {
				count: this.max - cost,
				refilledAt: now,
			};
			this.storage.set(key, bucket);
			return true;
		}
		const refill = Math.floor((now - bucket.refilledAt) / (this.refillIntervalSeconds * 1000));
		bucket.count = Math.min(bucket.count + refill, this.max);
		bucket.refilledAt = now;
		if (bucket.count < cost) {
			return false;
		}
		bucket.count -= cost;
		this.storage.set(key, bucket);
		return true;
	}
}

/**
 * Implements exponential backoff throttling.
 * Each consecutive request increases the timeout period.
 * @template _Key The type of the key used to identify different throttlers
 */
export class Throttler<_Key> {
	public timeoutSeconds: number[];

	private storage = new Map<_Key, ThrottlingCounter>();

	/**
	 * @param timeoutSeconds Array of timeout periods in seconds, each index represents the timeout for that attempt
	 */
	constructor(timeoutSeconds: number[]) {
		this.timeoutSeconds = timeoutSeconds;
	}

	/**
	 * Attempt an action under throttling rules
	 * @param key The throttler identifier
	 * @returns True if action is allowed, false if throttled
	 */
	public consume(key: _Key): boolean {
		let counter = this.storage.get(key) ?? null;
		const now = Date.now();
		if (counter === null) {
			counter = {
				timeout: 0,
				updatedAt: now,
			};
			this.storage.set(key, counter);
			return true;
		}
		const allowed = now - counter.updatedAt >= this.timeoutSeconds[counter.timeout] * 1000;
		if (!allowed) {
			return false;
		}
		counter.updatedAt = now;
		counter.timeout = Math.min(counter.timeout + 1, this.timeoutSeconds.length - 1);
		this.storage.set(key, counter);
		return true;
	}

	/**
	 * Reset the throttling state for a key
	 * @param key The throttler identifier to reset
	 */
	public reset(key: _Key): void {
		this.storage.delete(key);
	}
}

/**
 * A token bucket that expires after a set time.
 * Once expired, the bucket resets to full capacity.
 * @template _Key The type of the key used to identify different buckets
 */
export class ExpiringTokenBucket<_Key> {
	public max: number;
	public expiresInSeconds: number;

	private storage = new Map<_Key, ExpiringBucket>();

	/**
	 * @param max Maximum number of tokens each bucket can hold
	 * @param expiresInSeconds Time in seconds after which the bucket resets
	 */
	constructor(max: number, expiresInSeconds: number) {
		this.max = max;
		this.expiresInSeconds = expiresInSeconds;
	}

	/**
	 * Check if a bucket has enough tokens without consuming them
	 * @param key The bucket identifier
	 * @param cost Number of tokens to check for
	 * @returns True if the bucket has enough tokens, false otherwise
	 */
	public check(key: _Key, cost: number): boolean {
		const bucket = this.storage.get(key) ?? null;
		const now = Date.now();
		if (bucket === null) {
			return true;
		}
		if (now - bucket.createdAt >= this.expiresInSeconds * 1000) {
			return true;
		}
		return bucket.count >= cost;
	}

	/**
	 * Attempt to consume tokens from a bucket
	 * @param key The bucket identifier
	 * @param cost Number of tokens to consume
	 * @returns True if tokens were consumed, false if not enough tokens
	 */
	public consume(key: _Key, cost: number): boolean {
		let bucket = this.storage.get(key) ?? null;
		const now = Date.now();
		if (bucket === null) {
			bucket = {
				count: this.max - cost,
				createdAt: now,
			};
			this.storage.set(key, bucket);
			return true;
		}
		if (now - bucket.createdAt >= this.expiresInSeconds * 1000) {
			bucket.count = this.max;
		}
		if (bucket.count < cost) {
			return false;
		}
		bucket.count -= cost;
		this.storage.set(key, bucket);
		return true;
	}

	/**
	 * Reset the bucket state for a key
	 * @param key The bucket identifier to reset
	 */
	public reset(key: _Key): void {
		this.storage.delete(key);
	}
}

/**
 * Represents a bucket that refills over time
 */
interface RefillBucket {
	count: number;
	refilledAt: number;
}

/**
 * Represents a bucket that expires after a set time
 */
interface ExpiringBucket {
	count: number;
	createdAt: number;
}

/**
 * Represents a counter for throttling with timeout tracking
 */
interface ThrottlingCounter {
	timeout: number;
	updatedAt: number;
}
