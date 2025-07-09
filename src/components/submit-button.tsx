'use client';

import { useFormStatus } from 'react-dom';
import { Button, ButtonProps } from '@/components/ui/button';

export default function SubmitButton({ children, ...props }: ButtonProps) {
	const status = useFormStatus();
	return (
		<Button type="submit" disabled={status.pending} {...props}>
			{status.pending ? 'جاري التحميل...' : children}
		</Button>
	);
}
