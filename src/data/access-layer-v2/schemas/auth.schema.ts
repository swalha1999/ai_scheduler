import { InferSelectModel, relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';
import { files } from './files.schema';

export const users = pgTable(
	'users',
	{
		id: serial('id').primaryKey(),
		is_admin: boolean('is_admin').default(false).notNull(), // this user can see the admin panel
		is_super_admin: boolean('is_super_admin').default(false).notNull(), // this most powerful user and can be seen by the UI
		is_developer: boolean('is_developer').default(false).notNull(), // this most powerful user and its hidden from the UI

		// user data
		email: varchar('email', { length: 255 }).notNull().unique(),
		username: varchar('username', { length: 255 }).notNull(),
		phone: varchar('phone', { length: 255 }),

		// in house auth
		password_hash: varchar('password_hash', { length: 255 }),
		recovery_code: varchar('recovery_code', { length: 255 }),
		totp_key: varchar('totp_key', { length: 255 }),
		email_verified: boolean('email_verified').default(false).notNull(),
		registered_2fa: boolean('registered_2fa').default(false).notNull(),

		// GOOGLE AUTH
		google_id: varchar('google_id', { length: 255 }).unique(),
		photo_url: varchar('photo_url', { length: 255 }), // TODO: update to file table

		// TODO: Add apple auth
	},
	(table) => [
		index('email_index').on(table.email),
		index('username_index').on(table.username),
		index('google_id_index').on(table.google_id),
	]
);

export const users_relations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	emailVerificationRequests: many(email_verification_requests),
	passwordResetSessions: many(password_reset_sessions),
	uploadedFiles: many(files, { relationName: 'uploaded_by' }),
}));

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date',
	}).notNull(),
	two_factor_verified: boolean('two_factor_verified').default(false).notNull(),
});

export const sessions_relations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}));

export const email_verification_requests = pgTable('email_verification_requests', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	email: varchar('email', { length: 255 }).notNull(),
	code: varchar('code', { length: 255 }).notNull(),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date',
	}).notNull(),
});

export const email_verification_requests_relations = relations(
	email_verification_requests,
	({ one }) => ({
		user: one(users, {
			fields: [email_verification_requests.userId],
			references: [users.id],
		}),
	})
);

export const password_reset_sessions = pgTable('password_reset_sessions', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	email: varchar('email', { length: 255 }).notNull(),
	code: varchar('code', { length: 255 }).notNull(),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date',
	}).notNull(),
	emailVerified: boolean('email_verified').default(false).notNull(),
	twoFactorVerified: boolean('two_factor_verified').default(false).notNull(),
});

export const password_reset_sessions_relations = relations(password_reset_sessions, ({ one }) => ({
	user: one(users, {
		fields: [password_reset_sessions.userId],
		references: [users.id],
	}),
}));


//Auth
export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;
export type EmailVerificationRequest = InferSelectModel<typeof email_verification_requests>;
export type PasswordResetSession = InferSelectModel<typeof password_reset_sessions>;


//Safe Types
export type SafeUser = Pick<
	User,
	| 'id'
	| 'email'
	| 'username'
	| 'email_verified'
	| 'registered_2fa'
	| 'google_id'
	| 'photo_url'
	| 'is_admin'
	| 'is_super_admin'
	| 'is_developer'
>;
