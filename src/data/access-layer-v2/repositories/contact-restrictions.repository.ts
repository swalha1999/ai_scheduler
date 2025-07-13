import { eq, asc, desc, and, or, sql, inArray } from 'drizzle-orm';
import { contact_restrictions, type ContactRestriction } from '@/data/access-layer-v2/schemas/contact-restrictions.schema';
import { contacts } from '@/data/access-layer-v2/schemas/contacts.schema';
import { BaseRepository } from './base';
import { contactInterfaceSelect } from '../interfaces/contact.interface';

export class ContactRestrictionsRepository extends BaseRepository {
	async findAll() {
		return await this.db.select({
			id: contact_restrictions.id,
			contact_id: contact_restrictions.contact_id,
			restriction_type: contact_restrictions.restriction_type,
			status: contact_restrictions.status,
			reason: contact_restrictions.reason,
			added_by: contact_restrictions.added_by,
			timeout_until: contact_restrictions.timeout_until,
			timeout_count: contact_restrictions.timeout_count,
			created_at: contact_restrictions.created_at,
			updated_at: contact_restrictions.updated_at,
			// Contact fields
			phone: contacts.phone,
			name: contacts.name,
		})
		.from(contact_restrictions)
		.leftJoin(contacts, eq(contact_restrictions.contact_id, contacts.id))
		.orderBy(asc(contact_restrictions.id));
	}

	async findByContactId(contactId: number) {
		return await this.db.select()
			.from(contact_restrictions)
			.where(eq(contact_restrictions.contact_id, contactId))
			.orderBy(desc(contact_restrictions.created_at));
	}

	async findActiveRestrictions(contactId: number) {
		return await this.db.select()
			.from(contact_restrictions)
			.where(and(
				eq(contact_restrictions.contact_id, contactId),
				eq(contact_restrictions.status, 'active')
			))
			.orderBy(desc(contact_restrictions.created_at));
	}

	async findWhitelistedContacts() {
		return await this.db.select({
			restriction_id: contact_restrictions.id,
			contact_id: contact_restrictions.contact_id,
			restriction_type: contact_restrictions.restriction_type,
			status: contact_restrictions.status,
			reason: contact_restrictions.reason,
			added_by: contact_restrictions.added_by,
			restriction_created_at: contact_restrictions.created_at,
			restriction_updated_at: contact_restrictions.updated_at,
			// Contact fields
			...contactInterfaceSelect,  
		})
		.from(contact_restrictions)
		.leftJoin(contacts, eq(contact_restrictions.contact_id, contacts.id))
		.where(and(
			eq(contact_restrictions.restriction_type, 'whitelist'),
			eq(contact_restrictions.status, 'active')
		))
		.orderBy(asc(contacts.name));
	}

	async isWhitelisted(contactId: number): Promise<boolean> {
		const result = await this.db.select({ count: sql<number>`count(*)` })
			.from(contact_restrictions)
			.where(and(
				eq(contact_restrictions.contact_id, contactId),
				eq(contact_restrictions.restriction_type, 'whitelist'),
				eq(contact_restrictions.status, 'active')
			));

		return result[0]?.count > 0;
	}

	async isBlocked(contactId: number): Promise<boolean> {
		const result = await this.db.select({ count: sql<number>`count(*)` })
			.from(contact_restrictions)
			.where(and(
				eq(contact_restrictions.contact_id, contactId),
				eq(contact_restrictions.restriction_type, 'blocklist'),
				eq(contact_restrictions.status, 'active')
			));

		return result[0]?.count > 0;
	}

	async create(data: Omit<ContactRestriction, 'id' | 'created_at' | 'updated_at'>) {
		return await this.db.insert(contact_restrictions).values({
			...data,
			created_at: new Date(),
			updated_at: new Date(),
		}).returning();
	}

	async update(id: number, data: Partial<ContactRestriction>) {
		return await this.db.update(contact_restrictions).set({
			...data,
			updated_at: new Date(),
		}).where(eq(contact_restrictions.id, id)).returning();
	}

	async delete(id: number) {
		return await this.db.delete(contact_restrictions).where(eq(contact_restrictions.id, id));
	}

	async addToWhitelist(contactId: number, reason?: string, addedBy?: string) {
		// First deactivate any existing whitelist or blocklist entries for this contact but keep the timeout entries
		await this.db.update(contact_restrictions)
			.set({ status: 'inactive', updated_at: new Date() })
			.where(and(
				eq(contact_restrictions.contact_id, contactId),
				or(
					eq(contact_restrictions.restriction_type, 'whitelist'),
					eq(contact_restrictions.restriction_type, 'blocklist')
				),
                eq(contact_restrictions.status, 'active')
			));

		// Add new whitelist entry
		return await this.create({
			contact_id: contactId,
			restriction_type: 'whitelist',
			status: 'active',
			reason: reason || 'Added to whitelist',
			added_by: addedBy || 'system',
			timeout_until: null,
			timeout_count: null,
		});
	}

	async removeFromWhitelist(contactId: number) {
		return await this.db.update(contact_restrictions)
			.set({ status: 'inactive', updated_at: new Date() })
			.where(and(
				eq(contact_restrictions.contact_id, contactId),
				eq(contact_restrictions.restriction_type, 'whitelist'),
				eq(contact_restrictions.status, 'active')
			))
			.returning();
	}

	async addToBlocklist(contactId: number, reason?: string, addedBy?: string) {
		// First deactivate any existing blocklist entries for this contact
		await this.db.update(contact_restrictions)
			.set({ status: 'inactive', updated_at: new Date() })
			.where(and(
				eq(contact_restrictions.contact_id, contactId),
				eq(contact_restrictions.status, 'active')
			));

		// Add new blocklist entry
		return await this.create({
			contact_id: contactId,
			restriction_type: 'blocklist',
			status: 'active',
			reason: reason || 'Added to blocklist',
			added_by: addedBy || 'system',
			timeout_until: null,
			timeout_count: null,
		});
	}

	async removeFromBlocklist(contactId: number) {
		return await this.db.update(contact_restrictions)
			.set({ status: 'inactive', updated_at: new Date() })
			.where(and(
				eq(contact_restrictions.contact_id, contactId),
				eq(contact_restrictions.restriction_type, 'blocklist'),
				eq(contact_restrictions.status, 'active')
			))
			.returning();
	}

	// Batch operations for better performance
	async getBatchRestrictions(contactIds: number[]): Promise<{ [contactId: number]: { isWhitelisted: boolean; isBlocked: boolean } }> {
		if (contactIds.length === 0) return {};

		const restrictions = await this.db.select({
			contact_id: contact_restrictions.contact_id,
			restriction_type: contact_restrictions.restriction_type,
		})
		.from(contact_restrictions)
		.where(and(
			inArray(contact_restrictions.contact_id, contactIds),
			eq(contact_restrictions.status, 'active'),
			or(
				eq(contact_restrictions.restriction_type, 'whitelist'),
				eq(contact_restrictions.restriction_type, 'blocklist')
			)
		));

		const result: { [contactId: number]: { isWhitelisted: boolean; isBlocked: boolean } } = {};

		// Initialize all contacts with false values
		contactIds.forEach(id => {
			result[id] = { isWhitelisted: false, isBlocked: false };
		});

		// Update based on actual restrictions
		restrictions.forEach(restriction => {
			if (restriction.restriction_type === 'whitelist') {
				result[restriction.contact_id].isWhitelisted = true;
			} else if (restriction.restriction_type === 'blocklist') {
				result[restriction.contact_id].isBlocked = true;
			}
		});

		return result;
	}
} 