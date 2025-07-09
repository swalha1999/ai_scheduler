import AccessibilityButton from '@/components/a11y';
import { ThemeProvider } from '@/components/theme-provider';
import { routing } from '@/i18n/routing';
import { AuthProvider } from '@/providers/auth-provider';
import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import localFont from 'next/font/local';
import { notFound } from 'next/navigation';
import '../globals.css';

const geistSans = localFont({
	src: '../fonts/GeistVF.woff',
	variable: '--font-geist-sans',
	weight: '100 900',
});

const geistMono = localFont({
	src: '../fonts/GeistMonoVF.woff',
	variable: '--font-geist-mono',
	weight: '100 900',
});

const arabic = localFont({
	src: '../fonts/CairoVF.ttf',
	variable: '--font-arabic',
});

// export const metadata: Metadata = {
// 	title: 'عزيمة',
// 	description: 'منصة عزيمة',
// 	icons: {
// 		icon: '/static/fav_1.svg',
// 	},
// };

export default async function RootLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	  }

	return (
		<NextIntlClientProvider>
			<html lang={locale} dir={locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr'} suppressHydrationWarning>
				<body
					className={`${geistSans.variable} ${geistMono.variable} ${arabic.variable} antialiased`}
				>
					<AuthProvider>
						<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
							{children}
							<AccessibilityButton />
						</ThemeProvider>
					</AuthProvider>
				</body>
			</html>
		</NextIntlClientProvider>
	);
}

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}