import { getTranslations } from 'next-intl/server';
import dal from '@/data/access-layer-v2';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserIcon, PhoneIcon } from 'lucide-react';
import { ContactActions } from '@/components/dashboard/contact-actions';
import { Pagination } from '@/components/dashboard/pagination';
import { TableSearchInput } from '@/components/dashboard/table-search-input';

interface ContactsTableProps {
	locale: string;
	currentPage: number;
	pageSize: number;
	searchParams: {
		name?: string;
		phone?: string;
		language?: string;
		status?: string;
	};
}

async function getContactsWithPagination(page: number, pageSize: number, searchParams: any) {
	try {
		const contacts = await dal.contacts.getContactsWithPagination('desc', page, pageSize, searchParams);
		const totalCountResult = await dal.contacts.getContactCount(searchParams);
		// The count method returns an array with an object containing the count
		const count: number = Number(totalCountResult[0]?.count) || 0;
		
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



export default async function ContactsTable({ locale, currentPage, pageSize, searchParams }: ContactsTableProps) {
	const t = await getTranslations('dashboard.contacts');
	const { contacts, totalCount, totalPages, hasNextPage, hasPrevPage } = await getContactsWithPagination(currentPage, pageSize, searchParams);

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

	// Get restriction status for contacts using batch operation
	const contactIds = contacts.map(contact => contact.id);
	const batchRestrictions = await dal.contacts.getBatchRestrictions(contactIds);
	
	const contactsWithRestrictions = contacts.map(contact => {
		const restrictions = batchRestrictions[contact.id] || { isWhitelisted: false, isBlocked: false };
		return { 
			...contact, 
			isWhitelisted: restrictions.isWhitelisted,
			isBlocked: restrictions.isBlocked,
			isTimedOut: false // TODO: Add timeout check when implemented
		};
	});

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
						<TableRow>
							<TableHead className="p-2">
								<TableSearchInput
									placeholder={t('table.searchName')}
									searchKey="name"
									className="w-full"
								/>
							</TableHead>
							<TableHead className="p-2">
								<TableSearchInput
									placeholder={t('table.searchPhone')}
									searchKey="phone"
									className="w-full"
								/>
							</TableHead>
							<TableHead className="p-2">
								<TableSearchInput
									placeholder={t('table.searchLanguage')}
									searchKey="language"
									className="w-full"
								/>
							</TableHead>
							<TableHead className="p-2">
								{/* No search for bookings */}
							</TableHead>
							<TableHead className="p-2">
								<TableSearchInput
									placeholder={t('table.searchStatus')}
									searchKey="status"
									className="w-full"
								/>
							</TableHead>
							<TableHead className="p-2">
								{/* No search for created date */}
							</TableHead>
							<TableHead className="p-2">
								{/* No search for actions */}
							</TableHead>
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
				/>
			</div>
		</>
	);
} 