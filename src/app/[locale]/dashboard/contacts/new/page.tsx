import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ContactForm } from './contact-form';

interface PageProps {
	params: Promise<{ locale: string }>;
}

export default async function NewContactPage({ params }: PageProps) {
	const resolvedParams = await params;
	const t = await getTranslations('dashboard.contacts.new');

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Link href={`/${resolvedParams.locale}/dashboard/contacts`}>
					<Button variant="outline" size="sm">
						<ArrowLeft className="h-4 w-4 mr-2" />
						{t('backToContacts')}
					</Button>
				</Link>
				<div className="flex-1">
					<h1 className="text-3xl font-bold">{t('title')}</h1>
					<p className="text-muted-foreground">{t('description')}</p>
				</div>
			</div>

			{/* Form Card */}
			<div className="max-w-2xl mx-auto">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UserPlus className="h-5 w-5" />
							{t('formTitle')}
						</CardTitle>
						<CardDescription>
							{t('formDescription')}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ContactForm locale={resolvedParams.locale} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
} 