import { EmailVerificationTemplate } from '@/components/email-templates/email-verification-template';
import { EmailTestTemplate } from '@/components/email-templates/email-test-template';
import { Resend } from 'resend';
import * as React from 'react';
import { EmailResetPasswordTemplate } from '@/components/email-templates/email-reset-password';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
	to: string,
	subject: string,
	react: React.ReactElement
): Promise<{ data: { id: string } | null; error: { message: string; statusCode: number } | null }> {
	try {
		const { data, error } = await resend.emails.send({
			from: 'Azimh Login <no-reply@techween.io>',
			to: [to],
			subject: subject,
			react: react,
		});
		return {
			data,
			error: error ? { message: error.message, statusCode: 500 } : null,
		};
	} catch (error) {
		return {
			data: null,
			error: {
				message: error instanceof Error ? error.message : 'Unknown error occurred',
				statusCode: 500,
			},
		};
	}
}

export async function sendEmailVerificationCode(to: string, name: string, code: string) {
	return sendEmail(
		to,
		'Email Verification Code',
		EmailVerificationTemplate({
			firstName: name,
			verificationCode: code,
		}) as React.ReactElement
	);
}

export async function sendTestEmail(to: string, name: string, message: string) {
	return sendEmail(
		to,
		'Test Email',
		EmailTestTemplate({
			recipientName: name,
			testMessage: message,
		}) as React.ReactElement
	);
}

export async function sendPasswordResetEmail(to: string, name: string, code: string) {
	return sendEmail(
		to,
		'Password Reset Code',
		EmailResetPasswordTemplate({
			firstName: name,
			resetCode: code,
		}) as React.ReactElement
	);
}
