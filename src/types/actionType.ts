
export type ActionResult =
	| {
			message?: string;
			is_success?: boolean;
			data?: unknown;
			locale?: string;
	  }
	| never;
