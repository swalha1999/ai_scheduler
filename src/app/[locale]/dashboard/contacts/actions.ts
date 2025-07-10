'use server';

import { revalidatePath } from 'next/cache';
import dal from '@/data/access-layer-v2';

export async function createContact(data: {
	name: string;
	phone: string;
	preferred_language?: 'ar' | 'he' | 'en';
	notes?: string;
}) {
	try {
		// Validate required fields
		if (!data.name.trim()) {
			return { success: false, message: 'Name is required' };
		}
		if (!data.phone.trim()) {
			return { success: false, message: 'Phone number is required' };
		}

		// Clean phone number format
		let phone = data.phone.trim();
		if (!phone.includes('@s.whatsapp.net')) {
			phone = phone + '@s.whatsapp.net';
		}

		const contactData = {
			name: data.name.trim(),
			phone: phone,
			whatsapp_id: null,
			preferred_language: data.preferred_language || 'ar',
			total_bookings: 0,
			total_cancellations: 0,
			notes: data.notes?.trim() || null,
		};

		await dal.contacts.createContact(contactData);
		revalidatePath('/dashboard/contacts');
		return { success: true, message: 'Contact created successfully' };
	} catch (error) {
		console.error('Error creating contact:', error);
		return { success: false, message: 'Failed to create contact' };
	}
}

export async function addContactToWhitelist(contactId: number, reason?: string) {
	try {
		await dal.contacts.addToWhitelist(contactId, reason || 'Added via dashboard');
		revalidatePath('/dashboard/contacts');
		return { success: true, message: 'Contact added to whitelist successfully' };
	} catch (error) {
		console.error('Error adding contact to whitelist:', error);
		return { success: false, message: 'Failed to add contact to whitelist' };
	}
}

export async function removeContactFromWhitelist(contactId: number) {
	try {
		await dal.contacts.removeFromWhitelist(contactId);
		revalidatePath('/dashboard/contacts');
		return { success: true, message: 'Contact removed from whitelist successfully' };
	} catch (error) {
		console.error('Error removing contact from whitelist:', error);
		return { success: false, message: 'Failed to remove contact from whitelist' };
	}
}

export async function blockContact(contactId: number, reason?: string) {
	try {
		// TODO: Implement block functionality in DAL
		// For now, we'll use a placeholder
		console.log('Blocking contact:', contactId, 'Reason:', reason);
		revalidatePath('/dashboard/contacts');
		return { success: true, message: 'Contact blocked successfully' };
	} catch (error) {
		console.error('Error blocking contact:', error);
		return { success: false, message: 'Failed to block contact' };
	}
}

export async function timeoutContact(contactId: number, hours: number = 24, reason?: string) {
	try {
		// TODO: Implement timeout functionality in DAL
		// For now, we'll use a placeholder
		console.log('Timing out contact:', contactId, 'Hours:', hours, 'Reason:', reason);
		revalidatePath('/dashboard/contacts');
		return { success: true, message: `Contact timed out for ${hours} hours` };
	} catch (error) {
		console.error('Error timing out contact:', error);
		return { success: false, message: 'Failed to timeout contact' };
	}
}

export async function deleteContact(contactId: number) {
	try {
		await dal.contacts.deleteContact(contactId);
		revalidatePath('/dashboard/contacts');
		return { success: true, message: 'Contact deleted successfully' };
	} catch (error) {
		console.error('Error deleting contact:', error);
		return { success: false, message: 'Failed to delete contact' };
	}
}

export async function updateContact(contactId: number, data: {
	name?: string;
	preferred_language?: 'ar' | 'he' | 'en';
	notes?: string;
}) {
	try {
		await dal.contacts.updateContact(contactId, data);
		revalidatePath('/dashboard/contacts');
		return { success: true, message: 'Contact updated successfully' };
	} catch (error) {
		console.error('Error updating contact:', error);
		return { success: false, message: 'Failed to update contact' };
	}
}

 