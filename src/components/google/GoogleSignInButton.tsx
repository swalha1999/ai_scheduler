import Link from 'next/link';
import { GoogleIcon } from './GoogleIcon';

export function GoogleSignInButton() {
	return (
		//dont prefetch this link
		<Link
			href="/login/google"
			className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
		>
			<GoogleIcon />
			Sign in with Google
		</Link>
	);
}
