// Export all schema tables and enums
export * from './contacts.schema';
export * from './contact-restrictions.schema';
export * from './messages.schema';
export * from './appointments.schema';

// Export existing schemas
export * from './auth.schema';
export * from './files.schema';

// Re-export types for convenience
export type {
	Contact,
} from './contacts.schema';

export type {
	ContactRestriction,
} from './contact-restrictions.schema';

export type {
	Message,
} from './messages.schema';

export type {
	Appointment,
} from './appointments.schema';

export type {
	User,
	SafeUser,
	Session,
	EmailVerificationRequest,
	PasswordResetSession,
} from './auth.schema';

export type {
	File,
} from './files.schema'; 