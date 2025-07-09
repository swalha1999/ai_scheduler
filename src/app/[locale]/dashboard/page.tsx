import { getTranslations } from 'next-intl/server';

export default async function DashboardPage() {
	const t = await getTranslations('dashboard.page');
	
	return (
		<div className="container mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">
				{t('title')}
			</h1>
			<p className="text-muted-foreground">
				{t('welcome')}
			</p>
		</div>
	);
}
