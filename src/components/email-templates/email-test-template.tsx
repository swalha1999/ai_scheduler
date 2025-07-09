import * as React from 'react';

interface EmailTestTemplateProps {
	recipientName: string;
	testMessage: string;
}

export const EmailTestTemplate: React.FC<Readonly<EmailTestTemplateProps>> = ({
	recipientName,
	testMessage,
}) => (
	<div>
		<h1>Hello, {recipientName}!</h1>
		<p>This is a test email to verify that our email system is working correctly.</p>
		<h2>Test Message: {testMessage}</h2>
		<p>
			If you received this email, it means our email delivery system is functioning properly.
		</p>
		<p>Thank you for helping us test our email functionality.</p>
	</div>
);
