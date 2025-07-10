import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import dal from '@/data/access-layer-v2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquareIcon, Send, ArrowDown, User, Calendar } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
	params: Promise<{ locale: string; id: string }>;
}

async function getContact(contactId: number) {
	try {
		const contact = await dal.contacts.getContactById(contactId);
		return contact && contact.length > 0 ? contact[0] : null;
	} catch (error) {
		console.error('Error fetching contact:', error);
		return null;
	}
}

async function getContactMessages(contactId: number) {
	try {
		// TODO: Implement messages fetching in DAL
		// For now using mock data
		return [
			{
				id: 1,
				content: 'Hello, I would like to book an appointment for tomorrow',
				direction: 'inbound' as const,
				message_type: 'text' as const,
				created_at: new Date('2024-01-15T10:30:00Z'),
				status: 'read' as const,
				intent: 'booking' as const,
			},
			{
				id: 2,
				content: 'Sure! What time would work best for you?',
				direction: 'outbound' as const,
				message_type: 'text' as const,
				created_at: new Date('2024-01-15T10:35:00Z'),
				status: 'delivered' as const,
				intent: 'inquiry' as const,
			},
			{
				id: 3,
				content: 'Around 2 PM would be perfect',
				direction: 'inbound' as const,
				message_type: 'text' as const,
				created_at: new Date('2024-01-15T10:40:00Z'),
				status: 'read' as const,
				intent: 'booking' as const,
			},
			{
				id: 4,
				content: 'Great! I have you scheduled for 2 PM tomorrow. See you then!',
				direction: 'outbound' as const,
				message_type: 'text' as const,
				created_at: new Date('2024-01-15T10:45:00Z'),
				status: 'delivered' as const,
				intent: 'booking' as const,
			},
		];
	} catch (error) {
		console.error('Error fetching messages:', error);
		return [];
	}
}

export default async function ContactMessagesPage({ params }: PageProps) {
	const resolvedParams = await params;
	const t = await getTranslations('dashboard.contacts.messages');
	const contactId = parseInt(resolvedParams.id);
	
	if (isNaN(contactId)) {
		notFound();
	}

	const contact = await getContact(contactId);
	if (!contact) {
		notFound();
	}

	const messages = await getContactMessages(contactId);

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat(resolvedParams.locale, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(date);
	};

	const formatPhone = (phone: string) => {
		return phone.replace('@s.whatsapp.net', '');
	};

	const getIntentColor = (intent: string) => {
		switch (intent) {
			case 'booking': return 'bg-green-100 text-green-800';
			case 'cancellation': return 'bg-red-100 text-red-800';
			case 'inquiry': return 'bg-blue-100 text-blue-800';
			case 'greeting': return 'bg-yellow-100 text-yellow-800';
			case 'off_topic': return 'bg-gray-100 text-gray-800';
			case 'abuse': return 'bg-red-200 text-red-900';
			default: return 'bg-gray-100 text-gray-800';
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'sent': return 'bg-blue-100 text-blue-800';
			case 'delivered': return 'bg-green-100 text-green-800';
			case 'read': return 'bg-gray-100 text-gray-800';
			case 'failed': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	};

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
					<p className="text-muted-foreground">
						{t('subtitle', { 
							name: contact.name || t('unnamedContact'), 
							phone: formatPhone(contact.phone) 
						})}
					</p>
				</div>
			</div>

			{/* Contact Info Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						{t('contactInfo')}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<div>
							<div className="text-sm font-medium text-muted-foreground">{t('name')}</div>
							<div className="text-lg">{contact.name || t('unnamedContact')}</div>
						</div>
						<div>
							<div className="text-sm font-medium text-muted-foreground">{t('phone')}</div>
							<div className="text-lg">{formatPhone(contact.phone)}</div>
						</div>
						<div>
							<div className="text-sm font-medium text-muted-foreground">{t('language')}</div>
							<Badge variant="outline">
								{contact.preferred_language?.toUpperCase() || 'AR'}
							</Badge>
						</div>
						<div>
							<div className="text-sm font-medium text-muted-foreground">{t('totalMessages')}</div>
							<div className="text-lg">{messages.length}</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Messages */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MessageSquareIcon className="h-5 w-5" />
						{t('messageHistory')}
					</CardTitle>
					<CardDescription>
						{t('messageHistoryDescription')}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{messages.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							{t('noMessages')}
						</div>
					) : (
						<div className="space-y-4">
							{messages.map((message) => (
								<div
									key={message.id}
									className={`flex ${
										message.direction === 'outbound' ? 'justify-end' : 'justify-start'
									}`}
								>
									<div
										className={`max-w-md rounded-lg p-4 ${
											message.direction === 'outbound'
												? 'bg-blue-500 text-white'
												: 'bg-gray-100 text-gray-900'
										}`}
									>
										{/* Message Header */}
										<div className="flex items-center gap-2 mb-2">
											{message.direction === 'inbound' ? (
												<ArrowDown className="h-4 w-4 text-green-600" />
											) : (
												<Send className="h-4 w-4 text-blue-300" />
											)}
											<span className="text-xs font-medium">
												{message.direction === 'inbound' ? t('received') : t('sent')}
											</span>
											<div className="flex gap-1 ml-auto">
												<Badge 
													className={`text-xs ${getIntentColor(message.intent)}`}
													variant="secondary"
												>
													{message.intent}
												</Badge>
												<Badge 
													className={`text-xs ${getStatusColor(message.status)}`}
													variant="secondary"
												>
													{message.status}
												</Badge>
											</div>
										</div>

										{/* Message Content */}
										<div className="mb-2">
											{message.content}
										</div>

										{/* Message Footer */}
										<div className={`flex items-center gap-1 text-xs ${
											message.direction === 'outbound' ? 'text-blue-200' : 'text-gray-500'
										}`}>
											<Calendar className="h-3 w-3" />
											{formatDate(message.created_at)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
} 