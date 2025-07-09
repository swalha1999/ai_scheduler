import { eq, asc } from 'drizzle-orm';
import { files, type File } from '@/data/access-layer-v2/schemas/files.schema';
import { users } from '@/data/access-layer-v2/schemas/auth.schema';
import { BaseRepository } from './base';
import { fileInterfaceSelect } from '../interfaces/file.interface';

export class FilesRepository extends BaseRepository {
	async findAll() {
		return await this.db.select(
			{
				...fileInterfaceSelect,
			}
		).from(files).leftJoin(users, eq(files.uploadedBy, users.id)).orderBy(asc(files.id));
	}

	async findByName(filename: string) {
		return await this.db.select(
			{
				...fileInterfaceSelect,
			}
		).from(files).leftJoin(users, eq(files.uploadedBy, users.id)).where(eq(files.fileName, filename));
	}

	async findById(id: number) {
		return await this.db.select(
			{
				...fileInterfaceSelect,
			}
		).from(files).leftJoin(users, eq(files.uploadedBy, users.id)).where(eq(files.id, id));
	}

	async create(fileName: string, uploadedBy: number) {
		return await this.db
			.insert(files)
			.values({
				fileName,
				uploadedAt: new Date(),
				uploadedBy,
			})
			.returning();
	}

	async update(fileId: number, fileName: string, uploadedBy: number) {
		return await this.db
			.update(files)
			.set({
				fileName,
				uploadedAt: new Date(),
				uploadedBy,
			})
			.where(eq(files.id, fileId))
			.returning();
	}

	async delete(id: number) {
		return await this.db.delete(files).where(eq(files.id, id));
	}
} 