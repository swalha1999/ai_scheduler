import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarPlus } from 'lucide-react';
import Link from 'next/link';
import { AppointmentForm } from './appointment-form';
import dal from '@/data/access-layer-v2';

interface PageProps {
	params: Promise<{ locale: string }>;
}

async function getContacts() {
	try {
		// Get all contacts for the dropdown
		const contacts = await dal.contacts.getContactsWithPagination('asc', 1, 1000);
		return contacts;
	} catch (error) {
		console.error('Error fetching contacts:', error);
		return [];
	}
}

export default async function NewAppointmentPage({ params }: PageProps) {
	const resolvedParams = await params;
	const t = await getTranslations('dashboard.appointments.new');
	const contacts = await getContacts();

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Link href={`/dashboard/appointments`}>
					<Button variant="outline" size="sm">
						<ArrowLeft className="h-4 w-4 mr-2" />
						{t('backToAppointments')}
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
							<CalendarPlus className="h-5 w-5" />
							{t('formTitle')}
						</CardTitle>
						<CardDescription>
							{t('formDescription')}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<AppointmentForm 
							locale={resolvedParams.locale}
							contacts={contacts}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
} 