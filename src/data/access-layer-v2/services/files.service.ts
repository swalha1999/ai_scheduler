import { FilesRepository } from '../repositories';
import { BaseService } from './base.service';
import { sanitize } from '@/lib/errors';

export class FilesService extends BaseService {
	private filesRepo = new FilesRepository();

	async getFileByName(filename: string) {
		return await this.filesRepo.findByName(filename);
	}

	async getFileById(id: number) {
		return await this.filesRepo.findById(id);
	}

	async createFile(address: string) {
		const { user } = await this.requireAuth();

		const [fileExists, fileError] = await sanitize(this.getFileByName(address));

		if (fileError) {
			throw new Error(fileError.message);
		}

		// Check if fileExists is an array and has items
		if (fileExists && Array.isArray(fileExists) && fileExists.length > 0) {
			return fileExists[0];
		}

		const result = await this.filesRepo.create(address, user.id);

		if (!result || result.length === 0) {
			throw new Error('Failed to create file record');
		}

		return result[0];
	}

	async editFile(fileId: number, address: string) {
		const { user } = await this.requireAuth();

		const result = await this.filesRepo.update(fileId, address, user.id);

		return result;
	}

	async deleteFile(id: number) {
		await this.requireAuth();
		
		const result = await this.filesRepo.delete(id);
		
		return result;
	}
} 