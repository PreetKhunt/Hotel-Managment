import { IUserRepository } from '../domain/repositories/IUserRepository';
import { IRoleRepository } from '../domain/repositories/IRoleRepository';
import { User, UserStatus } from '../domain/entities/User';
import { AppError, ErrorCode } from '../utils/AppError';

export class UserService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly roleRepo: IRoleRepository
  ) {}

  async getUserProfile(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
    return user;
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    // Prevent updating privileged fields via generic profile update
    const safeData = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
    };
    
    return this.userRepo.update(userId, safeData);
  }

  async checkIsLastActiveAdmin(userId: string): Promise<boolean> {
    const userToMutate = await this.userRepo.findById(userId);
    if (!userToMutate || userToMutate.status !== UserStatus.ACTIVE) return false;

    const role = userToMutate.roleId ? await this.roleRepo.findById(userToMutate.roleId) : null;
    if (!role || role.name !== 'Admin') return false;

    // It is an active admin. Are there others?
    const allUsers = await this.userRepo.findAll(UserStatus.ACTIVE);
    const activeAdmins = [];
    
    for (const u of allUsers) {
      if (u.roleId) {
        const uRole = await this.roleRepo.findById(u.roleId);
        if (uRole && uRole.name === 'Admin') {
          activeAdmins.push(u);
        }
      }
    }

    return activeAdmins.length <= 1;
  }

  async updateUserStatus(adminId: string, targetUserId: string, newStatus: UserStatus): Promise<User> {
    if (adminId === targetUserId && newStatus !== UserStatus.ACTIVE) {
      throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
    }

    if (newStatus !== UserStatus.ACTIVE) {
      const isLastAdmin = await this.checkIsLastActiveAdmin(targetUserId);
      if (isLastAdmin) {
        throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
      }
    }

    return this.userRepo.update(targetUserId, { status: newStatus });
  }

  async updateUserRole(adminId: string, targetUserId: string, newRoleId: string): Promise<User> {
    if (adminId === targetUserId) {
      throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
    }

    const currentTarget = await this.userRepo.findById(targetUserId);
    const currentRole = currentTarget?.roleId ? await this.roleRepo.findById(currentTarget.roleId) : null;

    if (currentRole?.name === 'Admin') {
      const newRole = await this.roleRepo.findById(newRoleId);
      if (!newRole || newRole.name !== 'Admin') {
        const isLastAdmin = await this.checkIsLastActiveAdmin(targetUserId);
        if (isLastAdmin) {
          throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
        }
      }
    }

    return this.userRepo.update(targetUserId, { roleId: newRoleId });
  }

  async softDeleteUser(adminId: string, targetUserId: string): Promise<void> {
    if (adminId === targetUserId) {
      throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
    }

    const isLastAdmin = await this.checkIsLastActiveAdmin(targetUserId);
    if (isLastAdmin) {
      throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
    }

    await this.userRepo.delete(targetUserId, adminId);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepo.findAll();
  }
}
