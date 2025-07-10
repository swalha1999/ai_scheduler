import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MessageSquareIcon, ShieldIcon, UserIcon, TrendingUpIcon } from 'lucide-react';
import dal from '@/data/access-layer-v2';

async function getStats() {
	try {
		// TODO: Add proper stats fetching from DAL
		// For now using mock data until we implement the actual methods
		return {
			totalContacts: 1247,
			totalAppointments: 89,
			totalMessages: 3456,
			whitelistedContacts: 234,
			blockedContacts: 12,
			pendingAppointments: 23,
		};
	} catch (error) {
		console.error('Error fetching stats:', error);
		return {
			totalContacts: 0,
			totalAppointments: 0,
			totalMessages: 0,
			whitelistedContacts: 0,
			blockedContacts: 0,
			pendingAppointments: 0,
		};
	}
}

export async function DashboardStats() {
	const t = await getTranslations('dashboard.stats');
	const stats = await getStats();

	const statCards = [
		{
			title: t('totalContacts'),
			value: stats.totalContacts,
			icon: UserIcon,
			trend: '+12%',
			description: t('fromLastMonth'),
		},
		{
			title: t('pendingAppointments'),
			value: stats.pendingAppointments,
			icon: CalendarIcon,
			trend: '+5%',
			description: t('thisWeek'),
		},
		{
			title: t('totalMessages'),
			value: stats.totalMessages,
			icon: MessageSquareIcon,
			trend: '+18%',
			description: t('fromLastMonth'),
		},
		{
			title: t('whitelistedContacts'),
			value: stats.whitelistedContacts,
			icon: ShieldIcon,
			trend: '+3%',
			description: t('activeContacts'),
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{statCards.map((stat) => {
				const Icon = stat.icon;
				return (
					<Card key={stat.title}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								{stat.title}
							</CardTitle>
							<Icon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
							<div className="flex items-center gap-1 text-xs text-muted-foreground">
								<Badge variant="secondary" className="text-green-600 bg-green-50">
									<TrendingUpIcon className="h-3 w-3 mr-1" />
									{stat.trend}
								</Badge>
								{stat.description}
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
} 