'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { 
	DropdownMenu, 
	DropdownMenuContent, 
	DropdownMenuItem, 
	DropdownMenuTrigger,
	DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
	Dialog, 
	DialogContent, 
	DialogDescription, 
	DialogHeader, 
	DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, Calendar, X, Edit, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cancelAppointment, rescheduleAppointment, updateAppointment } from './actions';

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

interface AppointmentActionsProps {
	appointment: Appointment;
	locale: string;
}

export function AppointmentActions({ appointment, locale }: AppointmentActionsProps) {
	const t = useTranslations('dashboard.appointments.actions');
	const [cancelDialog, setCancelDialog] = useState(false);
	const [rescheduleDialog, setRescheduleDialog] = useState(false);
	const [editDialog, setEditDialog] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [cancelReason, setCancelReason] = useState('');
	const [rescheduleData, setRescheduleData] = useState({
		date: '',
		time: '',
		reason: ''
	});
	const [editData, setEditData] = useState({
		duration_minutes: appointment.duration_minutes,
		appointment_type: appointment.appointment_type,
		notes: appointment.notes || ''
	});

	const handleCancel = async () => {
		setIsSubmitting(true);
		try {
			const result = await cancelAppointment(appointment.id, cancelReason);
			if (result.success) {
				toast.success(result.message);
				setCancelDialog(false);
				setCancelReason('');
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error(t('cancelError'));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleReschedule = async () => {
		if (!rescheduleData.date || !rescheduleData.time) {
			toast.error(t('rescheduleValidation'));
			return;
		}

		setIsSubmitting(true);
		try {
			const newDateTime = new Date(`${rescheduleData.date}T${rescheduleData.time}`);
			const result = await rescheduleAppointment(appointment.id, newDateTime, rescheduleData.reason);
			
			if (result.success) {
				toast.success(result.message);
				setRescheduleDialog(false);
				setRescheduleData({ date: '', time: '', reason: '' });
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error(t('rescheduleError'));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdate = async () => {
		setIsSubmitting(true);
		try {
			const result = await updateAppointment(appointment.id, editData);
			if (result.success) {
				toast.success(result.message);
				setEditDialog(false);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error(t('updateError'));
		} finally {
			setIsSubmitting(false);
		}
	};

	const formatDateTime = (date: Date) => {
		return new Intl.DateTimeFormat(locale, {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	};

	// Only show actions for scheduled appointments
	if (appointment.status !== 'scheduled') {
		return null;
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" className="h-6 w-6 p-0">
						<MoreHorizontal className="h-3 w-3" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => setEditDialog(true)}>
						<Edit className="h-4 w-4 mr-2" />
						{t('edit')}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setRescheduleDialog(true)}>
						<Clock className="h-4 w-4 mr-2" />
						{t('reschedule')}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem 
						onClick={() => setCancelDialog(true)}
						className="text-red-600"
					>
						<X className="h-4 w-4 mr-2" />
						{t('cancel')}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Cancel Dialog */}
			<Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('cancelTitle')}</DialogTitle>
						<DialogDescription>
							{t('cancelDescription', { 
								contact: appointment.contact_name,
								time: formatDateTime(new Date(appointment.scheduled_at))
							})}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="cancel-reason">{t('cancelReason')}</Label>
							<Textarea
								id="cancel-reason"
								value={cancelReason}
								onChange={(e) => setCancelReason(e.target.value)}
								placeholder={t('cancelReasonPlaceholder')}
								rows={3}
							/>
						</div>
						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setCancelDialog(false)}>
								{t('cancelAction')}
							</Button>
							<Button 
								variant="destructive" 
								onClick={handleCancel}
								disabled={isSubmitting}
							>
								{isSubmitting ? t('cancelling') : t('confirmCancel')}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Reschedule Dialog */}
			<Dialog open={rescheduleDialog} onOpenChange={setRescheduleDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('rescheduleTitle')}</DialogTitle>
						<DialogDescription>
							{t('rescheduleDescription', { contact: appointment.contact_name })}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="reschedule-date">{t('newDate')}</Label>
								<Input
									id="reschedule-date"
									type="date"
									value={rescheduleData.date}
									onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
									min={new Date().toISOString().split('T')[0]}
								/>
							</div>
							<div>
								<Label htmlFor="reschedule-time">{t('newTime')}</Label>
								<Input
									id="reschedule-time"
									type="time"
									value={rescheduleData.time}
									onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
								/>
							</div>
						</div>
						<div>
							<Label htmlFor="reschedule-reason">{t('rescheduleReason')}</Label>
							<Textarea
								id="reschedule-reason"
								value={rescheduleData.reason}
								onChange={(e) => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))}
								placeholder={t('rescheduleReasonPlaceholder')}
								rows={2}
							/>
						</div>
						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setRescheduleDialog(false)}>
								{t('cancelAction')}
							</Button>
							<Button onClick={handleReschedule} disabled={isSubmitting}>
								{isSubmitting ? t('rescheduling') : t('confirmReschedule')}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={editDialog} onOpenChange={setEditDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('editTitle')}</DialogTitle>
						<DialogDescription>
							{t('editDescription')}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="duration">{t('duration')}</Label>
							<Input
								id="duration"
								type="number"
								min="15"
								max="240"
								step="15"
								value={editData.duration_minutes}
								onChange={(e) => setEditData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
							/>
						</div>
						<div>
							<Label htmlFor="type">{t('type')}</Label>
							<Input
								id="type"
								value={editData.appointment_type}
								onChange={(e) => setEditData(prev => ({ ...prev, appointment_type: e.target.value }))}
								placeholder={t('typePlaceholder')}
							/>
						</div>
						<div>
							<Label htmlFor="notes">{t('notes')}</Label>
							<Textarea
								id="notes"
								value={editData.notes}
								onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
								placeholder={t('notesPlaceholder')}
								rows={3}
							/>
						</div>
						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setEditDialog(false)}>
								{t('cancelAction')}
							</Button>
							<Button onClick={handleUpdate} disabled={isSubmitting}>
								{isSubmitting ? t('updating') : t('confirmUpdate')}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
} 