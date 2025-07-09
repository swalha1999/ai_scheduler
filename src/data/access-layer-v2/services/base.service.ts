import { getCurrentSession } from '@/core/auth/session';

export abstract class BaseService {
	protected async requireAuth() {
		const { session, user } = await getCurrentSession();
		
		if (!session || !user) {
			throw new Error('Authentication required');
		}
		
		return { session, user };
	}

	protected async requireAdmin() {
		const { user } = await this.requireAuth();
		
		if (!user.is_admin && !user.is_super_admin) {
			throw new Error('Admin access required');
		}
		
		return user;
	}

	protected async requireSuperAdmin() {
		const { user } = await this.requireAuth();
		
		if (!user.is_super_admin) {
			throw new Error('Super admin access required');
		}
		
		return user;
	}
} 