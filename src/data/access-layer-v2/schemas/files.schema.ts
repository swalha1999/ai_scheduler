import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel, relations } from "drizzle-orm";
import { users } from "./auth.schema";

export const files = pgTable('files', {
	id: serial('id').primaryKey(),
	fileName: varchar('file_name', { length: 255 }).notNull(),
	uploadedBy: integer('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
	uploadedAt: timestamp('uploaded_at', {
		withTimezone: true,
		mode: 'date',
	}).notNull(),
});

export const files_relations = relations(files, ({ one, many }) => ({
	uploadedBy: one(users, {
		fields: [files.uploadedBy],
		references: [users.id],
		relationName: 'uploaded_by',
	}),
}));

export type File = InferSelectModel<typeof files>;