import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as authSchema from './access-layer-v2/schemas/auth.schema';
import * as filesSchema from './access-layer-v2/schemas/files.schema';


// Merge schemas
const mergedSchema = {
	...authSchema,
	...filesSchema,
};

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, {
	ssl: false,
	max: 1,
});

export const db = drizzle(client, {
	schema: mergedSchema,
});
