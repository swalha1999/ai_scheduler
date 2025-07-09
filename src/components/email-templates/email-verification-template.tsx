import * as React from 'react';

interface EmailVerificationTemplateProps {
	firstName: string;
	verificationCode: string;
}

export const EmailVerificationTemplate: React.FC<Readonly<EmailVerificationTemplateProps>> = ({
	firstName,
	verificationCode,
}) => (
	<div>
		<h1>Hello, {firstName}!</h1>
		<p>Your email verification code is:</p>
		<h2>{verificationCode}</h2>
		<p>Please use this code to verify your email address.</p>
		<p>If you didn&apos;t request this code, please ignore this email.</p>
	</div>
);
