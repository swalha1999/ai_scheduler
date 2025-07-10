'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const appointmentSchema = z.object({
	contact_id: z.string().min(1, 'Contact is required').transform(Number),
	date: z.string().min(1, 'Date is required'),
	time: z.string().min(1, 'Time is required'),
	duration_minutes: z.string().transform(Number).default('60'),
	appointment_type: z.string().min(1, 'Appointment type is required'),
	notes: z.string().optional(),
	locale: z.string().min(1, 'Locale is required'),
});

type ActionState = {
	success: boolean;
	message: string;
	errors?: Record<string, string[]>;
};

export async function createAppointmentAction(
	prevState: ActionState | null,
	formData: FormData
): Promise<ActionState> {
	try {
		// Parse and validate form data
		const rawData = {
			contact_id: formData.get('contact_id') as string,
			date: formData.get('date') as string,
			time: formData.get('time') as string,
			duration_minutes: formData.get('duration_minutes') as string,
			appointment_type: formData.get('appointment_type') as string,
			notes: formData.get('notes') as string,
			locale: formData.get('locale') as string,
		};

		const validationResult = appointmentSchema.safeParse(rawData);

		if (!validationResult.success) {
			return {
				success: false,
				message: 'Please fix the validation errors',
				errors: validationResult.error.flatten().fieldErrors,
			};
		}

		const { contact_id, date, time, duration_minutes, appointment_type, notes, locale } = validationResult.data;

		// Check if appointment time is in the future
		const scheduledAt = new Date(`${date}T${time}`);
		if (scheduledAt <= new Date()) {
			return {
				success: false,
				message: 'Appointment must be scheduled for a future time',
			};
		}

		const appointmentData = {
			contact_id,
			scheduled_at: scheduledAt,
			duration_minutes,
			status: 'scheduled' as const,
			appointment_type,
			notes: notes?.trim() || null,
		};

		// TODO: Implement createAppointment in DAL when available
		console.log('Creating appointment:', appointmentData);
		
		revalidatePath('/dashboard/appointments');
		redirect(`/${locale}/dashboard/appointments`);
	} catch (error) {
		console.error('Error creating appointment:', error);
		return {
			success: false,
			message: 'Failed to create appointment. Please try again.',
		};
	}
} 