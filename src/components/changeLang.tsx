'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from './ui/button';
export function ChangeLanguage() {
	const { locale } = useParams();
	const router = useRouter();

	const toggleLocale = () => {
		const pathname = window.location.pathname;
		const newPath = pathname.replace(`/${locale}`, `/${locale === 'ar' ? 'he' : 'ar'}`);
		router.replace(newPath);
	};
	return (
		<div>
			<Button onClick={toggleLocale}>{locale === 'ar' ? 'Hebrew' : 'Arabic'}</Button>
		</div>
	);
}
