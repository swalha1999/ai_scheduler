import { ContactsRepository } from '../repositories/contacts.repository';
import { ContactRestrictionsRepository } from '../repositories/contact-restrictions.repository';
import { BaseService } from './base.service';
import { type Contact } from '@/data/access-layer-v2/schemas/contacts.schema';
import { sanitize } from '@/lib/errors';

export class ContactsService extends BaseService {
	private contactsRepo = new ContactsRepository();
	private restrictionsRepo = new ContactRestrictionsRepository();

	async getAllContacts() {
		await this.requireAdmin();
		return await this.contactsRepo.findAll();
	}

	async getContactsWithPagination(sort: 'asc' | 'desc', page: number, limit: number, searchParams?: any) {
		await this.requireAdmin();
		return await this.contactsRepo.findWithPagination(sort, page, limit, searchParams);
	}

	async getContactById(id: number) {
		await this.requireAuth();
		return await this.contactsRepo.findById(id);
	}

	async getContactByPhone(phone: string) {
		await this.requireAuth();
		return await this.contactsRepo.findByPhone(phone);
	}

	async getContactByWhatsappId(whatsappId: string) {
		await this.requireAuth();
		return await this.contactsRepo.findByWhatsappId(whatsappId);
	}

	async createContact(data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) {
		await this.requireAuth();
		
		// Check if contact already exists
		const [existingContact, existingError] = await sanitize(this.getContactByPhone(data.phone));
		
		if (existingError) {
			throw new Error(existingError.message);
		}

		if (existingContact && Array.isArray(existingContact) && existingContact.length > 0) {
			throw new Error('Contact with this phone number already exists');
		}

		const result = await this.contactsRepo.create(data);
		
		if (!result || result.length === 0) {
			throw new Error('Failed to create contact');
		}

		return result[0];
	}

	async updateContact(id: number, data: Partial<Contact>) {
		await this.requireAuth();
		
		const result = await this.contactsRepo.update(id, data);
		
		return result;
	}

	async deleteContact(id: number) {
		await this.requireAdmin();
		
		const result = await this.contactsRepo.delete(id);
		
		return result;
	}

	async searchContacts(query: string) {
		await this.requireAuth();
		return await this.contactsRepo.search(query);
	}

	async getContactCount(searchParams?: any) {
		await this.requireAdmin();
		return await this.contactsRepo.count(searchParams);
	}

	// Whitelist-related methods
	async addToWhitelist(contactId: number, reason?: string) {
		const { user } = await this.requireAuth();
		
		// Check if contact exists
		const contact = await this.contactsRepo.findById(contactId);
		if (!contact || contact.length === 0) {
			throw new Error('Contact not found');
		}

		return await this.restrictionsRepo.addToWhitelist(contactId, reason, user.email);
	}

	async addToWhitelistByPhone(phone: string, reason?: string) {
		const { user } = await this.requireAuth();
		
		// Find or create contact
		const contact = await this.contactsRepo.findOrCreate(phone);
		
		return await this.restrictionsRepo.addToWhitelist(contact.id, reason, user.email);
	}

	async removeFromWhitelist(contactId: number) {
		await this.requireAuth();
		
		return await this.restrictionsRepo.removeFromWhitelist(contactId);
	}

	async removeFromWhitelistByPhone(phone: string) {
		await this.requireAuth();
		
		const contact = await this.contactsRepo.findByPhone(phone);
		if (!contact || contact.length === 0) {
			throw new Error('Contact not found');
		}

		return await this.restrictionsRepo.removeFromWhitelist(contact[0].id);
	}

	async getWhitelistedContacts() {
		await this.requireAuth();
		return await this.restrictionsRepo.findWhitelistedContacts();
	}

	async isWhitelisted(contactId: number): Promise<boolean> {
		return await this.restrictionsRepo.isWhitelisted(contactId);
	}

	async isWhitelistedByPhone(phone: string): Promise<boolean> {
		const contact = await this.contactsRepo.findByPhone(phone);
		if (!contact || contact.length === 0) {
			return false;
		}

		return await this.restrictionsRepo.isWhitelisted(contact[0].id);
	}

	async isBlocked(contactId: number): Promise<boolean> {
		return await this.restrictionsRepo.isBlocked(contactId);
	}

	async isBlockedByPhone(phone: string): Promise<boolean> {
		const contact = await this.contactsRepo.findByPhone(phone);
		if (!contact || contact.length === 0) {
			return false;
		}

		return await this.restrictionsRepo.isBlocked(contact[0].id);
	}

	// Auto-create contact when receiving messages
	async findOrCreateContact(phone: string, whatsappId?: string, name?: string) {
		return await this.contactsRepo.findOrCreate(phone, whatsappId, name);
	}

	// Batch operations for better performance
	async getBatchRestrictions(contactIds: number[]) {
		await this.requireAuth();
		return await this.restrictionsRepo.getBatchRestrictions(contactIds);
	}
} 