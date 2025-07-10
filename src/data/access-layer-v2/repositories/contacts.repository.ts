import { eq, asc, desc, or, like, sql } from 'drizzle-orm';
import { contacts, type Contact } from '@/data/access-layer-v2/schemas/contacts.schema';
import { BaseRepository } from './base';
import { contactInterfaceSelect } from '../interfaces/contact.interface';

export class ContactsRepository extends BaseRepository {
	async findAll() {
		return await this.db.select(contactInterfaceSelect).from(contacts).orderBy(asc(contacts.id));
	}

	async findWithPagination(sort: 'asc' | 'desc', page: number, limit: number) {
		return await this.db.select(contactInterfaceSelect)
			.from(contacts)
			.orderBy(sort === 'asc' ? asc(contacts.id) : desc(contacts.id))
			.limit(limit)
			.offset((page - 1) * limit);
	}

	async findById(id: number) {
		return await this.db.select(contactInterfaceSelect)
			.from(contacts)
			.where(eq(contacts.id, id));
	}

	async findByPhone(phone: string) {
		return await this.db.select(contactInterfaceSelect)
			.from(contacts)
			.where(eq(contacts.phone, phone));
	}

	async findByWhatsappId(whatsappId: string) {
		return await this.db.select(contactInterfaceSelect)
			.from(contacts)
			.where(eq(contacts.whatsapp_id, whatsappId));
	}

	async create(data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) {
		return await this.db.insert(contacts).values({
			...data,
			created_at: new Date(),
			updated_at: new Date(),
		}).returning();
	}

	async update(id: number, data: Partial<Contact>) {
		return await this.db.update(contacts).set({
			...data,
			updated_at: new Date(),
		}).where(eq(contacts.id, id)).returning();
	}

	async delete(id: number) {
		return await this.db.delete(contacts).where(eq(contacts.id, id));
	}

	async search(query: string) {
		return await this.db.select(contactInterfaceSelect)
			.from(contacts)
			.where(or(
				like(contacts.phone, `%${query}%`),
				like(contacts.name, `%${query}%`),
				like(contacts.whatsapp_id, `%${query}%`)
			));
	}

	async count() {
		return await this.db.select({ count: sql<number>`count(*)` }).from(contacts);
	}

	async findOrCreate(phone: string, whatsappId?: string, name?: string) {
		// First try to find by phone
		const existingContact = await this.findByPhone(phone);
		if (existingContact.length > 0) {
			return existingContact[0];
		}

		// If not found, create new contact
		const newContact = await this.create({
			phone,
			whatsapp_id: whatsappId || null,
			name: name || null,
			preferred_language: 'ar',
			total_bookings: 0,
			total_cancellations: 0,
			notes: null,
		});

		return newContact[0];
	}
} 