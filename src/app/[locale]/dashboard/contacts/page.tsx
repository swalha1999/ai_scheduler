import { getTranslations } from 'next-intl/server';
import dal from '@/data/access-layer-v2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserIcon, MessageSquareIcon, ShieldIcon, Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import ContactsTable from './contacts-table';

interface PageProps {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ page?: string }>;
}

async function getContactsStats() {
	try {
		const totalCount = await dal.contacts.getContactCount();
		// TODO: Get whitelisted count from DAL when available
		return {
			total: Number(totalCount) || 0,
			whitelisted: 0,
		};
	} catch (error) {
		console.error('Error fetching contact stats:', error);
		return { total: 0, whitelisted: 0 };
	}
}

export default async function ContactsPage({ params, searchParams }: PageProps) {
	const resolvedParams = await params;
	const resolvedSearchParams = await searchParams;
	const t = await getTranslations('dashboard.contacts');
	const currentPage = Number(resolvedSearchParams.page) || 1;
	const pageSize = 25;
	const stats = await getContactsStats();

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">{t('title')}</h1>
					<p className="text-muted-foreground">{t('description')}</p>
				</div>
				<Link href={`/dashboard/contacts/new`}>
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						{t('addContact')}
					</Button>
				</Link>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t('stats.totalContacts')}
						</CardTitle>
						<UserIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
					</CardContent>
				</Card>
				
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t('stats.whitelistedContacts')}
						</CardTitle>
						<ShieldIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.whitelisted.toLocaleString()}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t('stats.recentMessages')}
						</CardTitle>
						<MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">-</div>
						<p className="text-xs text-muted-foreground">{t('stats.comingSoon')}</p>
					</CardContent>
				</Card>
			</div>

			{/* Contacts Table */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UserIcon className="h-5 w-5" />
						{t('table.title')}
					</CardTitle>
					<CardDescription>
						{t('table.description')}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ContactsTable 
						locale={resolvedParams.locale}
						currentPage={currentPage}
						pageSize={pageSize}
					/>
				</CardContent>
			</Card>

			{/* Back to Dashboard */}
			<div className="flex justify-start">
				<Link href={`/${resolvedParams.locale}/dashboard`}>
					<Button variant="outline">
						{t('backToDashboard')}
					</Button>
				</Link>
			</div>
		</div>
	);
} 