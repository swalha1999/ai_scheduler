import { contacts, Contact } from "@/data/access-layer-v2/schemas/contacts.schema";
import { BaseSearchParams } from "./base.interface";

/**
 * Interface for the contacts table
 * @description This interface is used to define the structure of the contacts table
 * @returns {Object} The interface for the contacts table with the following fields:
 */
export const contactInterfaceSelect = {
	id: contacts.id,
	phone: contacts.phone,
	name: contacts.name,
	whatsapp_id: contacts.whatsapp_id,
	preferred_language: contacts.preferred_language,
	total_bookings: contacts.total_bookings,
	total_cancellations: contacts.total_cancellations,
	notes: contacts.notes,
	created_at: contacts.created_at,
	updated_at: contacts.updated_at,
}

export interface ContactSearchParams extends BaseSearchParams {
	phone?: Contact['phone'];
	name?: Contact['name'];
	language?: Contact['preferred_language'];
} 