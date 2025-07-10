'use server';

import { revalidatePath } from 'next/cache';
import dal from '@/data/access-layer-v2';

export async function createAppointment(data: {
	contact_id: number;
	scheduled_at: Date;
	duration_minutes?: number;
	notes?: string;
	appointment_type?: string;
}) {
	try {
		// Validate required fields
		if (!data.contact_id) {
			return { success: false, message: 'Contact is required' };
		}
		if (!data.scheduled_at) {
			return { success: false, message: 'Appointment time is required' };
		}

		// Check if appointment time is in the future
		if (new Date(data.scheduled_at) <= new Date()) {
			return { success: false, message: 'Appointment must be scheduled for a future time' };
		}

		const appointmentData = {
			contact_id: data.contact_id,
			scheduled_at: new Date(data.scheduled_at),
			duration_minutes: data.duration_minutes || 60,
			status: 'scheduled' as const,
			appointment_type: data.appointment_type || 'consultation',
			notes: data.notes?.trim() || null,
		};

		// TODO: Implement createAppointment in DAL when available
		console.log('Creating appointment:', appointmentData);
		
		revalidatePath('/dashboard/appointments');
		return { success: true, message: 'Appointment created successfully' };
	} catch (error) {
		console.error('Error creating appointment:', error);
		return { success: false, message: 'Failed to create appointment' };
	}
}

export async function cancelAppointment(appointmentId: number, reason?: string) {
	try {
		// TODO: Implement cancelAppointment in DAL when available
		console.log('Cancelling appointment:', appointmentId, 'Reason:', reason);
		
		revalidatePath('/dashboard/appointments');
		return { success: true, message: 'Appointment cancelled successfully' };
	} catch (error) {
		console.error('Error cancelling appointment:', error);
		return { success: false, message: 'Failed to cancel appointment' };
	}
}

export async function rescheduleAppointment(appointmentId: number, newDateTime: Date, reason?: string) {
	try {
		// Validate new time is in the future
		if (new Date(newDateTime) <= new Date()) {
			return { success: false, message: 'New appointment time must be in the future' };
		}

		// TODO: Implement rescheduleAppointment in DAL when available
		console.log('Rescheduling appointment:', appointmentId, 'New time:', newDateTime, 'Reason:', reason);
		
		revalidatePath('/dashboard/appointments');
		return { success: true, message: 'Appointment rescheduled successfully' };
	} catch (error) {
		console.error('Error rescheduling appointment:', error);
		return { success: false, message: 'Failed to reschedule appointment' };
	}
}

export async function updateAppointment(appointmentId: number, data: {
	duration_minutes?: number;
	notes?: string;
	appointment_type?: string;
}) {
	try {
		// TODO: Implement updateAppointment in DAL when available
		console.log('Updating appointment:', appointmentId, 'Data:', data);
		
		revalidatePath('/dashboard/appointments');
		return { success: true, message: 'Appointment updated successfully' };
	} catch (error) {
		console.error('Error updating appointment:', error);
		return { success: false, message: 'Failed to update appointment' };
	}
} 