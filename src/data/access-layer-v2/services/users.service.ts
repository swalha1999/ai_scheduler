import { UsersRepository } from '../repositories';
import { BaseService } from './base.service';
import { type User } from '@/data/access-layer-v2/schemas/auth.schema';

export class UsersService extends BaseService {
	private usersRepo = new UsersRepository();

	async getAllUsersWithoutDevelopers() {
		await this.requireAdmin();
		return await this.usersRepo.findAllWithoutDevelopers();
	}

	async getUsersWithPagination(sort: 'asc' | 'desc', page: number, limit: number) {
		await this.requireAdmin();
		return await this.usersRepo.findWithPagination(sort, page, limit);
	}

	async getUserById(id: number) {
		return await this.usersRepo.findById(id);
	}

	async getUserByEmail(email: string) {
		return await this.usersRepo.findByEmail(email);
	}

	async createUser(data: Omit<User, 'id'>) {
		await this.requireSuperAdmin();
		
		const result = await this.usersRepo.create(data);
		
		return result;
	}

	async updateUser(id: number, data: Partial<User>) {
		await this.requireSuperAdmin();
		
		const result = await this.usersRepo.update(id, data);
		
		return result;
	}

	async deleteUser(id: number) {
		await this.requireSuperAdmin();
		
		const result = await this.usersRepo.delete(id);
		
		return result;
	}

	async toggleUserAdmin(id: number) {
		await this.requireSuperAdmin();
		
		const user = await this.usersRepo.findById(id);
		if (!user.length) return null;

		const currentAdminStatus = user[0].is_admin;
		const result = await this.usersRepo.update(id, {
			is_admin: !currentAdminStatus,
		});
		
		return result;
	}

	async toggleUserSuperAdmin(id: number) {
		await this.requireSuperAdmin();
		
		const user = await this.usersRepo.findById(id);
		if (!user.length) return null;

		const currentSuperAdminStatus = user[0].is_super_admin;
		const result = await this.usersRepo.update(id, {
			is_super_admin: !currentSuperAdminStatus,
		});
		
		return result;
	}

	async searchUsers(query: string) {
		await this.requireAdmin();
		return await this.usersRepo.search(query);
	}
} 