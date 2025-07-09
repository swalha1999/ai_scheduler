'use client';

import { useActionState } from 'react';
import { resendEmailVerificationCodeAction, verifyEmailAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const emailVerificationInitialState = {
	message: '',
};

export function EmailVerificationForm() {
	const [state, action] = useActionState(verifyEmailAction, emailVerificationInitialState);
	return (
		<form action={action}>
			<label htmlFor="form-verify.code">الرمز</label>
			<input id="form-verify.code" name="code" required />
			<button>تحقق</button>
			<p>{state.message}</p>
		</form>
	);
}

const resendEmailInitialState = {
	message: '',
};

export function ResendEmailVerificationCodeForm() {
	const [state, action] = useActionState(
		resendEmailVerificationCodeAction,
		resendEmailInitialState
	);
	return (
		<form action={action}>
			<button>إعادة إرسال الرمز</button>
			<p>{state.message}</p>
		</form>
	);
}

const initialState = {
	message: '',
};

export function VerifyEmailForm() {
	const [, action, isPending] = useActionState(verifyEmailAction, initialState);

	return (
		<form action={action} className="flex w-full flex-col">
			<div className="flex flex-col gap-5">
				<div className="w-full">
					<label htmlFor="form-verify-email.code" className="sr-only">
						رمز التحقق
					</label>
					<Input
						type="text"
						id="form-verify-email.code"
						name="code"
						autoComplete="one-time-code"
						required
						className="mt-2.5 h-12 w-full"
						placeholder="رمز التحقق"
					/>
				</div>
			</div>

			<div className="mt-2.5 w-full">
				<Button type="submit" className="mt-2.5 h-12 w-full   " disabled={isPending}>
					{isPending ? 'جاري التحقق...' : 'تحقق'}
				</Button>
			</div>
		</form>
	);
}

export function VerifyEmailFormSkeleton() {
	return (
		<div className="flex w-full flex-col gap-5">
			<Skeleton className="h-12 w-full" />
			<Skeleton className="mt-2.5 h-12 w-full" />
		</div>
	);
}
