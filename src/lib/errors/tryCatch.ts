// Types for the result object with discriminated union
type Success<T> = [T, null];

type Failure<E> = [null, E];

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper function
export async function sanitize<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
	try {
		const data = await promise;
		return [data, null];
	} catch (error) {
		console.error('Error in sanitize', error);
		return [null, error as E];
	}
}
