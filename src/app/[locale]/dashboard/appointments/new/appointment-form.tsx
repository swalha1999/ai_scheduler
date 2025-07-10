'use client';

import { useState, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createAppointmentAction } from './actions';
import { useFormStatus } from 'react-dom';

interface Contact {
	id: number;
	name: string | null;
	phone: string;
	preferred_language: 'ar' | 'he' | 'en' | null;
}

interface AppointmentFormProps {
	locale: string;
	contacts: Contact[];
}

function SubmitButton() {
	const { pending } = useFormStatus();
	const t = useTranslations('dashboard.appointments.new');
	
	return (
		<Button type="submit" disabled={pending}>
			{pending ? t('form.creating') : t('form.create')}
		</Button>
	);
}

export function AppointmentForm({ locale, contacts }: AppointmentFormProps) {
	const router = useRouter();
	const t = useTranslations('dashboard.appointments.new');
	const [formData, setFormData] = useState({
		contact_id: '',
		date: '',
		time: '',
		duration_minutes: 60,
		appointment_type: 'consultation',
		notes: '',
	});

	const [state, formAction] = useActionState(createAppointmentAction, null);

	// Handle success - redirect after successful appointment creation
	useEffect(() => {
		if (state?.success) {
			// The redirect will be handled by the server action
			// This is just for any cleanup if needed
		}
	}, [state]);

	const handleInputChange = (field: string, value: string | number) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));
	};

	// Get minimum date/time (current time + 1 hour)
	const getMinDateTime = () => {
		const now = new Date();
		now.setHours(now.getHours() + 1);
		return {
			date: now.toISOString().split('T')[0],
			time: now.toTimeString().slice(0, 5)
		};
	};

	const minDateTime = getMinDateTime();

	return (
		<form action={formAction} className="space-y-6">
			{/* Hidden locale field */}
			<input type="hidden" name="locale" value={locale} />
			
			{/* Contact Selection */}
			<div className="space-y-2">
				<Label htmlFor="contact">{t('form.contact')}</Label>
				<input type="hidden" name="contact_id" value={formData.contact_id} />
				<Select
					value={formData.contact_id}
					onValueChange={(value) => handleInputChange('contact_id', value)}
					required
				>
					<SelectTrigger>
						<SelectValue placeholder={t('form.contactPlaceholder')} />
					</SelectTrigger>
					<SelectContent>
						{contacts.map((contact) => (
							<SelectItem key={contact.id} value={contact.id.toString()}>
								<div className="flex flex-col">
									<span className="font-medium">
										{contact.name || t('form.unnamedContact')}
									</span>
									<span className="text-xs text-muted-foreground">
										{contact.phone}
									</span>
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Date and Time */}
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="date">{t('form.date')}</Label>
					<Input
						id="date"
						name="date"
						type="date"
						value={formData.date}
						onChange={(e) => handleInputChange('date', e.target.value)}
						min={minDateTime.date}
						required
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="time">{t('form.time')}</Label>
					<Input
						id="time"
						name="time"
						type="time"
						value={formData.time}
						onChange={(e) => handleInputChange('time', e.target.value)}
						min={formData.date === minDateTime.date ? minDateTime.time : undefined}
						required
					/>
				</div>
			</div>

			{/* Duration */}
			<div className="space-y-2">
				<Label htmlFor="duration">{t('form.duration')}</Label>
				<input type="hidden" name="duration_minutes" value={formData.duration_minutes} />
				<Select
					value={formData.duration_minutes.toString()}
					onValueChange={(value) => handleInputChange('duration_minutes', parseInt(value))}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="15">15 {t('form.minutes')}</SelectItem>
						<SelectItem value="30">30 {t('form.minutes')}</SelectItem>
						<SelectItem value="45">45 {t('form.minutes')}</SelectItem>
						<SelectItem value="60">60 {t('form.minutes')}</SelectItem>
						<SelectItem value="90">90 {t('form.minutes')}</SelectItem>
						<SelectItem value="120">120 {t('form.minutes')}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Appointment Type */}
			<div className="space-y-2">
				<Label htmlFor="type">{t('form.type')}</Label>
				<input type="hidden" name="appointment_type" value={formData.appointment_type} />
				<Select
					value={formData.appointment_type}
					onValueChange={(value) => handleInputChange('appointment_type', value)}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="consultation">{t('form.typeConsultation')}</SelectItem>
						<SelectItem value="follow-up">{t('form.typeFollowUp')}</SelectItem>
						<SelectItem value="emergency">{t('form.typeEmergency')}</SelectItem>
						<SelectItem value="other">{t('form.typeOther')}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Notes */}
			<div className="space-y-2">
				<Label htmlFor="notes">{t('form.notes')}</Label>
				<Textarea
					id="notes"
					name="notes"
					value={formData.notes}
					onChange={(e) => handleInputChange('notes', e.target.value)}
					placeholder={t('form.notesPlaceholder')}
					rows={4}
				/>
			</div>

			{/* Submit Button */}
			<div className="flex justify-end gap-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
				>
					{t('form.cancel')}
				</Button>
				<SubmitButton />
			</div>
		</form>
	);
} 