'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

interface AppointmentsCalendarProps {
	appointments: Appointment[];
	locale: string;
}

export function AppointmentsCalendar({ appointments, locale }: AppointmentsCalendarProps) {
	const t = useTranslations('dashboard.appointments');
	const [currentDate, setCurrentDate] = useState(new Date());
	const [view, setView] = useState<'week' | 'month'>('week');

	// Get week dates starting from Monday
	const getWeekDates = (date: Date) => {
		const start = new Date(date);
		const day = start.getDay();
		const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
		start.setDate(diff);
		
		const weekDates = [];
		for (let i = 0; i < 7; i++) {
			const weekDate = new Date(start);
			weekDate.setDate(start.getDate() + i);
			weekDates.push(weekDate);
		}
		return weekDates;
	};

	const formatTime = (date: Date) => {
		return new Intl.DateTimeFormat(locale, {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		}).format(date);
	};

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat(locale, {
			weekday: 'short',
			day: 'numeric',
			month: 'short'
		}).format(date);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'scheduled': return 'bg-blue-100 text-blue-800';
			case 'completed': return 'bg-green-100 text-green-800';
			case 'cancelled': return 'bg-red-100 text-red-800';
			case 'no_show': return 'bg-gray-100 text-gray-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'consultation': return 'bg-purple-100 text-purple-800';
			case 'follow-up': return 'bg-orange-100 text-orange-800';
			case 'emergency': return 'bg-red-100 text-red-800';
			default: return 'bg-blue-100 text-blue-800';
		}
	};

	const weekDates = getWeekDates(currentDate);
	
	const getAppointmentsForDate = (date: Date) => {
		return appointments.filter(apt => {
			const aptDate = new Date(apt.scheduled_at);
			return aptDate.toDateString() === date.toDateString();
		});
	};

	const navigateWeek = (direction: 'prev' | 'next') => {
		const newDate = new Date(currentDate);
		newDate.setDate(currentDate.getDate() + (direction === 'prev' ? -7 : 7));
		setCurrentDate(newDate);
	};

	return (
		<div className="space-y-4">
			{/* Calendar Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<h3 className="text-lg font-semibold">
						{currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
					</h3>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
							{t('today')}
						</Button>
						<Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button 
						variant={view === 'week' ? 'default' : 'outline'} 
						size="sm"
						onClick={() => setView('week')}
					>
						{t('weekView')}
					</Button>
					<Button 
						variant={view === 'month' ? 'default' : 'outline'} 
						size="sm"
						onClick={() => setView('month')}
					>
						{t('monthView')}
					</Button>
				</div>
			</div>

			{/* Weekly Calendar Grid */}
			{view === 'week' && (
				<div className="grid grid-cols-7 gap-2">
					{weekDates.map((date, index) => {
						const dayAppointments = getAppointmentsForDate(date);
						const isToday = date.toDateString() === new Date().toDateString();
						
						return (
							<Card key={index} className={`${isToday ? 'ring-2 ring-blue-500' : ''}`}>
								<CardContent className="p-4">
									<div className="text-center mb-3">
										<div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
											{formatDate(date)}
										</div>
									</div>
									
									<div className="space-y-2">
										{dayAppointments.length === 0 ? (
											<p className="text-xs text-gray-500 text-center py-4">
												{t('noAppointments')}
											</p>
										) : (
											dayAppointments.map((appointment) => (
												<div 
													key={appointment.id}
													className="bg-white border border-gray-200 rounded-lg p-2 space-y-1"
												>
													<div className="flex items-center justify-between">
														<span className="text-xs font-medium">
															{formatTime(new Date(appointment.scheduled_at))}
														</span>
														<AppointmentActions 
															appointment={appointment}
															locale={locale}
														/>
													</div>
													<div className="text-xs text-gray-900 font-medium">
														{appointment.contact_name}
													</div>
													<div className="flex gap-1">
														<Badge 
															className={`text-xs ${getStatusColor(appointment.status)}`}
															variant="secondary"
														>
															{appointment.status}
														</Badge>
														<Badge 
															className={`text-xs ${getTypeColor(appointment.appointment_type)}`}
															variant="secondary"
														>
															{appointment.appointment_type}
														</Badge>
													</div>
													<div className="text-xs text-gray-500">
														{appointment.duration_minutes} {t('minutes')}
													</div>
												</div>
											))
										)}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			{/* Month View - Simple for now */}
			{view === 'month' && (
				<div className="text-center py-8 text-gray-500">
					<CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
					<p>{t('monthViewComingSoon')}</p>
				</div>
			)}
		</div>
	);
} 