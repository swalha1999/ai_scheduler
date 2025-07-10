'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarIcon, ClockIcon, UserIcon, PhoneIcon } from 'lucide-react';
import { AppointmentActions } from './appointment-actions';

interface Appointment {
	id: number;
	contact_id: number;
	contact_name: string;
	contact_phone: string;
	scheduled_at: Date;
	duration_minutes: number;
	status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
	appointment_type: string;
	notes: string | null;
}

interface AppointmentsListProps {
	appointments: Appointment[];
	locale: string;
}

export function AppointmentsList({ appointments, locale }: AppointmentsListProps) {
	const t = useTranslations('dashboard.appointments');

	const formatDateTime = (date: Date) => {
		return new Intl.DateTimeFormat(locale, {
			weekday: 'long',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	};

	const formatTime = (date: Date) => {
		return new Intl.DateTimeFormat(locale, {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		}).format(date);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'completed': return 'bg-green-100 text-green-800 border-green-200';
			case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
			case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200';
			default: return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'consultation': return 'bg-purple-100 text-purple-800 border-purple-200';
			case 'follow-up': return 'bg-orange-100 text-orange-800 border-orange-200';
			case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
			default: return 'bg-blue-100 text-blue-800 border-blue-200';
		}
	};

	const sortedAppointments = [...appointments].sort((a, b) => 
		new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
	);

	if (sortedAppointments.length === 0) {
		return (
			<div className="text-center py-12 text-gray-500">
				<CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
				<p className="text-lg font-medium">{t('noAppointments')}</p>
				<p className="text-sm">{t('noAppointmentsDescription')}</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{sortedAppointments.map((appointment) => (
				<Card key={appointment.id} className="hover:shadow-md transition-shadow">
					<CardContent className="p-6">
						<div className="flex items-start justify-between">
							<div className="flex-1 space-y-3">
								{/* Header */}
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="p-2 bg-blue-50 rounded-lg">
											<CalendarIcon className="h-5 w-5 text-blue-600" />
										</div>
										<div>
											<h4 className="font-semibold text-lg">{appointment.contact_name}</h4>
											<p className="text-sm text-muted-foreground flex items-center gap-1">
												<PhoneIcon className="h-3 w-3" />
												{appointment.contact_phone}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Badge className={getStatusColor(appointment.status)} variant="outline">
											{t(`status.${appointment.status}`)}
										</Badge>
										<Badge className={getTypeColor(appointment.appointment_type)} variant="outline">
											{appointment.appointment_type}
										</Badge>
									</div>
								</div>

								{/* Date and Time */}
								<div className="flex items-center gap-4 text-sm text-muted-foreground">
									<div className="flex items-center gap-1">
										<CalendarIcon className="h-4 w-4" />
										<span>{formatDateTime(new Date(appointment.scheduled_at))}</span>
									</div>
									<div className="flex items-center gap-1">
										<ClockIcon className="h-4 w-4" />
										<span>{appointment.duration_minutes} {t('minutes')}</span>
									</div>
								</div>

								{/* Notes */}
								{appointment.notes && (
									<div className="bg-gray-50 rounded-lg p-3">
										<p className="text-sm text-gray-700">
											<strong>{t('notes')}:</strong> {appointment.notes}
										</p>
									</div>
								)}

								{/* Time Until Appointment */}
								<div className="text-xs text-muted-foreground">
									{new Date(appointment.scheduled_at) > new Date() ? (
										<span className="text-blue-600">
											{t('timeUntil')}: {getTimeUntilAppointment(new Date(appointment.scheduled_at), locale)}
										</span>
									) : (
										<span className="text-gray-500">
											{appointment.status === 'scheduled' ? t('overdue') : ''}
										</span>
									)}
								</div>
							</div>

							{/* Actions */}
							<div className="ml-4">
								<AppointmentActions 
									appointment={appointment}
									locale={locale}
								/>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function getTimeUntilAppointment(appointmentDate: Date, locale: string): string {
	const now = new Date();
	const diff = appointmentDate.getTime() - now.getTime();
	
	if (diff < 0) return '';
	
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	
	if (days > 0) {
		return `${days} ${days === 1 ? 'day' : 'days'}`;
	} else if (hours > 0) {
		return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
	} else {
		return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
	}
} 