import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, MessageSquareIcon, ShieldIcon, UserIcon } from 'lucide-react';

export async function DashboardNavigation() {
	const t = await getTranslations('dashboard.navigation');
	
	const navigationItems = [
		{
			title: t('contacts.title'),
			description: t('contacts.description'), 
			href: '/dashboard/contacts',
			icon: UserIcon,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50',
		},
		{
			title: t('appointments.title'),
			description: t('appointments.description'),
			href: '/dashboard/appointments', 
			icon: CalendarIcon,
			color: 'text-green-600',
			bgColor: 'bg-green-50',
		},
		{
			title: t('restrictions.title'),
			description: t('restrictions.description'),
			href: '/dashboard/restrictions',
			icon: ShieldIcon, 
			color: 'text-orange-600',
			bgColor: 'bg-orange-50',
		},
		{
			title: t('messages.title'), 
			description: t('messages.description'),
			href: '/dashboard/messages',
			icon: MessageSquareIcon,
			color: 'text-purple-600', 
			bgColor: 'bg-purple-50',
		},
	];

	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
			{navigationItems.map((item) => {
				const Icon = item.icon;
				return (
					<Link key={item.href} href={item.href}>
						<Card className="hover:shadow-md transition-shadow cursor-pointer">
							<CardHeader className="pb-3">
								<div className={`w-12 h-12 rounded-lg ${item.bgColor} flex items-center justify-center mb-3`}>
									<Icon className={`h-6 w-6 ${item.color}`} />
								</div>
								<CardTitle className="text-lg">{item.title}</CardTitle>
								<CardDescription className="text-sm">
									{item.description}
								</CardDescription>
							</CardHeader>
						</Card>
					</Link>
				);
			})}
		</div>
	);
} 