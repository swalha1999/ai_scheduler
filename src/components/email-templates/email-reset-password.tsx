import * as React from 'react';

interface EmailResetPasswordTemplateProps {
	firstName: string;
	resetCode: string;
}

export const EmailResetPasswordTemplate: React.FC<Readonly<EmailResetPasswordTemplateProps>> = ({
	firstName,
	resetCode,
}) => (
	<div>
		<h1>Hello, {firstName}!</h1>
		<p>Your password reset code is:</p>
		<h2>{resetCode}</h2>
		<p>Please use this code to reset your password.</p>
		<p>If you didn&apos;t request this code, please ignore this email.</p>
	</div>
);
