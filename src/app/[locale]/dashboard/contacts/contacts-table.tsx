import { getTranslations } from 'next-intl/server';
import dal from '@/data/access-layer-v2';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserIcon, PhoneIcon } from 'lucide-react';
import { ContactActions } from '@/components/dashboard/contact-actions';
import { Pagination } from '@/components/dashboard/pagination';

interface ContactsTableProps {
	locale: string;
	currentPage: number;
	pageSize: number;
}

async function getContactsWithPagination(page: number, pageSize: number) {
	try {
		const contacts = await dal.contacts.getContactsWithPagination('desc', page, pageSize);
		const totalCount = await dal.contacts.getContactCount();
		const count: number = Number(totalCount) || 0;
		
		return {
			contacts: contacts || [],
			totalCount: count,
			totalPages: Math.ceil(count / pageSize),
			hasNextPage: page < Math.ceil(count / pageSize),
			hasPrevPage: page > 1,
		};
	} catch (error) {
		console.error('Error fetching contacts:', error);
		return {
			contacts: [],
			totalCount: 0,
			totalPages: 0,
			hasNextPage: false,
			hasPrevPage: false,
		};
	}
}

async function checkContactRestrictions(contactId: number) {
	try {
		const isWhitelisted = await dal.contacts.isWhitelisted(contactId);
		const isBlocked = await dal.contacts.isBlocked(contactId);
		
		return {
			isWhitelisted,
			isBlocked,
			// TODO: Add timeout check when implemented
			isTimedOut: false,
		};
	} catch (error) {
		console.error('Error checking contact restrictions:', error);
		return {
			isWhitelisted: false,
			isBlocked: false,
			isTimedOut: false,
		};
	}
}

export default async function ContactsTable({ locale, currentPage, pageSize }: ContactsTableProps) {
	const t = await getTranslations('dashboard.contacts');
	const { contacts, totalCount, totalPages, hasNextPage, hasPrevPage } = await getContactsWithPagination(currentPage, pageSize);

	const formatDate = (dateString: string | Date) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const formatPhone = (phone: string) => {
		// Clean phone format for display
		return phone.replace('@s.whatsapp.net', '');
	};

	// Get restriction status for contacts (batch check would be more efficient)
	const contactsWithRestrictions = await Promise.all(
		contacts.map(async (contact) => {
			const restrictions = await checkContactRestrictions(contact.id);
			return { ...contact, ...restrictions };
		})
	);

	if (contacts.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				{t('table.noContacts')}
			</div>
		);
	}

	return (
		<>
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t('table.name')}</TableHead>
							<TableHead>{t('table.phone')}</TableHead>
							<TableHead>{t('table.language')}</TableHead>
							<TableHead>{t('table.bookings')}</TableHead>
							<TableHead>{t('table.status')}</TableHead>
							<TableHead>{t('table.createdAt')}</TableHead>
							<TableHead className="w-[50px]">{t('table.actions')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{contactsWithRestrictions.map((contact) => (
							<TableRow key={contact.id}>
								<TableCell>
									<div className="flex items-center gap-2">
										<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
											<UserIcon className="h-4 w-4 text-blue-600" />
										</div>
										<div>
											<div className="font-medium">
												{contact.name || t('table.unnamed')}
											</div>
											{contact.whatsapp_id && (
												<div className="text-xs text-muted-foreground">
													WhatsApp ID
												</div>
											)}
										</div>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										<PhoneIcon className="h-3 w-3 text-muted-foreground" />
										{formatPhone(contact.phone)}
									</div>
								</TableCell>
								<TableCell>
									<Badge variant="outline">
										{contact.preferred_language?.toUpperCase() || 'AR'}
									</Badge>
								</TableCell>
								<TableCell>
									<div className="text-sm">
										<div>{contact.total_bookings || 0} {t('table.total')}</div>
										{(contact.total_cancellations || 0) > 0 && (
											<div className="text-red-500 text-xs">
												{contact.total_cancellations} {t('table.cancelled')}
											</div>
										)}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex gap-1">
										{contact.isWhitelisted && (
											<Badge className="bg-green-100 text-green-800">
												{t('table.whitelisted')}
											</Badge>
										)}
										{contact.isBlocked && (
											<Badge className="bg-red-100 text-red-800">
												{t('table.blocked')}
											</Badge>
										)}
										{!contact.isWhitelisted && !contact.isBlocked && (
											<Badge variant="outline">
												{t('table.statusActive')}
											</Badge>
										)}
									</div>
								</TableCell>
								<TableCell className="text-sm text-muted-foreground">
									{formatDate(contact.created_at)}
								</TableCell>
								<TableCell>
									<ContactActions
										contact={contact}
										isWhitelisted={contact.isWhitelisted}
										isBlocked={contact.isBlocked}
										locale={locale}
										t={t}
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="mt-6">
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					hasNextPage={hasNextPage}
					hasPrevPage={hasPrevPage}
					totalCount={totalCount}
					pageSize={pageSize}
					t={t}
				/>
			</div>
		</>
	);
} 