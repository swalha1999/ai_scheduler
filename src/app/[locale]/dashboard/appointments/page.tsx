import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ClockIcon, UserIcon, Plus, Calendar as CalendarComponent } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { AppointmentsCalendar } from './appointments-calendar';
import { AppointmentsList } from './appointments-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PageProps {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ view?: 'calendar' | 'list'; date?: string }>;
}

async function getAppointmentsStats() {
	try {
		// TODO: Implement actual stats fetching from DAL
		return {
			total: 24,
			today: 5,
			upcoming: 18,
			cancelled: 2,
		};
	} catch (error) {
		console.error('Error fetching appointment stats:', error);
		return { total: 0, today: 0, upcoming: 0, cancelled: 0 };
	}
}

async function getAppointments(date?: string) {
	try {
		// TODO: Implement actual appointments fetching from DAL
		// Mock data for demonstration
		return [
			{
				id: 1,
				contact_id: 1,
				contact_name: 'أحمد محمد',
				contact_phone: '1234567890',
				scheduled_at: new Date('2024-01-20T10:00:00Z'),
				duration_minutes: 60,
				status: 'scheduled' as const,
				appointment_type: 'consultation',
				notes: 'أول موعد للاستشارة',
			},
			{
				id: 2,
				contact_id: 2,
				contact_name: 'Sarah Johnson',
				contact_phone: '0987654321',
				scheduled_at: new Date('2024-01-20T14:30:00Z'),
				duration_minutes: 45,
				status: 'scheduled' as const,
				appointment_type: 'follow-up',
				notes: 'متابعة الحالة',
			},
			{
				id: 3,
				contact_id: 3,
				contact_name: 'יוסי כהן',
				contact_phone: '5555555555',
				scheduled_at: new Date('2024-01-21T09:00:00Z'),
				duration_minutes: 90,
				status: 'scheduled' as const,
				appointment_type: 'consultation',
				notes: null,
			},
		];
	} catch (error) {
		console.error('Error fetching appointments:', error);
		return [];
	}
}

export default async function AppointmentsPage({ params, searchParams }: PageProps) {
	const resolvedParams = await params;
	const resolvedSearchParams = await searchParams;
	const t = await getTranslations('dashboard.appointments');
	const view = resolvedSearchParams.view || 'calendar';
	const selectedDate = resolvedSearchParams.date;

	const stats = await getAppointmentsStats();
	const appointments = await getAppointments(selectedDate);

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">{t('title')}</h1>
					<p className="text-muted-foreground">{t('description')}</p>
				</div>
				<Link href={`/dashboard/appointments/new`}>
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						{t('addAppointment')}
					</Button>
				</Link>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t('stats.totalAppointments')}
						</CardTitle>
						<CalendarIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
					</CardContent>
				</Card>
				
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t('stats.todayAppointments')}
						</CardTitle>
						<ClockIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.today}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t('stats.upcomingAppointments')}
						</CardTitle>
						<UserIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.upcoming}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t('stats.cancelledAppointments')}
						</CardTitle>
						<CalendarIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
					</CardContent>
				</Card>
			</div>

			{/* Appointments View */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarComponent className="h-5 w-5" />
						{t('appointmentsView')}
					</CardTitle>
					<CardDescription>
						{t('appointmentsDescription')}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs value={view} className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="calendar">{t('calendarView')}</TabsTrigger>
							<TabsTrigger value="list">{t('listView')}</TabsTrigger>
						</TabsList>
						
						<TabsContent value="calendar" className="mt-6">
							<AppointmentsCalendar 
								appointments={appointments}
								locale={resolvedParams.locale}
							/>
						</TabsContent>
						
						<TabsContent value="list" className="mt-6">
							<AppointmentsList 
								appointments={appointments}
								locale={resolvedParams.locale}
							/>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Back to Dashboard */}
			<div className="flex justify-start">
				<Link href={`/dashboard`}>
					<Button variant="outline">
						{t('backToDashboard')}
					</Button>
				</Link>
			</div>
		</div>
	);
} 