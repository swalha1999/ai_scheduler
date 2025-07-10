import { getTranslations } from 'next-intl/server';
import { DashboardNavigation } from '@/components/dashboard/dashboard-navigation'
import { DashboardStats } from '@/components/dashboard/dashboard-stats';

export default async function DashboardPage() {
	const t = await getTranslations('dashboard.page');
	
	return (
		<div className="container mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">
				{t('title')}
			</h1>
			<p className="text-muted-foreground mb-8">
				{t('welcome')}
			</p>
			
			<DashboardStats />
			
			<div className="mt-8">
				<DashboardNavigation />
			</div>
		</div>
	);
}
