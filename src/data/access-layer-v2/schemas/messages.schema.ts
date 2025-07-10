import { InferSelectModel, relations } from 'drizzle-orm';
import {
	boolean,
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

export const messageTypeEnum = pgEnum('message_type', ['text', 'image', 'audio', 'document', 'location', 'video']);
export const messageDirectionEnum = pgEnum('direction', ['inbound', 'outbound']);
export const messageStatusEnum = pgEnum('message_status', ['sent', 'delivered', 'read', 'failed']);
export const messageIntentEnum = pgEnum('intent', ['booking', 'cancellation', 'inquiry', 'greeting', 'off_topic', 'abuse', 'other']);

export const messages = pgTable(
	'messages',
	{
		id: serial('id').primaryKey(),
		contact_id: integer('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
		external_id: varchar('external_id', { length: 255 }),
		content: text('content').notNull(),
		message_type: messageTypeEnum('message_type').default('text'),
		direction: messageDirectionEnum('direction').notNull(),
		status: messageStatusEnum('status').default('sent'),
		language: varchar('language', { length: 10 }),
		intent: messageIntentEnum('intent'),
		is_processed: boolean('is_processed').default(false),
		sent_at: timestamp('sent_at'),
		created_at: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => [
		index('messages_contact_id_index').on(table.contact_id),
		index('messages_direction_index').on(table.direction),
		index('messages_intent_index').on(table.intent),
		index('messages_created_at_index').on(table.created_at),
		index('messages_external_id_index').on(table.external_id),
	]
);

export const messages_relations = relations(messages, ({ one }) => ({
	contact: one(contacts, {
		fields: [messages.contact_id],
		references: [contacts.id],
	}),
}));

export type Message = InferSelectModel<typeof messages>; 