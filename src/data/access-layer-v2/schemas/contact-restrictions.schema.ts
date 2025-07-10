import { InferSelectModel, relations } from 'drizzle-orm';
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
import { contacts } from './contacts.schema';

export const restrictionTypeEnum = pgEnum('restriction_type', ['blocklist', 'whitelist', 'timeout']);
export const restrictionStatusEnum = pgEnum('restriction_status', ['active', 'inactive', 'expired']);

// Contact restrictions table - handles blocklist, whitelist, and timeouts
// we have this like that so we can have a history of the restrictions and the reason for the restriction and not just the last one

export const contact_restrictions = pgTable(
	'contact_restrictions',
	{
		id: serial('id').primaryKey(),
		contact_id: integer('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
		restriction_type: restrictionTypeEnum('restriction_type').notNull(),
		status: restrictionStatusEnum('status').notNull().default('active'),
		reason: text('reason'),
		added_by: varchar('added_by', { length: 255 }),
		
		// Timeout specific fields (only used when restriction_type = 'timeout')
		timeout_until: timestamp('timeout_until'),
		timeout_count: integer('timeout_count').default(1),
		
		created_at: timestamp('created_at').notNull().defaultNow(),
		updated_at: timestamp('updated_at').notNull().defaultNow(),
	},
	(table) => [
		index('contact_restrictions_contact_id_index').on(table.contact_id),
		index('contact_restrictions_type_index').on(table.restriction_type),
		index('contact_restrictions_status_index').on(table.status),
		index('contact_restrictions_timeout_until_index').on(table.timeout_until),
	]
);

export const contact_restrictions_relations = relations(contact_restrictions, ({ one }) => ({
	contact: one(contacts, {
		fields: [contact_restrictions.contact_id],
		references: [contacts.id],
	}),
}));

export type ContactRestriction = InferSelectModel<typeof contact_restrictions>; 