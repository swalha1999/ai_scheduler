import { eq, asc, desc, not, or, sql } from 'drizzle-orm';
import { users, type User } from '@/data/access-layer-v2/schemas/auth.schema';
import { BaseRepository } from './base';
import { userInterfaceSelect } from '../interfaces/user.interface';

export class UsersRepository extends BaseRepository {
	async findAll() {
		return await this.db.select(
			{
				...userInterfaceSelect,
			}
		).from(users).orderBy(asc(users.id));
	}

	async findAllWithoutDevelopers() {
		return await this.db.select(
			{
				...userInterfaceSelect,
			}
		).from(users).where(not(eq(users.is_developer, true))).orderBy(asc(users.id));
	}

	async findWithPagination(sort: 'asc' | 'desc', page: number, limit: number) {
		return await this.db.select(
			{
				...userInterfaceSelect,
			}
		).from(users).orderBy(sort === 'asc' ? asc(users.id) : desc(users.id)).limit(limit).offset((page - 1) * limit);
	}

	async findById(id: number) {
		return await this.db.select(
			{
				...userInterfaceSelect,
			}
		).from(users).where(eq(users.id, id));
	}

	async findByEmail(email: string) {
		return await this.db.select(
			{
				...userInterfaceSelect,
			}
		).from(users).where(eq(users.email, email));
	}

	async create(data: Omit<User, 'id'>) {
		return await this.db.insert(users).values(data).returning();
	}

	async update(id: number, data: Partial<User>) {
		return await this.db.update(users).set(data).where(eq(users.id, id)).returning();
	}

	async delete(id: number) {
		return await this.db.delete(users).where(eq(users.id, id));
	}

	async search(query: string) {
		return await this.db.select(
			{
				...userInterfaceSelect,
			}
		).from(users).where(or(eq(users.email, query), eq(users.username, query)));
	}

	async count() {
		return await this.db.select({ count: sql<number>`count(*)` }).from(users);
	}
} 