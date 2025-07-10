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

export const serviceTypeEnum = pgEnum('service_type', ['haircut', 'haircut_styling', 'coloring', 'treatment', 'other']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']);
export const bookingSourceEnum = pgEnum('booking_source', ['whatsapp', 'web', 'phone', 'walk_in']);

export const appointments = pgTable(
	'appointments',
	{
		id: serial('id').primaryKey(),
		contact_id: integer('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
		service_type: serviceTypeEnum('service_type').default('haircut'),
		duration_minutes: integer('duration_minutes').default(40),
		scheduled_at: timestamp('scheduled_at').notNull(),
		end_time: timestamp('end_time').notNull(),
		status: appointmentStatusEnum('status').default('scheduled'),
		price: integer('price'), // Price in cents/agorot
		customer_notes: text('customer_notes'),
		staff_notes: text('staff_notes'),
		booking_source: bookingSourceEnum('booking_source').default('whatsapp'),
		booking_language: varchar('booking_language', { length: 10 }).default('ar'),
		reminder_sent: boolean('reminder_sent').default(false),
		created_at: timestamp('created_at').notNull().defaultNow(),
		updated_at: timestamp('updated_at').notNull().defaultNow(),
	},
	(table) => [
		index('appointments_contact_id_index').on(table.contact_id),
		index('appointments_scheduled_at_index').on(table.scheduled_at),
		index('appointments_status_index').on(table.status),
		index('appointments_service_type_index').on(table.service_type),
		index('appointments_date_range_index').on(table.scheduled_at, table.end_time),
	]
);

export const appointments_relations = relations(appointments, ({ one }) => ({
	contact: one(contacts, {
		fields: [appointments.contact_id],
		references: [contacts.id],
	}),
}));

export type Appointment = InferSelectModel<typeof appointments>; 