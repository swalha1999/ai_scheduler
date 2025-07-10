import { InferSelectModel } from 'drizzle-orm';
import {
	index,
	integer,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';

export const languageEnum = pgEnum('language', ['ar', 'he', 'en']);

export const contacts = pgTable(
	'contacts',
	{
		id: serial('id').primaryKey(),
		phone: varchar('phone', { length: 255 }).notNull().unique(),
		name: varchar('name', { length: 255 }),
		whatsapp_id: varchar('whatsapp_id', { length: 255 }),
		preferred_language: languageEnum('preferred_language').default('ar'),
		total_bookings: integer('total_bookings').default(0),
		total_cancellations: integer('total_cancellations').default(0),
		notes: text('notes'),
		created_at: timestamp('created_at').notNull().defaultNow(),
		updated_at: timestamp('updated_at').notNull().defaultNow(),
	},
	(table) => [
		index('contacts_phone_index').on(table.phone),
		index('contacts_whatsapp_id_index').on(table.whatsapp_id),
	]
);

export type Contact = InferSelectModel<typeof contacts>; 